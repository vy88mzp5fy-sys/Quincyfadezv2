from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import stripe


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Secret Stripe credentials always remain server-side.
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class PaymentSetupConfirm(BaseModel):
    client_key: str = Field(min_length=12, max_length=128)
    confirmation_token_id: str = Field(min_length=8, max_length=255)


class PaymentVerifyRequest(BaseModel):
    client_key: str = Field(min_length=12, max_length=128)


class PaymentClientRequest(BaseModel):
    client_key: str = Field(min_length=12, max_length=128)


class PaymentMethodSummary(BaseModel):
    brand: Optional[str] = None
    last4: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None


def _stripe_ready() -> None:
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured on the server yet.")


def _card_summary(payment_method):
    card = getattr(payment_method, "card", None)
    return {
        "brand": getattr(card, "brand", None) if card else None,
        "last4": getattr(card, "last4", None) if card else None,
        "exp_month": getattr(card, "exp_month", None) if card else None,
        "exp_year": getattr(card, "exp_year", None) if card else None,
    }


async def _get_or_create_stripe_customer(client_key: str) -> str:
    existing = await db.payment_customers.find_one(
        {"client_key": client_key},
        {"_id": 0, "stripe_customer_id": 1},
    )
    if existing and existing.get("stripe_customer_id"):
        return existing["stripe_customer_id"]

    customer = stripe.Customer.create(metadata={"quincyfadez_client_key": client_key})
    now = datetime.now(timezone.utc).isoformat()
    await db.payment_customers.update_one(
        {"client_key": client_key},
        {
            "$set": {
                "client_key": client_key,
                "stripe_customer_id": customer.id,
                "created_at": now,
                "updated_at": now,
            }
        },
        upsert=True,
    )
    return customer.id


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.get("/payments/config")
async def payment_config():
    publishable_key = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
    if not publishable_key:
        raise HTTPException(status_code=503, detail="Stripe publishable key is not configured yet.")
    return {"publishable_key": publishable_key}


@api_router.post("/payments/confirm-setup")
async def confirm_payment_setup(input: PaymentSetupConfirm):
    """Create and confirm a SetupIntent from Stripe's ConfirmationToken."""
    _stripe_ready()
    customer_id = await _get_or_create_stripe_customer(input.client_key)

    try:
        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            confirmation_token=input.confirmation_token_id,
            confirm=True,
            usage="off_session",
            automatic_payment_methods={"enabled": True},
            metadata={"quincyfadez_client_key": input.client_key},
        )
    except stripe.StripeError as exc:
        logger.warning("Stripe SetupIntent failed: %s", getattr(exc, "user_message", None) or str(exc))
        raise HTTPException(
            status_code=400,
            detail=getattr(exc, "user_message", None) or "Stripe could not set up this payment method.",
        ) from exc

    await db.payment_customers.update_one(
        {"client_key": input.client_key},
        {
            "$set": {
                "latest_setup_intent_id": setup_intent.id,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )
    return {"client_secret": setup_intent.client_secret}


@api_router.post("/payments/customer-session")
async def create_payment_customer_session(input: PaymentClientRequest):
    """Create a short-lived CustomerSession for Stripe's Payment Method Settings Sheet."""
    _stripe_ready()
    customer_id = await _get_or_create_stripe_customer(input.client_key)
    try:
        session = stripe.CustomerSession.create(
            customer=customer_id,
            components={
                "customer_sheet": {
                    "enabled": True,
                    "features": {
                        "payment_method_remove": "enabled",
                        "payment_method_allow_redisplay_filters": [
                            "always",
                            "limited",
                            "unspecified",
                        ],
                    },
                }
            },
        )
    except stripe.StripeError as exc:
        logger.warning("Stripe CustomerSession failed: %s", str(exc))
        raise HTTPException(status_code=400, detail="Payment settings are unavailable right now.") from exc

    return {
        "customer": customer_id,
        "customer_session_client_secret": session.client_secret,
    }


@api_router.post("/payments/customer-sheet-setup")
async def create_customer_sheet_setup_intent(input: PaymentClientRequest):
    """Create a SetupIntent used when a customer adds a card from Account settings."""
    _stripe_ready()
    customer_id = await _get_or_create_stripe_customer(input.client_key)
    try:
        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            usage="off_session",
            automatic_payment_methods={"enabled": True},
            metadata={"quincyfadez_client_key": input.client_key, "source": "account_settings"},
        )
    except stripe.StripeError as exc:
        logger.warning("Stripe CustomerSheet SetupIntent failed: %s", str(exc))
        raise HTTPException(status_code=400, detail="A new payment method could not be prepared.") from exc

    return {"setup_intent_client_secret": setup_intent.client_secret}


@api_router.post("/payments/verify")
async def verify_payment_setup(input: PaymentVerifyRequest):
    """Verify that an attached Stripe payment method exists before booking is unlocked."""
    _stripe_ready()
    record = await db.payment_customers.find_one(
        {"client_key": input.client_key},
        {"_id": 0, "latest_setup_intent_id": 1, "stripe_customer_id": 1},
    )
    customer_id = (record or {}).get("stripe_customer_id")
    if not customer_id:
        return {"verified": False, "reason": "No payment customer exists yet."}

    # First check the currently attached card methods. This also means removing a
    # card in CustomerSheet immediately locks booking again rather than trusting
    # an old successful SetupIntent.
    try:
        payment_methods = stripe.Customer.list_payment_methods(customer_id, type="card", limit=10)
    except stripe.StripeError as exc:
        logger.warning("Stripe payment method lookup failed: %s", str(exc))
        raise HTTPException(status_code=400, detail="Payment method verification failed.") from exc

    attached = list(getattr(payment_methods, "data", []) or [])
    if attached:
        preferred_id = (record or {}).get("stripe_payment_method_id")
        payment_method = next((pm for pm in attached if pm.id == preferred_id), attached[0])
        summary = _card_summary(payment_method)
        now = datetime.now(timezone.utc).isoformat()
        await db.payment_customers.update_one(
            {"client_key": input.client_key},
            {
                "$set": {
                    "verified": True,
                    "stripe_payment_method_id": payment_method.id,
                    "payment_method_summary": summary,
                    "verified_at": now,
                    "updated_at": now,
                }
            },
        )
        return {"verified": True, "payment_method": summary}

    setup_intent_id = (record or {}).get("latest_setup_intent_id")
    if setup_intent_id:
        try:
            setup_intent = stripe.SetupIntent.retrieve(setup_intent_id)
            if setup_intent.status == "succeeded" and setup_intent.payment_method:
                payment_method = stripe.PaymentMethod.retrieve(setup_intent.payment_method)
                # A method removed in Account has customer=None, so never treat it as verified.
                if getattr(payment_method, "customer", None) == customer_id:
                    summary = _card_summary(payment_method)
                    now = datetime.now(timezone.utc).isoformat()
                    await db.payment_customers.update_one(
                        {"client_key": input.client_key},
                        {
                            "$set": {
                                "verified": True,
                                "stripe_payment_method_id": payment_method.id,
                                "payment_method_summary": summary,
                                "verified_at": now,
                                "updated_at": now,
                            }
                        },
                    )
                    return {"verified": True, "payment_method": summary}
        except stripe.StripeError as exc:
            logger.warning("Stripe SetupIntent verification failed: %s", str(exc))

    await db.payment_customers.update_one(
        {"client_key": input.client_key},
        {
            "$set": {
                "verified": False,
                "stripe_payment_method_id": None,
                "payment_method_summary": None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return {"verified": False, "reason": "No saved payment method is attached."}


app.include_router(api_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

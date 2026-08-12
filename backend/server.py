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

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe is deliberately configured from server-side environment variables only.
# Never place STRIPE_SECRET_KEY in the mobile app or commit it to this repository.
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

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


class PaymentMethodSummary(BaseModel):
    brand: Optional[str] = None
    last4: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None


def _stripe_ready() -> None:
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured on the server yet.")


async def _get_or_create_stripe_customer(client_key: str) -> str:
    existing = await db.payment_customers.find_one(
        {"client_key": client_key},
        {"_id": 0, "stripe_customer_id": 1},
    )
    if existing and existing.get("stripe_customer_id"):
        return existing["stripe_customer_id"]

    customer = stripe.Customer.create(
        metadata={"quincyfadez_client_key": client_key}
    )
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


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks


@api_router.get("/payments/config")
async def payment_config():
    """Return only the publishable Stripe key. Secret credentials stay server-side."""
    publishable_key = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
    if not publishable_key:
        raise HTTPException(status_code=503, detail="Stripe publishable key is not configured yet.")
    return {"publishable_key": publishable_key}


@api_router.post("/payments/confirm-setup")
async def confirm_payment_setup(input: PaymentSetupConfirm):
    """
    Create and confirm a SetupIntent from Stripe's ConfirmationToken.
    No card number, CVC or raw payment details pass through QuincyFadez.
    """
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

    # The client secret is returned only to the requesting app so Stripe's SDK
    # can complete any required authentication. It is never persisted here.
    return {"client_secret": setup_intent.client_secret}


@api_router.post("/payments/verify")
async def verify_payment_setup(input: PaymentVerifyRequest):
    """Verify SetupIntent success server-side before the booking button unlocks."""
    _stripe_ready()
    record = await db.payment_customers.find_one(
        {"client_key": input.client_key},
        {"_id": 0, "latest_setup_intent_id": 1},
    )
    setup_intent_id = (record or {}).get("latest_setup_intent_id")
    if not setup_intent_id:
        return {"verified": False, "reason": "No payment setup is pending."}

    try:
        setup_intent = stripe.SetupIntent.retrieve(setup_intent_id)
    except stripe.StripeError as exc:
        logger.warning("Stripe SetupIntent verification failed: %s", str(exc))
        raise HTTPException(status_code=400, detail="Payment method verification failed.") from exc

    if setup_intent.status != "succeeded" or not setup_intent.payment_method:
        return {"verified": False, "status": setup_intent.status}

    payment_method = stripe.PaymentMethod.retrieve(setup_intent.payment_method)
    card = getattr(payment_method, "card", None)
    summary = {
        "brand": getattr(card, "brand", None) if card else None,
        "last4": getattr(card, "last4", None) if card else None,
        "exp_month": getattr(card, "exp_month", None) if card else None,
        "exp_year": getattr(card, "exp_year", None) if card else None,
    }

    # Store only safe Stripe references and display metadata — never PAN/CVC.
    await db.payment_customers.update_one(
        {"client_key": input.client_key},
        {
            "$set": {
                "verified": True,
                "stripe_payment_method_id": payment_method.id,
                "payment_method_summary": summary,
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    return {
        "verified": True,
        "payment_method": summary,
    }


# Include the router in the main app
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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

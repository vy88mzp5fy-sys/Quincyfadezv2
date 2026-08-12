from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta, date, time
from zoneinfo import ZoneInfo
import stripe

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")
LONDON = ZoneInfo("Europe/London")

SERVICES = {
    "Haircut": {"price": 20, "duration_minutes": 45},
    "Haircut & Beard": {"price": 25, "duration_minutes": 60},
    "Shape Up": {"price": 10, "duration_minutes": 15},
    "Beard Trim": {"price": 10, "duration_minutes": 15},
}

DEFAULT_BOOKING_SETTINGS = {
    "key": "primary",
    "timezone": "Europe/London",
    "slot_interval_minutes": 15,
    "minimum_notice_minutes": 60,
    "booking_window_days": 60,
    "cancellation_notice_hours": 12,
    "reschedule_notice_hours": 12,
    "weekly_hours": {},
    "blocked_periods": [],
}

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

class BookingCreate(BaseModel):
    client_key: str = Field(min_length=12, max_length=128)
    service: str
    start_at: datetime
    customer_name: str = Field(min_length=2, max_length=80)
    customer_phone: str = Field(min_length=7, max_length=30)
    customer_email: Optional[str] = Field(default=None, max_length=120)
    notes: Optional[str] = Field(default=None, max_length=300)

class BookingCancel(BaseModel):
    client_key: str = Field(min_length=12, max_length=128)

class BookingReschedule(BaseModel):
    client_key: str = Field(min_length=12, max_length=128)
    start_at: datetime


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
    existing = await db.payment_customers.find_one({"client_key": client_key}, {"_id": 0, "stripe_customer_id": 1})
    if existing and existing.get("stripe_customer_id"):
        return existing["stripe_customer_id"]
    customer = stripe.Customer.create(metadata={"quincyfadez_client_key": client_key})
    now = datetime.now(timezone.utc).isoformat()
    await db.payment_customers.update_one(
        {"client_key": client_key},
        {"$set": {"client_key": client_key, "stripe_customer_id": customer.id, "created_at": now, "updated_at": now}},
        upsert=True,
    )
    return customer.id


async def _get_booking_settings():
    settings = await db.booking_settings.find_one({"key": "primary"}, {"_id": 0})
    merged = {**DEFAULT_BOOKING_SETTINGS, **(settings or {})}
    merged["weekly_hours"] = merged.get("weekly_hours") or {}
    merged["blocked_periods"] = merged.get("blocked_periods") or []
    return merged


def _parse_hhmm(value: str) -> time:
    hour, minute = [int(part) for part in value.split(":", 1)]
    return time(hour=hour, minute=minute)


def _overlaps(start_a: datetime, end_a: datetime, start_b: datetime, end_b: datetime) -> bool:
    return start_a < end_b and end_a > start_b


def _slot_key(start_at: datetime) -> str:
    return start_at.astimezone(timezone.utc).isoformat()


async def _verified_payment(client_key: str):
    record = await db.payment_customers.find_one(
        {"client_key": client_key},
        {"_id": 0, "stripe_customer_id": 1, "stripe_payment_method_id": 1},
    )
    if not record or not record.get("stripe_customer_id") or not stripe.api_key:
        return None
    try:
        methods = stripe.Customer.list_payment_methods(record["stripe_customer_id"], type="card", limit=10)
    except stripe.StripeError:
        return None
    attached = list(getattr(methods, "data", []) or [])
    if not attached:
        return None
    preferred = record.get("stripe_payment_method_id")
    return next((pm for pm in attached if pm.id == preferred), attached[0])


async def _has_overlap(start_at: datetime, end_at: datetime, exclude_booking_id: Optional[str] = None) -> bool:
    query = {
        "status": {"$in": ["confirmed", "pending"]},
        "start_at_utc": {"$lt": end_at.astimezone(timezone.utc).isoformat()},
        "end_at_utc": {"$gt": start_at.astimezone(timezone.utc).isoformat()},
    }
    if exclude_booking_id:
        query["id"] = {"$ne": exclude_booking_id}
    return await db.bookings.find_one(query, {"_id": 1}) is not None


async def _available_slots_for_day(day: date, service: str, settings, exclude_booking_id: Optional[str] = None):
    service_data = SERVICES.get(service)
    if not service_data:
        raise HTTPException(status_code=400, detail="Unknown service.")
    windows = settings["weekly_hours"].get(str(day.weekday()), [])
    if not windows:
        return []

    duration = timedelta(minutes=service_data["duration_minutes"])
    interval = timedelta(minutes=int(settings.get("slot_interval_minutes", 15)))
    earliest = datetime.now(LONDON) + timedelta(minutes=int(settings.get("minimum_notice_minutes", 60)))
    max_day = datetime.now(LONDON).date() + timedelta(days=int(settings.get("booking_window_days", 60)))
    if day > max_day:
        return []

    blocked = []
    for period in settings.get("blocked_periods", []):
        try:
            blocked.append((datetime.fromisoformat(period["start"]), datetime.fromisoformat(period["end"])))
        except Exception:
            continue

    slots = []
    for window in windows:
        if not isinstance(window, list) or len(window) != 2:
            continue
        try:
            window_start = datetime.combine(day, _parse_hhmm(window[0]), tzinfo=LONDON)
            window_end = datetime.combine(day, _parse_hhmm(window[1]), tzinfo=LONDON)
        except Exception:
            continue
        cursor = window_start
        while cursor + duration <= window_end:
            slot_end = cursor + duration
            if cursor >= earliest:
                blocked_now = any(_overlaps(cursor, slot_end, start.astimezone(LONDON), end.astimezone(LONDON)) for start, end in blocked)
                occupied = await _has_overlap(cursor, slot_end, exclude_booking_id)
                if not blocked_now and not occupied:
                    slots.append(cursor.isoformat())
            cursor += interval
    return slots


async def _assert_booking_time_allowed(booking, settings, action: str):
    start = datetime.fromisoformat(booking["start_at"]).astimezone(LONDON)
    hours_key = "cancellation_notice_hours" if action == "cancel" else "reschedule_notice_hours"
    notice = timedelta(hours=int(settings.get(hours_key, 12)))
    if datetime.now(LONDON) > start - notice:
        label = "cancelled" if action == "cancel" else "rescheduled"
        raise HTTPException(status_code=409, detail=f"This appointment can no longer be {label} in the app because it is inside the notice period.")


@api_router.get("/")
async def root():
    return {"message": "QuincyFadez API"}

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

@api_router.get("/booking/services")
async def booking_services():
    return {"services": [{"name": name, **data} for name, data in SERVICES.items()]}

@api_router.get("/booking/availability")
async def booking_availability(service: str, start_date: Optional[date] = Query(default=None), days: int = Query(default=14, ge=1, le=31)):
    settings = await _get_booking_settings()
    configured = bool(settings.get("weekly_hours"))
    first_day = start_date or datetime.now(LONDON).date()
    result = []
    for offset in range(days):
        current_day = first_day + timedelta(days=offset)
        slots = await _available_slots_for_day(current_day, service, settings) if configured else []
        result.append({"date": current_day.isoformat(), "slots": slots})
    return {"timezone": settings.get("timezone", "Europe/London"), "setup_required": not configured, "days": result}

@api_router.post("/booking/appointments")
async def create_booking(input: BookingCreate):
    service_data = SERVICES.get(input.service)
    if not service_data:
        raise HTTPException(status_code=400, detail="Unknown service.")
    payment_method = await _verified_payment(input.client_key)
    if not payment_method:
        raise HTTPException(status_code=409, detail="A verified payment method is required before booking.")
    if input.start_at.tzinfo is None:
        raise HTTPException(status_code=400, detail="Booking time must include a timezone.")

    requested = input.start_at.astimezone(LONDON)
    settings = await _get_booking_settings()
    if not settings.get("weekly_hours"):
        raise HTTPException(status_code=503, detail="Booking availability is not configured yet.")
    available = await _available_slots_for_day(requested.date(), input.service, settings)
    if requested.isoformat() not in available:
        raise HTTPException(status_code=409, detail="That time is no longer available. Please choose another slot.")

    end_at = requested + timedelta(minutes=service_data["duration_minutes"])
    if await _has_overlap(requested, end_at):
        raise HTTPException(status_code=409, detail="That time overlaps another appointment. Please choose another slot.")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "client_key": input.client_key,
        "customer_name": input.customer_name.strip(),
        "customer_phone": input.customer_phone.strip(),
        "customer_email": input.customer_email.strip().lower() if input.customer_email else None,
        "notes": input.notes.strip() if input.notes else None,
        "service": input.service,
        "price": service_data["price"],
        "duration_minutes": service_data["duration_minutes"],
        "start_at": requested.isoformat(),
        "end_at": end_at.isoformat(),
        "start_at_utc": requested.astimezone(timezone.utc).isoformat(),
        "end_at_utc": end_at.astimezone(timezone.utc).isoformat(),
        "active_slot_key": _slot_key(requested),
        "status": "confirmed",
        "stripe_payment_method_id": payment_method.id,
        "created_at": now,
        "updated_at": now,
    }
    try:
        await db.bookings.insert_one(doc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="That time has just been booked. Please choose another slot.") from exc
    return {k: v for k, v in doc.items() if k != "stripe_payment_method_id"}

@api_router.get("/booking/appointments/{client_key}")
async def list_bookings(client_key: str):
    bookings = await db.bookings.find(
        {"client_key": client_key},
        {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
    ).sort("start_at_utc", 1).to_list(200)
    return {"bookings": bookings}

@api_router.post("/booking/appointments/{booking_id}/cancel")
async def cancel_booking(booking_id: str, input: BookingCancel):
    booking = await db.bookings.find_one({"id": booking_id, "client_key": input.client_key}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if booking.get("status") == "cancelled":
        return {"cancelled": True}
    settings = await _get_booking_settings()
    await _assert_booking_time_allowed(booking, settings, "cancel")
    await db.bookings.update_one(
        {"id": booking_id, "client_key": input.client_key},
        {"$set": {"status": "cancelled", "active_slot_key": None, "cancelled_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"cancelled": True}

@api_router.post("/booking/appointments/{booking_id}/reschedule")
async def reschedule_booking(booking_id: str, input: BookingReschedule):
    booking = await db.bookings.find_one({"id": booking_id, "client_key": input.client_key}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if booking.get("status") != "confirmed":
        raise HTTPException(status_code=409, detail="Only confirmed appointments can be rescheduled.")
    if input.start_at.tzinfo is None:
        raise HTTPException(status_code=400, detail="Booking time must include a timezone.")

    settings = await _get_booking_settings()
    await _assert_booking_time_allowed(booking, settings, "reschedule")
    requested = input.start_at.astimezone(LONDON)
    available = await _available_slots_for_day(requested.date(), booking["service"], settings, exclude_booking_id=booking_id)
    if requested.isoformat() not in available:
        raise HTTPException(status_code=409, detail="That new time is no longer available.")

    duration = timedelta(minutes=int(booking["duration_minutes"]))
    end_at = requested + duration
    if await _has_overlap(requested, end_at, exclude_booking_id=booking_id):
        raise HTTPException(status_code=409, detail="That new time overlaps another appointment.")

    try:
        await db.bookings.update_one(
            {"id": booking_id, "client_key": input.client_key},
            {"$set": {
                "start_at": requested.isoformat(),
                "end_at": end_at.isoformat(),
                "start_at_utc": requested.astimezone(timezone.utc).isoformat(),
                "end_at_utc": end_at.astimezone(timezone.utc).isoformat(),
                "active_slot_key": _slot_key(requested),
                "rescheduled_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="That time has just been booked. Please choose another slot.") from exc
    updated = await db.bookings.find_one({"id": booking_id}, {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0})
    return updated

@api_router.get("/payments/config")
async def payment_config():
    publishable_key = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
    if not publishable_key:
        raise HTTPException(status_code=503, detail="Stripe publishable key is not configured yet.")
    return {"publishable_key": publishable_key}

@api_router.post("/payments/confirm-setup")
async def confirm_payment_setup(input: PaymentSetupConfirm):
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
        raise HTTPException(status_code=400, detail=getattr(exc, "user_message", None) or "Stripe could not set up this payment method.") from exc
    await db.payment_customers.update_one(
        {"client_key": input.client_key},
        {"$set": {"latest_setup_intent_id": setup_intent.id, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"client_secret": setup_intent.client_secret}

@api_router.post("/payments/customer-session")
async def create_payment_customer_session(input: PaymentClientRequest):
    _stripe_ready()
    customer_id = await _get_or_create_stripe_customer(input.client_key)
    try:
        session = stripe.CustomerSession.create(
            customer=customer_id,
            components={"customer_sheet": {"enabled": True, "features": {"payment_method_remove": "enabled", "payment_method_allow_redisplay_filters": ["always", "limited", "unspecified"]}}},
        )
    except stripe.StripeError as exc:
        logger.warning("Stripe CustomerSession failed: %s", str(exc))
        raise HTTPException(status_code=400, detail="Payment settings are unavailable right now.") from exc
    return {"customer": customer_id, "customer_session_client_secret": session.client_secret}

@api_router.post("/payments/customer-sheet-setup")
async def create_customer_sheet_setup_intent(input: PaymentClientRequest):
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
    _stripe_ready()
    record = await db.payment_customers.find_one(
        {"client_key": input.client_key},
        {"_id": 0, "stripe_customer_id": 1, "stripe_payment_method_id": 1},
    )
    customer_id = (record or {}).get("stripe_customer_id")
    if not customer_id:
        return {"verified": False, "reason": "No payment customer exists yet."}
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
            {"$set": {"verified": True, "stripe_payment_method_id": payment_method.id, "payment_method_summary": summary, "verified_at": now, "updated_at": now}},
        )
        return {"verified": True, "payment_method": summary}
    await db.payment_customers.update_one(
        {"client_key": input.client_key},
        {"$set": {"verified": False, "stripe_payment_method_id": None, "payment_method_summary": None, "updated_at": datetime.now(timezone.utc).isoformat()}},
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

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_indexes():
    await db.bookings.create_index("active_slot_key", unique=True, sparse=True)
    await db.bookings.create_index([("client_key", 1), ("start_at_utc", 1)])
    await db.bookings.create_index([("status", 1), ("start_at_utc", 1), ("end_at_utc", 1)])
    await db.booking_settings.create_index("key", unique=True)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

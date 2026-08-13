from datetime import datetime, timezone, timedelta, date
from typing import Optional
import hashlib
import os
import secrets
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field


ADMIN_SETTINGS_DEFAULTS = {
    "booking_approval_required": False,
    "booking_approval_expiry_minutes": 30,
    "waiting_list_enabled": False,
    "deposits_enabled": False,
    "deposit_amount": 0,
    "cancellation_fee_enabled": False,
    "cancellation_fee_amount": 0,
    "notifications_enabled": True,
    "business_profile": {},
    "policies": {},
    "growth_settings": {
        "reviews_enabled": True,
        "promotions_enabled": False,
        "referral_programme_enabled": False,
        "digital_business_card_enabled": True,
    },
    "automations": {
        "booking_confirmed": {"enabled": True, "channel": "push", "timing_minutes": 0},
        "booking_reminder": {"enabled": True, "channel": "push", "timing_hours": 24},
        "rescheduled_booking": {"enabled": True, "channel": "push", "timing_minutes": 0},
        "leave_a_review": {"enabled": True, "channel": "push", "timing_hours": 2},
        "waiting_list_alert": {"enabled": True, "channel": "push", "timing_minutes": 0},
        "rebook_reminder": {"enabled": True, "channel": "push", "timing_weeks": 3},
        "lapsed_client_winback": {"enabled": False, "channel": "push", "timing_weeks": 8},
        "google_review_booster": {"enabled": False, "channel": "push", "timing_hours": 24},
    },
}


class AdminLogin(BaseModel):
    pin: str = Field(min_length=4, max_length=64)


class AdminSettingsUpdate(BaseModel):
    slot_interval_minutes: Optional[int] = Field(default=None, ge=5, le=120)
    minimum_notice_minutes: Optional[int] = Field(default=None, ge=0, le=10080)
    booking_window_days: Optional[int] = Field(default=None, ge=1, le=365)
    cancellation_notice_hours: Optional[int] = Field(default=None, ge=0, le=720)
    reschedule_notice_hours: Optional[int] = Field(default=None, ge=0, le=720)
    weekly_hours: Optional[dict] = None
    blocked_periods: Optional[list] = None
    booking_approval_required: Optional[bool] = None
    booking_approval_expiry_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    waiting_list_enabled: Optional[bool] = None
    deposits_enabled: Optional[bool] = None
    deposit_amount: Optional[float] = Field(default=None, ge=0, le=500)
    cancellation_fee_enabled: Optional[bool] = None
    cancellation_fee_amount: Optional[float] = Field(default=None, ge=0, le=500)
    notifications_enabled: Optional[bool] = None
    business_profile: Optional[dict] = None
    policies: Optional[dict] = None
    growth_settings: Optional[dict] = None
    automations: Optional[dict] = None


class AdminBookingStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = Field(default=None, max_length=300)


class AdminBlockTimeCreate(BaseModel):
    start_at: datetime
    end_at: datetime
    label: Optional[str] = Field(default=None, max_length=80)


class AdminClientUpdate(BaseModel):
    notes: Optional[str] = Field(default=None, max_length=2000)
    tags: Optional[list[str]] = Field(default=None, max_length=20)
    blocked: Optional[bool] = None
    block_reason: Optional[str] = Field(default=None, max_length=300)


def build_admin_router(db, services, get_booking_settings, london):
    router = APIRouter(prefix="/admin", tags=["admin"])
    admin_pin_hash = os.environ.get("ADMIN_PIN_SHA256", "").strip().lower()
    session_hours = int(os.environ.get("ADMIN_SESSION_HOURS", "168"))

    def hash_value(value: str) -> str:
        return hashlib.sha256(value.encode("utf-8")).hexdigest()

    def merge_admin_defaults(settings: dict) -> dict:
        merged = {**ADMIN_SETTINGS_DEFAULTS, **(settings or {})}
        merged["growth_settings"] = {
            **ADMIN_SETTINGS_DEFAULTS["growth_settings"],
            **((settings or {}).get("growth_settings") or {}),
        }
        merged["automations"] = {
            **ADMIN_SETTINGS_DEFAULTS["automations"],
            **((settings or {}).get("automations") or {}),
        }
        return merged

    async def full_settings() -> dict:
        return merge_admin_defaults(await get_booking_settings())

    async def expire_pending_requests() -> int:
        now_iso = datetime.now(timezone.utc).isoformat()
        result = await db.bookings.update_many(
            {
                "status": "pending",
                "approval_expires_at": {"$ne": None, "$lte": now_iso},
            },
            {
                "$set": {
                    "status": "expired",
                    "active_slot_key": None,
                    "expired_at": now_iso,
                    "updated_at": now_iso,
                }
            },
        )
        return int(result.modified_count or 0)

    async def require_admin(authorization: Optional[str] = Header(default=None)):
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Admin authentication required.")
        token = authorization.split(" ", 1)[1].strip()
        if not token:
            raise HTTPException(status_code=401, detail="Admin authentication required.")
        now = datetime.now(timezone.utc)
        session = await db.admin_sessions.find_one(
            {"token_hash": hash_value(token), "expires_at": {"$gt": now}},
            {"_id": 0},
        )
        if not session:
            raise HTTPException(status_code=401, detail="Admin session expired. Please sign in again.")
        await db.admin_sessions.update_one(
            {"token_hash": hash_value(token)},
            {"$set": {"last_used_at": now}},
        )
        return session

    @router.post("/login")
    async def admin_login(input: AdminLogin):
        if not admin_pin_hash:
            raise HTTPException(status_code=503, detail="Admin access has not been configured yet.")
        if not secrets.compare_digest(hash_value(input.pin), admin_pin_hash):
            raise HTTPException(status_code=401, detail="Incorrect admin PIN.")
        token = secrets.token_urlsafe(36)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(hours=session_hours)
        await db.admin_sessions.insert_one({
            "token_hash": hash_value(token),
            "created_at": now,
            "expires_at": expires_at,
            "last_used_at": now,
        })
        return {"token": token, "expires_at": expires_at.isoformat()}

    @router.post("/logout")
    async def admin_logout(authorization: Optional[str] = Header(default=None), _=Depends(require_admin)):
        token = authorization.split(" ", 1)[1].strip()
        await db.admin_sessions.delete_one({"token_hash": hash_value(token)})
        return {"logged_out": True}

    @router.get("/overview")
    async def admin_overview(_=Depends(require_admin)):
        await expire_pending_requests()
        now_local = datetime.now(london)
        day_start = datetime.combine(now_local.date(), datetime.min.time(), tzinfo=london)
        day_end = day_start + timedelta(days=1)
        day_start_utc = day_start.astimezone(timezone.utc).isoformat()
        day_end_utc = day_end.astimezone(timezone.utc).isoformat()
        today = await db.bookings.find(
            {"status": {"$in": ["confirmed", "completed", "no_show"]}, "start_at_utc": {"$gte": day_start_utc, "$lt": day_end_utc}},
            {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
        ).sort("start_at_utc", 1).to_list(200)
        confirmed = [b for b in today if b.get("status") == "confirmed"]
        completed = [b for b in today if b.get("status") == "completed"]
        revenue = sum(float(b.get("price") or 0) for b in completed)
        booked_minutes = sum(int(b.get("duration_minutes") or 0) for b in today)
        settings = await full_settings()
        windows = settings.get("weekly_hours", {}).get(str(now_local.date().weekday()), [])
        working_minutes = 0
        for window in windows:
            try:
                start_h, start_m = [int(x) for x in window[0].split(":")]
                end_h, end_m = [int(x) for x in window[1].split(":")]
                working_minutes += max(0, (end_h * 60 + end_m) - (start_h * 60 + start_m))
            except Exception:
                continue
        utilisation = round((booked_minutes / working_minutes) * 100, 1) if working_minutes else None
        client_keys = [b.get("client_key") for b in today if b.get("client_key")]
        new_clients = 0
        for client_key in set(client_keys):
            first = await db.bookings.find_one(
                {"client_key": client_key, "status": {"$in": ["confirmed", "completed", "no_show"]}},
                {"_id": 0, "start_at_utc": 1},
                sort=[("start_at_utc", 1)],
            )
            if first and day_start_utc <= first.get("start_at_utc", "") < day_end_utc:
                new_clients += 1
        now_utc_iso = datetime.now(timezone.utc).isoformat()
        next_booking = next((b for b in confirmed if b.get("start_at_utc", "") >= now_utc_iso), None)
        pending_requests = await db.bookings.count_documents({"status": "pending", "start_at_utc": {"$gte": now_utc_iso}})
        return {
            "date": now_local.date().isoformat(),
            "today_revenue": revenue,
            "today_bookings": len(today),
            "new_clients": new_clients,
            "utilisation_percent": utilisation,
            "pending_requests": pending_requests,
            "next_booking": next_booking,
            "appointments": today,
        }

    @router.get("/insights")
    async def admin_insights(
        period: str = Query(default="week", pattern="^(day|week|month)$"),
        _=Depends(require_admin),
    ):
        await expire_pending_requests()
        now_local = datetime.now(london)
        if period == "day":
            start_local = datetime.combine(now_local.date(), datetime.min.time(), tzinfo=london)
            end_local = start_local + timedelta(days=1)
            bucket_days = 1
        elif period == "month":
            start_local = datetime(now_local.year, now_local.month, 1, tzinfo=london)
            if now_local.month == 12:
                end_local = datetime(now_local.year + 1, 1, 1, tzinfo=london)
            else:
                end_local = datetime(now_local.year, now_local.month + 1, 1, tzinfo=london)
            bucket_days = (end_local.date() - start_local.date()).days
        else:
            start_date = now_local.date() - timedelta(days=now_local.date().weekday())
            start_local = datetime.combine(start_date, datetime.min.time(), tzinfo=london)
            end_local = start_local + timedelta(days=7)
            bucket_days = 7

        start_utc = start_local.astimezone(timezone.utc).isoformat()
        end_utc = end_local.astimezone(timezone.utc).isoformat()
        bookings = await db.bookings.find(
            {"start_at_utc": {"$gte": start_utc, "$lt": end_utc}},
            {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
        ).sort("start_at_utc", 1).to_list(5000)

        completed = [b for b in bookings if b.get("status") == "completed"]
        cancelled = [b for b in bookings if b.get("status") == "cancelled"]
        no_shows = [b for b in bookings if b.get("status") == "no_show"]
        active = [b for b in bookings if b.get("status") in {"confirmed", "completed", "no_show"}]
        revenue = sum(float(b.get("price") or 0) for b in completed)
        completed_minutes = sum(int(b.get("duration_minutes") or 0) for b in completed)
        avg_booking = round(revenue / len(completed), 2) if completed else 0

        settings = await full_settings()
        working_minutes = 0
        for offset in range(bucket_days):
            current_date = start_local.date() + timedelta(days=offset)
            for window in settings.get("weekly_hours", {}).get(str(current_date.weekday()), []):
                try:
                    sh, sm = [int(x) for x in window[0].split(":")]
                    eh, em = [int(x) for x in window[1].split(":")]
                    working_minutes += max(0, (eh * 60 + em) - (sh * 60 + sm))
                except Exception:
                    continue
        booked_minutes = sum(int(b.get("duration_minutes") or 0) for b in active)
        utilisation = round((booked_minutes / working_minutes) * 100, 1) if working_minutes else None

        first_visit_keys = set()
        for booking in active:
            client_key = booking.get("client_key")
            if not client_key or client_key in first_visit_keys:
                continue
            first = await db.bookings.find_one(
                {"client_key": client_key, "status": {"$in": ["confirmed", "completed", "no_show"]}},
                {"_id": 0, "start_at_utc": 1},
                sort=[("start_at_utc", 1)],
            )
            if first and start_utc <= first.get("start_at_utc", "") < end_utc:
                first_visit_keys.add(client_key)

        trend = []
        for offset in range(bucket_days):
            current_date = start_local.date() + timedelta(days=offset)
            next_date = current_date + timedelta(days=1)
            day_items = [b for b in bookings if current_date.isoformat() <= str(b.get("start_at", ""))[:10] < next_date.isoformat()]
            day_completed = [b for b in day_items if b.get("status") == "completed"]
            trend.append({
                "date": current_date.isoformat(),
                "revenue": sum(float(b.get("price") or 0) for b in day_completed),
                "bookings": len([b for b in day_items if b.get("status") in {"confirmed", "completed", "no_show"}]),
                "completed": len(day_completed),
            })

        service_counts = {}
        for booking in completed:
            service = booking.get("service") or "Other"
            service_counts[service] = service_counts.get(service, 0) + 1
        top_service = max(service_counts.items(), key=lambda item: item[1])[0] if service_counts else None

        return {
            "period": period,
            "start_date": start_local.date().isoformat(),
            "end_date": (end_local.date() - timedelta(days=1)).isoformat(),
            "revenue": revenue,
            "bookings": len(active),
            "completed": len(completed),
            "new_clients": len(first_visit_keys),
            "average_booking_value": avg_booking,
            "hours_worked": round(completed_minutes / 60, 1),
            "utilisation_percent": utilisation,
            "cancellations": len(cancelled),
            "no_shows": len(no_shows),
            "top_service": top_service,
            "trend": trend,
        }

    @router.get("/bookings")
    async def admin_bookings(
        start_date: Optional[date] = Query(default=None),
        days: int = Query(default=7, ge=1, le=31),
        _=Depends(require_admin),
    ):
        await expire_pending_requests()
        first_day = start_date or datetime.now(london).date()
        start = datetime.combine(first_day, datetime.min.time(), tzinfo=london)
        end = start + timedelta(days=days)
        bookings = await db.bookings.find(
            {
                "status": {"$in": ["confirmed", "completed", "no_show"]},
                "start_at_utc": {"$gte": start.astimezone(timezone.utc).isoformat(), "$lt": end.astimezone(timezone.utc).isoformat()},
            },
            {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
        ).sort("start_at_utc", 1).to_list(1000)
        return {"start_date": first_day.isoformat(), "days": days, "bookings": bookings}

    @router.get("/booking-requests")
    async def admin_booking_requests(_=Depends(require_admin)):
        await expire_pending_requests()
        now_iso = datetime.now(timezone.utc).isoformat()
        bookings = await db.bookings.find(
            {"status": "pending", "start_at_utc": {"$gte": now_iso}},
            {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
        ).sort("start_at_utc", 1).to_list(500)
        return {"bookings": bookings}

    @router.patch("/bookings/{booking_id}/status")
    async def update_booking_status(booking_id: str, input: AdminBookingStatusUpdate, _=Depends(require_admin)):
        await expire_pending_requests()
        allowed = {"confirmed", "completed", "no_show", "cancelled"}
        status = input.status.strip().lower()
        if status not in allowed:
            raise HTTPException(status_code=400, detail="Unsupported appointment status.")
        booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found.")
        if booking.get("status") == "expired":
            raise HTTPException(status_code=409, detail="This booking request has expired. Ask the client to choose a new time.")
        now = datetime.now(timezone.utc).isoformat()
        patch = {"status": status, "updated_at": now}
        if input.note is not None:
            patch["admin_note"] = input.note.strip() or None
        if status == "completed":
            patch["completed_at"] = now
        elif status == "no_show":
            patch["no_show_at"] = now
            patch["active_slot_key"] = None
        elif status == "cancelled":
            patch["cancelled_at"] = now
            patch["cancelled_by"] = "admin"
            patch["active_slot_key"] = None
        elif status == "confirmed" and booking.get("status") == "cancelled":
            raise HTTPException(status_code=409, detail="Cancelled bookings cannot be restored. Create a new appointment instead.")
        await db.bookings.update_one({"id": booking_id}, {"$set": patch})
        updated = await db.bookings.find_one({"id": booking_id}, {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0})
        return {"booking": updated}

    @router.get("/clients")
    async def admin_clients(q: Optional[str] = Query(default=None, max_length=80), _=Depends(require_admin)):
        await expire_pending_requests()
        pipeline = [
            {"$match": {"status": {"$in": ["confirmed", "completed", "no_show"]}}},
            {"$sort": {"start_at_utc": 1}},
            {"$group": {
                "_id": "$client_key",
                "name": {"$last": "$customer_name"},
                "phone": {"$last": "$customer_phone"},
                "email": {"$last": "$customer_email"},
                "booking_count": {"$sum": 1},
                "completed_count": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
                "total_spend": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, "$price", 0]}},
                "first_visit": {"$first": "$start_at"},
                "last_visit": {"$last": "$start_at"},
                "last_service": {"$last": "$service"},
            }},
            {"$sort": {"last_visit": -1}},
            {"$limit": 500},
        ]
        clients = await db.bookings.aggregate(pipeline).to_list(500)
        cleaned = []
        needle = (q or "").strip().lower()
        now_iso = datetime.now(timezone.utc).isoformat()
        for item in clients:
            client_key = item.get("_id")
            profile = await db.client_profiles.find_one({"client_key": client_key}, {"_id": 0}) or {}
            record = {
                "client_key": client_key,
                "name": item.get("name"),
                "phone": item.get("phone"),
                "email": item.get("email"),
                "booking_count": item.get("booking_count", 0),
                "completed_count": item.get("completed_count", 0),
                "total_spend": item.get("total_spend", 0),
                "first_visit": item.get("first_visit"),
                "last_visit": item.get("last_visit"),
                "last_service": item.get("last_service"),
                "notes": profile.get("notes"),
                "tags": profile.get("tags") or [],
                "blocked": bool(profile.get("blocked", False)),
                "block_reason": profile.get("block_reason"),
            }
            if needle:
                haystack = " ".join(str(record.get(k) or "") for k in ["name", "phone", "email"]).lower()
                if needle not in haystack:
                    continue
            next_booking = await db.bookings.find_one(
                {"client_key": client_key, "status": "confirmed", "start_at_utc": {"$gte": now_iso}},
                {"_id": 0, "start_at": 1, "service": 1},
                sort=[("start_at_utc", 1)],
            )
            record["next_booking"] = next_booking
            record["regular"] = int(record["completed_count"] or 0) >= 3
            cleaned.append(record)
        return {"clients": cleaned}

    @router.get("/clients/{client_key}")
    async def admin_client_detail(client_key: str, _=Depends(require_admin)):
        await expire_pending_requests()
        bookings = await db.bookings.find(
            {"client_key": client_key},
            {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
        ).sort("start_at_utc", -1).to_list(300)
        if not bookings:
            raise HTTPException(status_code=404, detail="Client not found.")
        latest = bookings[0]
        profile = await db.client_profiles.find_one({"client_key": client_key}, {"_id": 0}) or {}
        completed = [b for b in bookings if b.get("status") == "completed"]
        no_shows = [b for b in bookings if b.get("status") == "no_show"]
        cancelled = [b for b in bookings if b.get("status") == "cancelled"]
        expired = [b for b in bookings if b.get("status") == "expired"]
        now_iso = datetime.now(timezone.utc).isoformat()
        upcoming = sorted([b for b in bookings if b.get("status") == "confirmed" and b.get("start_at_utc", "") >= now_iso], key=lambda b: b.get("start_at_utc", ""))
        past = sorted([b for b in bookings if b.get("start_at_utc", "") < now_iso or b.get("status") in {"completed", "no_show", "cancelled", "expired"}], key=lambda b: b.get("start_at_utc", ""), reverse=True)
        name = next((b.get("customer_name") for b in bookings if b.get("customer_name")), None)
        phone = next((b.get("customer_phone") for b in bookings if b.get("customer_phone")), None)
        email = next((b.get("customer_email") for b in bookings if b.get("customer_email")), None)
        completed_sorted = sorted(completed, key=lambda b: b.get("start_at_utc", ""))
        return {
            "client": {
                "client_key": client_key,
                "name": name,
                "phone": phone,
                "email": email,
                "booking_count": len([b for b in bookings if b.get("status") in {"confirmed", "completed", "no_show", "cancelled"}]),
                "completed_count": len(completed),
                "cancelled_count": len(cancelled),
                "expired_count": len(expired),
                "no_show_count": len(no_shows),
                "total_spend": sum(float(b.get("price") or 0) for b in completed),
                "first_visit": completed_sorted[0].get("start_at") if completed_sorted else None,
                "last_visit": completed_sorted[-1].get("start_at") if completed_sorted else None,
                "last_service": completed_sorted[-1].get("service") if completed_sorted else latest.get("service"),
                "regular": len(completed) >= 3,
                "notes": profile.get("notes"),
                "tags": profile.get("tags") or [],
                "blocked": bool(profile.get("blocked", False)),
                "block_reason": profile.get("block_reason"),
                "next_booking": upcoming[0] if upcoming else None,
            },
            "upcoming": upcoming,
            "history": past,
        }

    @router.put("/clients/{client_key}")
    async def update_admin_client(client_key: str, input: AdminClientUpdate, _=Depends(require_admin)):
        exists = await db.bookings.find_one({"client_key": client_key}, {"_id": 1})
        if not exists:
            raise HTTPException(status_code=404, detail="Client not found.")
        now = datetime.now(timezone.utc).isoformat()
        patch = {"client_key": client_key, "updated_at": now}
        if input.notes is not None:
            patch["notes"] = input.notes.strip() or None
        if input.tags is not None:
            patch["tags"] = list(dict.fromkeys(tag.strip() for tag in input.tags if tag.strip()))[:20]
        if input.blocked is not None:
            patch["blocked"] = input.blocked
            patch["blocked_at"] = now if input.blocked else None
            if not input.blocked:
                patch["block_reason"] = None
        if input.block_reason is not None:
            patch["block_reason"] = input.block_reason.strip() or None
        await db.client_profiles.update_one(
            {"client_key": client_key},
            {"$set": patch, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
        profile = await db.client_profiles.find_one({"client_key": client_key}, {"_id": 0})
        return {"profile": profile}

    @router.get("/settings")
    async def admin_settings(_=Depends(require_admin)):
        return {"settings": await full_settings(), "services": [{"name": name, **data} for name, data in services.items()]}

    @router.put("/settings")
    async def update_admin_settings(input: AdminSettingsUpdate, _=Depends(require_admin)):
        patch = {k: v for k, v in input.model_dump().items() if v is not None}
        if not patch:
            return {"settings": await full_settings()}
        if "automations" in patch:
            existing = (await full_settings()).get("automations", {})
            automation_patch = patch.pop("automations") or {}
            merged_automations = dict(existing)
            for key, value in automation_patch.items():
                if isinstance(value, dict) and isinstance(merged_automations.get(key), dict):
                    merged_automations[key] = {**merged_automations[key], **value}
                else:
                    merged_automations[key] = value
            patch["automations"] = merged_automations
        if "growth_settings" in patch:
            existing = (await full_settings()).get("growth_settings", {})
            patch["growth_settings"] = {**existing, **(patch["growth_settings"] or {})}
        patch["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.booking_settings.update_one({"key": "primary"}, {"$set": patch, "$setOnInsert": {"key": "primary"}}, upsert=True)
        return {"settings": await full_settings()}

    @router.post("/blocked-time")
    async def create_blocked_time(input: AdminBlockTimeCreate, _=Depends(require_admin)):
        if input.start_at.tzinfo is None or input.end_at.tzinfo is None:
            raise HTTPException(status_code=400, detail="Blocked time must include a timezone.")
        start_at = input.start_at.astimezone(london)
        end_at = input.end_at.astimezone(london)
        if end_at <= start_at:
            raise HTTPException(status_code=400, detail="Blocked time must end after it starts.")
        block = {
            "id": str(uuid.uuid4()),
            "label": input.label.strip() if input.label else "Blocked Time",
            "start": start_at.isoformat(),
            "end": end_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.booking_settings.update_one({"key": "primary"}, {"$push": {"blocked_periods": block}, "$setOnInsert": {"key": "primary"}}, upsert=True)
        return {"blocked_time": block, "settings": await full_settings()}

    @router.delete("/blocked-time/{block_id}")
    async def delete_blocked_time(block_id: str, _=Depends(require_admin)):
        result = await db.booking_settings.update_one({"key": "primary"}, {"$pull": {"blocked_periods": {"id": block_id}}})
        if not result.modified_count:
            raise HTTPException(status_code=404, detail="Blocked time not found.")
        return {"deleted": True, "settings": await full_settings()}

    return router
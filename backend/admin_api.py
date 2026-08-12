from datetime import datetime, timezone, timedelta, date
from typing import Optional
import hashlib
import os
import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field


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


def build_admin_router(db, services, get_booking_settings, london):
    router = APIRouter(prefix="/admin", tags=["admin"])
    admin_pin_hash = os.environ.get("ADMIN_PIN_SHA256", "").strip().lower()
    session_hours = int(os.environ.get("ADMIN_SESSION_HOURS", "168"))

    def hash_value(value: str) -> str:
        return hashlib.sha256(value.encode("utf-8")).hexdigest()

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
        await db.admin_sessions.insert_one(
            {
                "token_hash": hash_value(token),
                "created_at": now,
                "expires_at": expires_at,
                "last_used_at": now,
            }
        )
        return {"token": token, "expires_at": expires_at.isoformat()}

    @router.post("/logout")
    async def admin_logout(authorization: Optional[str] = Header(default=None), _=Depends(require_admin)):
        token = authorization.split(" ", 1)[1].strip()
        await db.admin_sessions.delete_one({"token_hash": hash_value(token)})
        return {"logged_out": True}

    @router.get("/overview")
    async def admin_overview(_=Depends(require_admin)):
        now_local = datetime.now(london)
        day_start = datetime.combine(now_local.date(), datetime.min.time(), tzinfo=london)
        day_end = day_start + timedelta(days=1)
        day_start_utc = day_start.astimezone(timezone.utc).isoformat()
        day_end_utc = day_end.astimezone(timezone.utc).isoformat()

        today = await db.bookings.find(
            {
                "status": {"$in": ["confirmed", "completed", "no_show"]},
                "start_at_utc": {"$gte": day_start_utc, "$lt": day_end_utc},
            },
            {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
        ).sort("start_at_utc", 1).to_list(200)

        confirmed = [b for b in today if b.get("status") == "confirmed"]
        completed = [b for b in today if b.get("status") == "completed"]
        revenue = sum(float(b.get("price") or 0) for b in completed)
        booked_minutes = sum(int(b.get("duration_minutes") or 0) for b in today if b.get("status") != "cancelled")

        settings = await get_booking_settings()
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
                {"client_key": client_key, "status": {"$ne": "cancelled"}},
                {"_id": 0, "start_at_utc": 1},
                sort=[("start_at_utc", 1)],
            )
            if first and day_start_utc <= first.get("start_at_utc", "") < day_end_utc:
                new_clients += 1

        next_booking = next((b for b in confirmed if b.get("start_at_utc", "") >= datetime.now(timezone.utc).isoformat()), None)
        return {
            "date": now_local.date().isoformat(),
            "today_revenue": revenue,
            "today_bookings": len(today),
            "new_clients": new_clients,
            "utilisation_percent": utilisation,
            "next_booking": next_booking,
            "appointments": today,
        }

    @router.get("/bookings")
    async def admin_bookings(
        start_date: Optional[date] = Query(default=None),
        days: int = Query(default=7, ge=1, le=31),
        _=Depends(require_admin),
    ):
        first_day = start_date or datetime.now(london).date()
        start = datetime.combine(first_day, datetime.min.time(), tzinfo=london)
        end = start + timedelta(days=days)
        bookings = await db.bookings.find(
            {
                "start_at_utc": {
                    "$gte": start.astimezone(timezone.utc).isoformat(),
                    "$lt": end.astimezone(timezone.utc).isoformat(),
                }
            },
            {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
        ).sort("start_at_utc", 1).to_list(1000)
        return {"start_date": first_day.isoformat(), "days": days, "bookings": bookings}

    @router.get("/clients")
    async def admin_clients(q: Optional[str] = Query(default=None, max_length=80), _=Depends(require_admin)):
        pipeline = [
            {"$match": {"status": {"$ne": "cancelled"}}},
            {"$sort": {"start_at_utc": 1}},
            {"$group": {
                "_id": "$client_key",
                "name": {"$last": "$customer_name"},
                "phone": {"$last": "$customer_phone"},
                "email": {"$last": "$customer_email"},
                "booking_count": {"$sum": 1},
                "total_spend": {"$sum": "$price"},
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
            record = {
                "client_key": item.get("_id"),
                "name": item.get("name"),
                "phone": item.get("phone"),
                "email": item.get("email"),
                "booking_count": item.get("booking_count", 0),
                "total_spend": item.get("total_spend", 0),
                "first_visit": item.get("first_visit"),
                "last_visit": item.get("last_visit"),
                "last_service": item.get("last_service"),
            }
            if needle:
                haystack = " ".join(str(record.get(k) or "") for k in ["name", "phone", "email"]).lower()
                if needle not in haystack:
                    continue
            next_booking = await db.bookings.find_one(
                {"client_key": record["client_key"], "status": "confirmed", "start_at_utc": {"$gte": now_iso}},
                {"_id": 0, "start_at": 1, "service": 1},
                sort=[("start_at_utc", 1)],
            )
            record["next_booking"] = next_booking
            record["regular"] = int(record["booking_count"] or 0) >= 3
            cleaned.append(record)
        return {"clients": cleaned}

    @router.get("/settings")
    async def admin_settings(_=Depends(require_admin)):
        settings = await get_booking_settings()
        return {
            "settings": settings,
            "services": [{"name": name, **data} for name, data in services.items()],
        }

    @router.put("/settings")
    async def update_admin_settings(input: AdminSettingsUpdate, _=Depends(require_admin)):
        patch = {k: v for k, v in input.model_dump().items() if v is not None}
        if not patch:
            return {"settings": await get_booking_settings()}
        patch["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.booking_settings.update_one(
            {"key": "primary"},
            {"$set": patch, "$setOnInsert": {"key": "primary"}},
            upsert=True,
        )
        return {"settings": await get_booking_settings()}

    return router

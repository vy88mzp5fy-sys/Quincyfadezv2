from datetime import datetime, timezone
from typing import Optional
import hashlib

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field

from waiting_list_alerts import send_waiting_list_alert
from waiting_list_service import ACTIVE_WAITING_STATUSES, slot_matches, status_patch


class WaitingListStatusUpdate(BaseModel):
    status: str = Field(pattern="^(booked|cancelled|expired)$")


class WaitingListAlertRequest(BaseModel):
    service: str = Field(min_length=1, max_length=80)
    date: str = Field(min_length=10, max_length=10)
    time: str = Field(min_length=5, max_length=5)


def build_admin_waiting_list_router(db):
    router = APIRouter(prefix="/admin/waiting-list", tags=["admin-waiting-list"])

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
        await db.admin_sessions.update_one(
            {"token_hash": hash_value(token)},
            {"$set": {"last_used_at": now}},
        )
        return session

    async def enrich(entry: dict) -> dict:
        client = await db.client_accounts.find_one(
            {"client_key": entry.get("client_key")},
            {"_id": 0, "client_key": 1, "name": 1, "phone": 1, "email": 1},
        ) or {}
        return {**entry, "client": client}

    @router.get("")
    async def list_waiting_list(
        status: str = Query(default="active", pattern="^(active|waiting|notified|booked|cancelled|expired|all)$"),
        _=Depends(require_admin),
    ):
        settings = await db.booking_settings.find_one({"key": "primary"}, {"_id": 0}) or {}
        if status == "active":
            query = {"status": {"$in": sorted(ACTIVE_WAITING_STATUSES)}}
        elif status == "all":
            query = {}
        else:
            query = {"status": status}
        entries = await db.waiting_list.find(query, {"_id": 0}).sort("created_at", 1).to_list(500)
        enriched = [await enrich(entry) for entry in entries]
        return {"enabled": bool(settings.get("waiting_list_enabled", False)), "entries": enriched, "count": len(enriched)}

    @router.patch("/{entry_id}/status")
    async def update_waiting_status(entry_id: str, input: WaitingListStatusUpdate, _=Depends(require_admin)):
        entry = await db.waiting_list.find_one({"id": entry_id}, {"_id": 0})
        if not entry:
            raise HTTPException(status_code=404, detail="Waiting-list entry not found.")
        patch = status_patch(input.status)
        await db.waiting_list.update_one({"id": entry_id}, {"$set": patch})
        return {"entry": await enrich({**entry, **patch})}

    @router.post("/{entry_id}/alert")
    async def alert_waiting_client(entry_id: str, input: WaitingListAlertRequest, _=Depends(require_admin)):
        entry = await db.waiting_list.find_one({"id": entry_id}, {"_id": 0})
        if not entry:
            raise HTTPException(status_code=404, detail="Waiting-list entry not found.")
        slot = {"service": input.service.strip(), "date": input.date, "time": input.time}
        if not slot_matches(entry, slot):
            raise HTTPException(status_code=409, detail="That slot does not match this client's waiting-list preferences.")
        result = await send_waiting_list_alert(db, entry, slot)
        if result.get("sent"):
            return result
        reason = result.get("reason") or "push_not_sent"
        messages = {
            "waiting_list_disabled": "Waiting List is turned off in Admin Settings.",
            "push_disabled": "Waiting List push alerts are turned off in Admin Settings.",
            "no_registered_push_device": "This client does not have a registered push device yet.",
        }
        raise HTTPException(status_code=409, detail=messages.get(reason, "The waiting-list alert could not be sent."))

    return router

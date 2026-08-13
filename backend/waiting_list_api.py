from datetime import datetime, timezone
from typing import Optional
import hashlib

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from waiting_list_service import active_duplicate_filter, build_waiting_entry, status_patch


class WaitingListCreate(BaseModel):
    service: str = Field(min_length=1, max_length=80)
    preferred_date: Optional[str] = None
    earliest_time: Optional[str] = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    latest_time: Optional[str] = Field(default=None, pattern=r"^\d{2}:\d{2}$")


def build_waiting_list_router(db, services):
    router = APIRouter(prefix="/waiting-list", tags=["waiting-list"])

    def hash_token(value: str) -> str:
        return hashlib.sha256(value.encode("utf-8")).hexdigest()

    async def require_client(authorization: Optional[str] = Header(default=None)) -> dict:
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Client authentication required.")
        token = authorization.split(" ", 1)[1].strip()
        session = await db.client_sessions.find_one(
            {"token_hash": hash_token(token), "expires_at": {"$gt": datetime.now(timezone.utc)}},
            {"_id": 0},
        )
        if not session:
            raise HTTPException(status_code=401, detail="Your client session has expired. Please log in again.")
        return session

    async def waiting_list_enabled() -> bool:
        settings = await db.booking_settings.find_one({"key": "primary"}, {"_id": 0, "waiting_list_enabled": 1}) or {}
        return bool(settings.get("waiting_list_enabled", False))

    @router.post("")
    async def join_waiting_list(input: WaitingListCreate, authorization: Optional[str] = Header(default=None)):
        session = await require_client(authorization)
        if not await waiting_list_enabled():
            raise HTTPException(status_code=409, detail="The QuincyFadez waiting list is not currently open.")
        service = " ".join(input.service.strip().split())
        if service not in services:
            raise HTTPException(status_code=400, detail="Choose a valid QuincyFadez service.")
        try:
            entry = build_waiting_entry(
                client_key=session["client_key"],
                service=service,
                preferred_date=input.preferred_date,
                earliest_time=input.earliest_time,
                latest_time=input.latest_time,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        existing = await db.waiting_list.find_one(active_duplicate_filter(entry), {"_id": 0})
        if existing:
            return {"joined": True, "duplicate": True, "entry": existing}
        await db.waiting_list.insert_one(entry)
        return {"joined": True, "duplicate": False, "entry": entry}

    @router.get("")
    async def my_waiting_list(authorization: Optional[str] = Header(default=None)):
        session = await require_client(authorization)
        entries = await db.waiting_list.find(
            {"client_key": session["client_key"]},
            {"_id": 0},
        ).sort("created_at", -1).to_list(100)
        return {"entries": entries, "enabled": await waiting_list_enabled()}

    @router.delete("/{entry_id}")
    async def leave_waiting_list(entry_id: str, authorization: Optional[str] = Header(default=None)):
        session = await require_client(authorization)
        entry = await db.waiting_list.find_one(
            {"id": entry_id, "client_key": session["client_key"]},
            {"_id": 0},
        )
        if not entry:
            raise HTTPException(status_code=404, detail="Waiting-list entry not found.")
        if entry.get("status") in {"booked", "cancelled", "expired"}:
            return {"cancelled": entry.get("status") == "cancelled", "entry": entry}
        patch = status_patch("cancelled")
        await db.waiting_list.update_one({"id": entry_id, "client_key": session["client_key"]}, {"$set": patch})
        updated = {**entry, **patch}
        return {"cancelled": True, "entry": updated}

    return router

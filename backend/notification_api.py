from datetime import datetime, timezone
from typing import Optional
import hashlib

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from push_delivery import send_client_push


class PushDeviceRegister(BaseModel):
    expo_push_token: str = Field(min_length=20, max_length=255)
    platform: str = Field(pattern="^(ios|android)$")


class PushDeviceRemove(BaseModel):
    expo_push_token: str = Field(min_length=20, max_length=255)


def build_notification_router(db):
    router = APIRouter(prefix="/notifications", tags=["notifications"])

    def hash_token(value: str) -> str:
        return hashlib.sha256(value.encode("utf-8")).hexdigest()

    async def require_client(authorization: Optional[str] = Header(default=None)) -> dict:
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Client authentication required.")
        token = authorization.split(" ", 1)[1].strip()
        session = await db.client_sessions.find_one(
            {
                "token_hash": hash_token(token),
                "expires_at": {"$gt": datetime.now(timezone.utc)},
            },
            {"_id": 0},
        )
        if not session:
            raise HTTPException(status_code=401, detail="Your client session has expired. Please log in again.")
        return session

    @router.post("/devices")
    async def register_device(input: PushDeviceRegister, authorization: Optional[str] = Header(default=None)):
        session = await require_client(authorization)
        now = datetime.now(timezone.utc)
        await db.push_devices.update_one(
            {"expo_push_token": input.expo_push_token},
            {
                "$set": {
                    "expo_push_token": input.expo_push_token,
                    "client_key": session["client_key"],
                    "platform": input.platform,
                    "enabled": True,
                    "updated_at": now,
                },
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
        return {"registered": True, "platform": input.platform}

    @router.delete("/devices")
    async def remove_device(input: PushDeviceRemove, authorization: Optional[str] = Header(default=None)):
        session = await require_client(authorization)
        await db.push_devices.update_many(
            {"client_key": session["client_key"], "expo_push_token": input.expo_push_token},
            {"$set": {"enabled": False, "updated_at": datetime.now(timezone.utc)}},
        )
        return {"registered": False}

    @router.get("/status")
    async def notification_status(authorization: Optional[str] = Header(default=None)):
        session = await require_client(authorization)
        count = await db.push_devices.count_documents({"client_key": session["client_key"], "enabled": True})
        return {"push_registered": count > 0, "registered_devices": count}

    @router.post("/test-push")
    async def test_push(authorization: Optional[str] = Header(default=None)):
        session = await require_client(authorization)
        delivery = await send_client_push(
            db,
            session["client_key"],
            "QuincyFadez Notifications Are On ✂️",
            "Your device is connected and ready for booking updates, reminders and waiting-list alerts.",
            {"event": "push_test"},
        )
        if int(delivery.get("sent") or 0) < 1:
            raise HTTPException(
                status_code=409,
                detail="No registered push device accepted this test. Check notification permission and device registration.",
            )
        return {"delivered": True, "delivery": delivery}

    return router

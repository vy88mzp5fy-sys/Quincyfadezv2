from datetime import datetime, timezone
from typing import Optional
import asyncio
import requests


EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def build_push_message(expo_push_token: str, title: str, body: str, data: Optional[dict] = None) -> dict:
    return {
        "to": expo_push_token,
        "title": title,
        "body": body,
        "sound": "default",
        "channelId": "appointments",
        "data": data or {},
    }


async def send_client_push(db, client_key: str, title: str, body: str, data: Optional[dict] = None) -> dict:
    devices = await db.push_devices.find(
        {"client_key": client_key, "enabled": True},
        {"_id": 0, "expo_push_token": 1, "platform": 1},
    ).to_list(20)

    messages = [
        build_push_message(device["expo_push_token"], title, body, data)
        for device in devices
        if device.get("expo_push_token")
    ]
    if not messages:
        return {"sent": 0, "tickets": []}

    def post_push():
        return requests.post(
            EXPO_PUSH_URL,
            json=messages,
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=12,
        )

    try:
        response = await asyncio.to_thread(post_push)
        payload = response.json() if response.content else {}
    except Exception as exc:
        await db.notification_log.insert_one({
            "client_key": client_key,
            "kind": "push",
            "status": "transport_error",
            "title": title,
            "body": body,
            "device_count": len(messages),
            "created_at": datetime.now(timezone.utc),
        })
        return {"sent": 0, "tickets": [], "error": str(exc)}

    tickets = payload.get("data") if isinstance(payload, dict) else []
    status = "accepted" if response.status_code < 400 else "rejected"
    await db.notification_log.insert_one({
        "client_key": client_key,
        "kind": "push",
        "status": status,
        "title": title,
        "body": body,
        "device_count": len(messages),
        "tickets": tickets,
        "http_status": response.status_code,
        "created_at": datetime.now(timezone.utc),
    })
    return {
        "sent": len(messages) if response.status_code < 400 else 0,
        "tickets": tickets or [],
        "http_status": response.status_code,
    }

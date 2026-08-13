from notification_events import build_notification
from notification_preferences import channel_enabled
from push_delivery import send_client_push
from waiting_list_service import status_patch


async def send_waiting_list_alert(db, entry: dict, slot: dict, settings: dict | None = None) -> dict:
    if not entry or entry.get("status") not in {"waiting", "notified"}:
        return {"sent": False, "reason": "inactive_entry", "delivery": {"sent": 0}}

    clean_slot = {
        "service": str(slot.get("service") or "").strip(),
        "date": str(slot.get("date") or "").strip(),
        "time": str(slot.get("time") or "").strip(),
    }
    if not clean_slot["service"] or clean_slot["service"] != str(entry.get("service") or "").strip():
        return {"sent": False, "reason": "service_mismatch", "delivery": {"sent": 0}}

    if settings is None:
        settings = await db.booking_settings.find_one({"key": "primary"}, {"_id": 0}) or {}
    if not settings.get("waiting_list_enabled", False):
        return {"sent": False, "reason": "waiting_list_disabled", "delivery": {"sent": 0}}
    if not channel_enabled(settings, "waiting_list_alert", "push"):
        return {"sent": False, "reason": "push_disabled", "delivery": {"sent": 0}}

    client = await db.client_accounts.find_one(
        {"client_key": entry.get("client_key")},
        {"_id": 0, "client_key": 1, "name": 1, "phone": 1, "email": 1},
    ) or {}
    message = build_notification("waiting_list_alert", client=client, slot=clean_slot)
    delivery = await send_client_push(
        db,
        entry.get("client_key"),
        message["title"],
        message["body"],
        message["data"],
    )
    sent = int(delivery.get("sent") or 0) > 0
    updated_entry = entry
    if sent:
        patch = status_patch("notified")
        patch["last_alert_slot"] = clean_slot
        await db.waiting_list.update_one({"id": entry.get("id")}, {"$set": patch})
        updated_entry = {**entry, **patch}

    return {
        "sent": sent,
        "reason": None if sent else "no_registered_push_device",
        "delivery": delivery,
        "message": message,
        "entry": updated_entry,
    }

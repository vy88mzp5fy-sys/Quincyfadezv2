from notification_events import build_notification
from notification_preferences import channel_enabled
from push_delivery import send_client_push


BOOKING_PUSH_EVENTS = {
    "booking_confirmed",
    "rescheduled_booking",
    "booking_cancelled",
    "leave_a_review",
}


async def dispatch_booking_notification(db, event: str, booking: dict, settings: dict | None = None) -> dict:
    if event not in BOOKING_PUSH_EVENTS:
        return {"sent": False, "reason": "unsupported_event", "delivery": {"sent": 0}}
    if not booking or not booking.get("client_key"):
        return {"sent": False, "reason": "missing_client", "delivery": {"sent": 0}}

    if settings is None:
        settings = await db.booking_settings.find_one({"key": "primary"}, {"_id": 0}) or {}
    if not channel_enabled(settings, event, "push"):
        return {"sent": False, "reason": "push_disabled", "delivery": {"sent": 0}}

    client = await db.client_accounts.find_one(
        {"client_key": booking["client_key"]},
        {"_id": 0, "client_key": 1, "name": 1, "phone": 1, "email": 1},
    ) or {}
    message = build_notification(event, booking=booking, client=client)
    delivery = await send_client_push(
        db,
        booking["client_key"],
        message["title"],
        message["body"],
        message["data"],
    )
    return {
        "sent": int(delivery.get("sent") or 0) > 0,
        "reason": None if int(delivery.get("sent") or 0) > 0 else "no_registered_push_device",
        "delivery": delivery,
        "message": message,
    }

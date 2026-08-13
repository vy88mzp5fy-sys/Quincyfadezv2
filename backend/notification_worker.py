import asyncio
from datetime import datetime, timedelta, timezone

from booking_notifications import dispatch_booking_notification
from notification_events import build_notification
from notification_preferences import channel_enabled, normalize_automation
from push_delivery import send_client_push


POLL_SECONDS = 30
CYCLE_LOOKBACK_MINUTES = 10


def _iso(value):
    return str(value or "")


def _parse(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).astimezone(timezone.utc)
    except Exception:
        return None


async def _claim_delivered(db, event_key: str, result: dict) -> None:
    if not result.get("sent"):
        return
    await db.notification_events.update_one(
        {"event_key": event_key},
        {
            "$set": {
                "event_key": event_key,
                "delivered": True,
                "delivered_at": datetime.now(timezone.utc),
                "delivery": result.get("delivery") or {},
            }
        },
        upsert=True,
    )


async def _already_delivered(db, event_key: str) -> bool:
    return await db.notification_events.find_one(
        {"event_key": event_key, "delivered": True}, {"_id": 1}
    ) is not None


async def _dispatch_booking_event(db, event: str, booking: dict, source_time: str, settings: dict) -> None:
    if not source_time:
        return
    event_key = f"booking:{booking.get('id')}:{event}:{source_time}"
    if await _already_delivered(db, event_key):
        return
    result = await dispatch_booking_notification(db, event, booking, settings)
    await _claim_delivered(db, event_key, result)


async def _process_immediate_events(db, settings: dict) -> None:
    recent_cutoff = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
    bookings = await db.bookings.find(
        {
            "$or": [
                {"created_at": {"$gte": recent_cutoff}},
                {"rescheduled_at": {"$gte": recent_cutoff}},
                {"cancelled_at": {"$gte": recent_cutoff}},
            ]
        },
        {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
    ).to_list(1000)

    for booking in bookings:
        status = booking.get("status")
        if status == "confirmed":
            await _dispatch_booking_event(
                db, "booking_confirmed", booking, _iso(booking.get("created_at")), settings
            )
        if booking.get("rescheduled_at") and status == "confirmed":
            await _dispatch_booking_event(
                db, "rescheduled_booking", booking, _iso(booking.get("rescheduled_at")), settings
            )
        if status == "cancelled" and booking.get("cancelled_at"):
            await _dispatch_booking_event(
                db, "booking_cancelled", booking, _iso(booking.get("cancelled_at")), settings
            )


async def _process_reminders(db, settings: dict) -> None:
    automation = normalize_automation(
        "booking_reminder", (settings.get("automations") or {}).get("booking_reminder")
    )
    if not channel_enabled(settings, "booking_reminder", "push"):
        return
    timing_hours = max(1, int(automation.get("timing_hours") or 24))
    now = datetime.now(timezone.utc)
    target = now + timedelta(hours=timing_hours)
    window_start = target - timedelta(minutes=CYCLE_LOOKBACK_MINUTES)
    window_end = target + timedelta(minutes=1)
    bookings = await db.bookings.find(
        {
            "status": "confirmed",
            "start_at_utc": {"$gte": window_start.isoformat(), "$lte": window_end.isoformat()},
        },
        {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
    ).to_list(300)
    for booking in bookings:
        event_key = f"booking:{booking.get('id')}:booking_reminder:{timing_hours}h"
        if await _already_delivered(db, event_key):
            continue
        client = await db.client_accounts.find_one(
            {"client_key": booking.get("client_key")},
            {"_id": 0, "client_key": 1, "name": 1, "phone": 1, "email": 1},
        ) or {}
        message = build_notification("booking_reminder", booking=booking, client=client)
        delivery = await send_client_push(
            db,
            booking.get("client_key"),
            message["title"],
            message["body"],
            message["data"],
        )
        await _claim_delivered(
            db,
            event_key,
            {"sent": int(delivery.get("sent") or 0) > 0, "delivery": delivery},
        )


async def _process_review_requests(db, settings: dict) -> None:
    automation = normalize_automation(
        "leave_a_review", (settings.get("automations") or {}).get("leave_a_review")
    )
    if not channel_enabled(settings, "leave_a_review", "push"):
        return
    timing_hours = max(0, int(automation.get("timing_hours") or 2))
    now = datetime.now(timezone.utc)
    target = now - timedelta(hours=timing_hours)
    lower = target - timedelta(minutes=CYCLE_LOOKBACK_MINUTES)
    upper = target + timedelta(minutes=1)
    bookings = await db.bookings.find(
        {
            "status": "completed",
            "completed_at": {"$gte": lower.isoformat(), "$lte": upper.isoformat()},
        },
        {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
    ).to_list(300)
    for booking in bookings:
        await _dispatch_booking_event(
            db, "leave_a_review", booking, _iso(booking.get("completed_at")), settings
        )


async def process_notification_cycle(db) -> None:
    settings = await db.booking_settings.find_one({"key": "primary"}, {"_id": 0}) or {}
    if not settings.get("notifications_enabled", True):
        return
    await _process_immediate_events(db, settings)
    await _process_reminders(db, settings)
    await _process_review_requests(db, settings)


async def notification_worker(db) -> None:
    while True:
        try:
            await process_notification_cycle(db)
        except asyncio.CancelledError:
            raise
        except Exception:
            # Notification automation must never terminate the booking API process.
            pass
        await asyncio.sleep(POLL_SECONDS)

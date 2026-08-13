from datetime import datetime
from typing import Optional


EVENTS = {
    "booking_confirmed",
    "booking_reminder",
    "rescheduled_booking",
    "booking_cancelled",
    "leave_a_review",
    "waiting_list_alert",
    "rebook_reminder",
    "lapsed_client_winback",
}


def _client_first_name(name: Optional[str]) -> str:
    clean = " ".join(str(name or "").strip().split())
    return clean.split(" ")[0] if clean else "there"


def _appointment_label(booking: dict) -> str:
    service = str(booking.get("service") or "your appointment")
    start = booking.get("start_at")
    if not start:
        return service
    try:
        parsed = datetime.fromisoformat(str(start).replace("Z", "+00:00"))
        when = parsed.strftime("%a %d %b at %H:%M")
        return f"{service} · {when}"
    except Exception:
        return service


def build_notification(event: str, *, booking: Optional[dict] = None, client: Optional[dict] = None, slot: Optional[dict] = None) -> dict:
    if event not in EVENTS:
        raise ValueError("unsupported notification event")

    booking = booking or {}
    client = client or {}
    slot = slot or {}
    first_name = _client_first_name(client.get("name") or booking.get("customer_name"))
    appointment = _appointment_label(booking)

    if event == "booking_confirmed":
        title = "Booking Confirmed ✂️"
        body = f"You’re booked in, {first_name}. {appointment}."
    elif event == "booking_reminder":
        title = "Appointment Reminder"
        body = f"Just a reminder, {first_name}: {appointment}. See you soon."
    elif event == "rescheduled_booking":
        title = "Booking Rescheduled"
        body = f"Your QuincyFadez booking has been moved. New time: {appointment}."
    elif event == "booking_cancelled":
        title = "Booking Cancelled"
        body = f"Your QuincyFadez booking for {appointment} has been cancelled."
    elif event == "leave_a_review":
        title = "How Was Your Cut? ⭐️"
        body = f"Thanks for coming in, {first_name}. If you loved your cut, a quick Google review really helps QuincyFadez."
    elif event == "waiting_list_alert":
        service = str(slot.get("service") or booking.get("service") or "your service")
        date = str(slot.get("date") or "").strip()
        time = str(slot.get("time") or "").strip()
        available = " ".join(part for part in [date, time] if part)
        title = "A Slot Just Opened 👀"
        body = f"{first_name}, a {service} slot is available{f' on {available}' if available else ''}. Open QuincyFadez to book it before it goes."
    elif event == "rebook_reminder":
        title = "Ready For A Fresh Cut?"
        body = f"It’s been a little while, {first_name}. Book your next QuincyFadez appointment whenever you’re ready."
    else:
        title = "Time For A Freshen Up?"
        body = f"We haven’t seen you for a while, {first_name}. Your next QuincyFadez cut is only a few taps away."

    data = {"event": event}
    if booking.get("id"):
        data["booking_id"] = booking["id"]
    if slot:
        data["slot"] = slot
    return {"event": event, "title": title, "body": body, "data": data}

from datetime import date, datetime, timezone
from typing import Optional
import uuid


ACTIVE_WAITING_STATUSES = {"waiting", "notified"}
FINAL_WAITING_STATUSES = {"booked", "cancelled", "expired"}


def _normalise_service(value: str) -> str:
    return " ".join(str(value or "").strip().split())


def _normalise_date(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    parsed = date.fromisoformat(str(value))
    return parsed.isoformat()


def build_waiting_entry(
    *,
    client_key: str,
    service: str,
    preferred_date: Optional[str] = None,
    earliest_time: Optional[str] = None,
    latest_time: Optional[str] = None,
) -> dict:
    clean_client = str(client_key or "").strip()
    clean_service = _normalise_service(service)
    if not clean_client:
        raise ValueError("client_key is required")
    if not clean_service:
        raise ValueError("service is required")

    clean_date = _normalise_date(preferred_date)
    if earliest_time and latest_time and str(latest_time) <= str(earliest_time):
        raise ValueError("latest_time must be later than earliest_time")

    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": str(uuid.uuid4()),
        "client_key": clean_client,
        "service": clean_service,
        "preferred_date": clean_date,
        "earliest_time": str(earliest_time).strip() if earliest_time else None,
        "latest_time": str(latest_time).strip() if latest_time else None,
        "status": "waiting",
        "created_at": now,
        "updated_at": now,
        "notified_at": None,
        "booked_at": None,
        "cancelled_at": None,
        "expired_at": None,
    }


def active_duplicate_filter(entry: dict) -> dict:
    return {
        "client_key": entry["client_key"],
        "service": entry["service"],
        "preferred_date": entry.get("preferred_date"),
        "earliest_time": entry.get("earliest_time"),
        "latest_time": entry.get("latest_time"),
        "status": {"$in": sorted(ACTIVE_WAITING_STATUSES)},
    }


def slot_matches(entry: dict, slot: dict) -> bool:
    if entry.get("status") not in ACTIVE_WAITING_STATUSES:
        return False
    if _normalise_service(entry.get("service")) != _normalise_service(slot.get("service")):
        return False

    slot_date = str(slot.get("date") or "").strip()
    if entry.get("preferred_date") and slot_date != entry.get("preferred_date"):
        return False

    slot_time = str(slot.get("time") or "").strip()
    earliest = entry.get("earliest_time")
    latest = entry.get("latest_time")
    if earliest and slot_time < earliest:
        return False
    if latest and slot_time > latest:
        return False
    return True


def matching_waiters(entries: list[dict], slot: dict) -> list[dict]:
    matches = [entry for entry in entries if slot_matches(entry, slot)]
    return sorted(matches, key=lambda item: str(item.get("created_at") or ""))


def status_patch(status: str) -> dict:
    clean = str(status or "").strip().lower()
    if clean not in ACTIVE_WAITING_STATUSES | FINAL_WAITING_STATUSES:
        raise ValueError("unsupported waiting-list status")
    now = datetime.now(timezone.utc).isoformat()
    patch = {"status": clean, "updated_at": now}
    if clean == "notified":
        patch["notified_at"] = now
    elif clean == "booked":
        patch["booked_at"] = now
    elif clean == "cancelled":
        patch["cancelled_at"] = now
    elif clean == "expired":
        patch["expired_at"] = now
    return patch

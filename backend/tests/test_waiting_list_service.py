from waiting_list_service import (
    active_duplicate_filter,
    build_waiting_entry,
    matching_waiters,
    slot_matches,
    status_patch,
)


def test_build_waiting_entry_normalises_and_starts_waiting():
    entry = build_waiting_entry(
        client_key="qfz_client_123",
        service="  Haircut   &   Beard ",
        preferred_date="2026-08-20",
        earliest_time="10:00",
        latest_time="14:00",
    )
    assert entry["service"] == "Haircut & Beard"
    assert entry["preferred_date"] == "2026-08-20"
    assert entry["status"] == "waiting"
    assert entry["notified_at"] is None


def test_duplicate_filter_targets_same_active_preference():
    entry = build_waiting_entry(
        client_key="qfz_client_123",
        service="Haircut",
        preferred_date="2026-08-20",
        earliest_time="10:00",
        latest_time="12:00",
    )
    query = active_duplicate_filter(entry)
    assert query["client_key"] == "qfz_client_123"
    assert query["service"] == "Haircut"
    assert set(query["status"]["$in"]) == {"waiting", "notified"}


def test_slot_matching_respects_service_date_and_time_window():
    entry = build_waiting_entry(
        client_key="qfz_client_123",
        service="Haircut",
        preferred_date="2026-08-20",
        earliest_time="10:00",
        latest_time="12:00",
    )
    assert slot_matches(entry, {"service": "Haircut", "date": "2026-08-20", "time": "11:00"})
    assert not slot_matches(entry, {"service": "Haircut", "date": "2026-08-21", "time": "11:00"})
    assert not slot_matches(entry, {"service": "Haircut", "date": "2026-08-20", "time": "09:45"})
    assert not slot_matches(entry, {"service": "Beard Trim", "date": "2026-08-20", "time": "11:00"})


def test_matching_waiters_are_fifo():
    first = build_waiting_entry(client_key="qfz_first_123", service="Haircut")
    second = build_waiting_entry(client_key="qfz_second_123", service="Haircut")
    first["created_at"] = "2026-08-13T10:00:00+00:00"
    second["created_at"] = "2026-08-13T10:05:00+00:00"
    matches = matching_waiters(
        [second, first],
        {"service": "Haircut", "date": "2026-08-20", "time": "11:00"},
    )
    assert [item["client_key"] for item in matches] == ["qfz_first_123", "qfz_second_123"]


def test_status_patch_sets_relevant_timestamp():
    notified = status_patch("notified")
    booked = status_patch("booked")
    cancelled = status_patch("cancelled")
    assert notified["status"] == "notified" and notified.get("notified_at")
    assert booked["status"] == "booked" and booked.get("booked_at")
    assert cancelled["status"] == "cancelled" and cancelled.get("cancelled_at")

AUTOMATION_DEFAULTS = {
    "booking_confirmed": {
        "enabled": True,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_minutes": 0,
    },
    "booking_reminder": {
        "enabled": True,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_hours": 24,
    },
    "rescheduled_booking": {
        "enabled": True,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_minutes": 0,
    },
    "booking_cancelled": {
        "enabled": True,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_minutes": 0,
    },
    "leave_a_review": {
        "enabled": True,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_hours": 2,
    },
    "waiting_list_alert": {
        "enabled": True,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_minutes": 0,
    },
    "rebook_reminder": {
        "enabled": True,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_weeks": 3,
    },
    "lapsed_client_winback": {
        "enabled": False,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_weeks": 8,
    },
    "google_review_booster": {
        "enabled": False,
        "channels": {"push": True, "sms": False, "email": False},
        "timing_hours": 24,
    },
}

CLIENT_NOTIFICATION_DEFAULTS = {
    "confirmations": True,
    "reminders": True,
    "reschedule": True,
    "waitlist": True,
    "reviews": True,
}

EVENT_TO_CLIENT_PREFERENCE = {
    "booking_confirmed": "confirmations",
    "booking_cancelled": "confirmations",
    "booking_reminder": "reminders",
    "rebook_reminder": "reminders",
    "lapsed_client_winback": "reminders",
    "rescheduled_booking": "reschedule",
    "waiting_list_alert": "waitlist",
    "leave_a_review": "reviews",
    "google_review_booster": "reviews",
}


def normalize_channels(value: dict | None) -> dict:
    value = value or {}
    channels = value.get("channels")
    if isinstance(channels, dict):
        return {
            "push": bool(channels.get("push", False)),
            "sms": bool(channels.get("sms", False)),
            "email": bool(channels.get("email", False)),
        }

    legacy = value.get("channel")
    if legacy in {"push", "sms", "email"}:
        return {
            "push": legacy == "push",
            "sms": legacy == "sms",
            "email": legacy == "email",
        }

    return {"push": True, "sms": False, "email": False}


def normalize_automation(key: str, value: dict | None) -> dict:
    default = AUTOMATION_DEFAULTS.get(key, {"enabled": False, "channels": {"push": True, "sms": False, "email": False}})
    supplied = value if isinstance(value, dict) else {}
    merged = {**default, **supplied}
    merged["channels"] = normalize_channels(supplied if supplied else default)
    merged.pop("channel", None)
    return merged


def normalize_automations(values: dict | None) -> dict:
    values = values or {}
    keys = list(AUTOMATION_DEFAULTS)
    for key in values:
        if key not in keys:
            keys.append(key)
    return {key: normalize_automation(key, values.get(key)) for key in keys}


def channel_enabled(settings: dict | None, automation_key: str, channel: str) -> bool:
    if not settings or not settings.get("notifications_enabled", True):
        return False
    automation = normalize_automation(automation_key, (settings.get("automations") or {}).get(automation_key))
    return bool(automation.get("enabled") and automation.get("channels", {}).get(channel, False))


def normalize_client_preferences(values: dict | None) -> dict:
    values = values or {}
    return {
        key: bool(values.get(key, default))
        for key, default in CLIENT_NOTIFICATION_DEFAULTS.items()
    }


def client_event_enabled(values: dict | None, event: str | None) -> bool:
    preference_key = EVENT_TO_CLIENT_PREFERENCE.get(str(event or ""))
    if not preference_key:
        return True
    preferences = normalize_client_preferences(values)
    return bool(preferences.get(preference_key, True))

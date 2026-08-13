from notification_preferences import channel_enabled, normalize_automation, normalize_automations


def test_legacy_push_channel_migrates_to_channel_map():
    automation = normalize_automation("booking_confirmed", {"enabled": True, "channel": "push"})
    assert automation["channels"] == {"push": True, "sms": False, "email": False}
    assert "channel" not in automation


def test_sms_and_email_are_off_by_default():
    automations = normalize_automations({})
    reminder = automations["booking_reminder"]
    assert reminder["enabled"] is True
    assert reminder["channels"]["push"] is True
    assert reminder["channels"]["sms"] is False
    assert reminder["channels"]["email"] is False


def test_saved_channel_map_is_preserved():
    automation = normalize_automation(
        "booking_reminder",
        {"enabled": True, "channels": {"push": True, "sms": True, "email": False}, "timing_hours": 12},
    )
    assert automation["channels"] == {"push": True, "sms": True, "email": False}
    assert automation["timing_hours"] == 12


def test_master_notification_switch_disables_delivery():
    settings = {
        "notifications_enabled": False,
        "automations": {"booking_confirmed": {"enabled": True, "channels": {"push": True}}},
    }
    assert channel_enabled(settings, "booking_confirmed", "push") is False


def test_disabled_automation_cannot_deliver():
    settings = {
        "notifications_enabled": True,
        "automations": {"booking_confirmed": {"enabled": False, "channels": {"push": True}}},
    }
    assert channel_enabled(settings, "booking_confirmed", "push") is False

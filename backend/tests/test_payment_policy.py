"""Unit tests for the QuincyFadez guarded payment policy."""
from payment_policy import PaymentCapabilities, build_booking_payment_plan


def test_verified_card_is_never_treated_as_payment_by_policy():
    plan = build_booking_payment_plan(20, {}, PaymentCapabilities())
    assert plan["booking_payment_status"] == "not_charged"
    assert plan["card_verification_is_payment"] is False
    assert plan["deposit"]["amount_due_now"] == 0


def test_configured_deposit_stays_non_chargeable_until_capture_is_enabled():
    plan = build_booking_payment_plan(
        20,
        {"deposits_enabled": True, "deposit_amount": 10},
        PaymentCapabilities(deposit_capture=False),
    )
    assert plan["deposit"]["configured"] is True
    assert plan["deposit"]["chargeable"] is False
    assert plan["deposit"]["requested_amount"] == 10
    assert plan["deposit"]["amount_due_now"] == 0
    assert plan["booking_payment_status"] == "not_charged"


def test_deposit_only_becomes_due_with_backend_capture_capability():
    plan = build_booking_payment_plan(
        25,
        {"deposits_enabled": True, "deposit_amount": 10},
        PaymentCapabilities(deposit_capture=True),
    )
    assert plan["deposit"]["chargeable"] is True
    assert plan["deposit"]["amount_due_now"] == 10
    assert plan["booking_payment_status"] == "deposit_required"


def test_deposit_cannot_exceed_service_value():
    plan = build_booking_payment_plan(
        10,
        {"deposits_enabled": True, "deposit_amount": 50},
        PaymentCapabilities(deposit_capture=True),
    )
    assert plan["deposit"]["requested_amount"] == 10
    assert plan["deposit"]["amount_due_now"] == 10


def test_cancellation_fee_stays_non_chargeable_without_capability():
    plan = build_booking_payment_plan(
        20,
        {"cancellation_fee_enabled": True, "cancellation_fee_amount": 15},
        PaymentCapabilities(cancellation_fee_capture=False),
    )
    assert plan["cancellation_fee"]["configured"] is True
    assert plan["cancellation_fee"]["chargeable"] is False
    assert plan["cancellation_fee"]["requested_amount"] == 15


def test_negative_or_invalid_money_values_are_safely_zeroed():
    plan = build_booking_payment_plan(
        20,
        {"deposits_enabled": True, "deposit_amount": -5, "cancellation_fee_enabled": True, "cancellation_fee_amount": "bad"},
        PaymentCapabilities(deposit_capture=True, cancellation_fee_capture=True),
    )
    assert plan["deposit"]["configured"] is False
    assert plan["deposit"]["amount_due_now"] == 0
    assert plan["cancellation_fee"]["configured"] is False
    assert plan["cancellation_fee"]["requested_amount"] == 0

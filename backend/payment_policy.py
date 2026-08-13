"""Safe payment-policy helpers for QuincyFadez bookings.

This module deliberately contains no Stripe charge calls. It turns admin payment
settings into an explicit payment plan and refuses to treat a configured fee as
chargeable unless the corresponding capture capability has been enabled by the
backend.
"""
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Mapping


_MONEY = Decimal("0.01")


def _money(value: Any) -> Decimal:
    try:
        amount = Decimal(str(value or 0))
    except Exception:
        amount = Decimal("0")
    return max(Decimal("0"), amount).quantize(_MONEY, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class PaymentCapabilities:
    """Server-side switches for money-moving features.

    These must come from trusted backend configuration, never from the client.
    """

    deposit_capture: bool = False
    cancellation_fee_capture: bool = False

    def as_dict(self) -> dict[str, bool]:
        return {
            "deposit_capture": self.deposit_capture,
            "cancellation_fee_capture": self.cancellation_fee_capture,
        }


def build_booking_payment_plan(
    service_price: Any,
    settings: Mapping[str, Any] | None,
    capabilities: PaymentCapabilities | None = None,
) -> dict[str, Any]:
    """Return the payment plan that may safely be shown/stored for a booking.

    A saved/verified card is not a payment. Deposit and cancellation-fee settings
    are therefore considered *configured* separately from being *chargeable*.
    """

    settings = settings or {}
    capabilities = capabilities or PaymentCapabilities()
    service_value = _money(service_price)

    deposit_configured = bool(settings.get("deposits_enabled")) and _money(settings.get("deposit_amount")) > 0
    requested_deposit = min(_money(settings.get("deposit_amount")), service_value) if deposit_configured else Decimal("0")
    deposit_chargeable = bool(deposit_configured and capabilities.deposit_capture)
    deposit_due = requested_deposit if deposit_chargeable else Decimal("0")

    cancellation_fee_configured = bool(settings.get("cancellation_fee_enabled")) and _money(settings.get("cancellation_fee_amount")) > 0
    requested_cancellation_fee = _money(settings.get("cancellation_fee_amount")) if cancellation_fee_configured else Decimal("0")
    cancellation_fee_chargeable = bool(cancellation_fee_configured and capabilities.cancellation_fee_capture)

    if deposit_chargeable and deposit_due > 0:
        booking_payment_status = "deposit_required"
    else:
        booking_payment_status = "not_charged"

    return {
        "currency": "GBP",
        "service_value": float(service_value),
        "booking_payment_status": booking_payment_status,
        "card_verification_is_payment": False,
        "deposit": {
            "configured": deposit_configured,
            "chargeable": deposit_chargeable,
            "requested_amount": float(requested_deposit),
            "amount_due_now": float(deposit_due),
        },
        "cancellation_fee": {
            "configured": cancellation_fee_configured,
            "chargeable": cancellation_fee_chargeable,
            "requested_amount": float(requested_cancellation_fee),
        },
        "capabilities": capabilities.as_dict(),
    }

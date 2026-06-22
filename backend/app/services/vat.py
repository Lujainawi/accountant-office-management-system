from decimal import Decimal, ROUND_HALF_UP

from app.utils.money_validation import (
    validate_amount_before_vat,
    validate_storable_money_values,
    validate_vat_rate,
)

TWO_PLACES = Decimal("0.01")
HUNDRED = Decimal("100")


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def calculate_vat_amounts(
    amount_before_vat: Decimal, vat_rate: Decimal
) -> tuple[Decimal, Decimal]:
    vat_amount = quantize_money(amount_before_vat * vat_rate / HUNDRED)
    total_amount = quantize_money(amount_before_vat + vat_amount)
    return vat_amount, total_amount


def calculate_reverse_vat_amounts(
    total_amount: Decimal, vat_rate: Decimal
) -> tuple[Decimal, Decimal]:
    if vat_rate == Decimal("0.00"):
        amount_before_vat = quantize_money(total_amount)
    else:
        amount_before_vat = quantize_money(
            total_amount / (Decimal("1") + vat_rate / HUNDRED)
        )
    vat_amount = quantize_money(total_amount - amount_before_vat)
    return amount_before_vat, vat_amount


def compute_forward_vat(
    amount_before_vat: Decimal, vat_rate: Decimal
) -> tuple[Decimal, Decimal, Decimal]:
    validated_amount = validate_amount_before_vat(amount_before_vat)
    validated_rate = validate_vat_rate(vat_rate)
    vat_amount, total_amount = calculate_vat_amounts(validated_amount, validated_rate)
    validate_storable_money_values(validated_amount, vat_amount, total_amount)
    return validated_amount, vat_amount, total_amount


def compute_reverse_vat(
    total_amount: Decimal, vat_rate: Decimal
) -> tuple[Decimal, Decimal, Decimal]:
    validated_total = validate_amount_before_vat(total_amount)
    validated_rate = validate_vat_rate(vat_rate)
    amount_before_vat, vat_amount = calculate_reverse_vat_amounts(
        validated_total, validated_rate
    )
    validate_storable_money_values(amount_before_vat, vat_amount, validated_total)
    return amount_before_vat, vat_amount, validated_total

from decimal import Decimal, ROUND_HALF_UP

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

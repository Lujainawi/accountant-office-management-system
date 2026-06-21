from decimal import Decimal

from app.services.vat import calculate_vat_amounts


def test_calculate_vat_amounts_default_example():
    vat_amount, total_amount = calculate_vat_amounts(Decimal("1000.00"), Decimal("18.00"))
    assert vat_amount == Decimal("180.00")
    assert total_amount == Decimal("1180.00")


def test_calculate_vat_amounts_zero_amount():
    vat_amount, total_amount = calculate_vat_amounts(Decimal("0.00"), Decimal("18.00"))
    assert vat_amount == Decimal("0.00")
    assert total_amount == Decimal("0.00")

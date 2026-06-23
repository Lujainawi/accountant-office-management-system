from decimal import Decimal

import pytest

from app.services.vat import (
    calculate_vat_amounts,
    compute_forward_vat,
    compute_reverse_vat,
)
from app.utils.money_validation import (
    MoneyValidationError,
    validate_amount_before_vat,
    validate_storable_money_values,
    validate_vat_rate,
)


def test_calculate_vat_amounts_default_example():
    vat_amount, total_amount = calculate_vat_amounts(Decimal("1000.00"), Decimal("18.00"))
    assert vat_amount == Decimal("180.00")
    assert total_amount == Decimal("1180.00")


def test_calculate_vat_amounts_zero_amount():
    vat_amount, total_amount = calculate_vat_amounts(Decimal("0.00"), Decimal("18.00"))
    assert vat_amount == Decimal("0.00")
    assert total_amount == Decimal("0.00")


def test_compute_forward_half_up_vector():
    before, vat, total = compute_forward_vat(Decimal("0.01"), Decimal("50.00"))
    assert before == Decimal("0.01")
    assert vat == Decimal("0.01")
    assert total == Decimal("0.02")


def test_compute_forward_rejects_invalid_vat_scale():
    with pytest.raises(MoneyValidationError):
        compute_forward_vat(Decimal("100.00"), Decimal("18.001"))


def test_compute_forward_rejects_invalid_amount_scale():
    with pytest.raises(MoneyValidationError):
        compute_forward_vat(Decimal("10.005"), Decimal("18.00"))


def test_compute_forward_rejects_vat_over_max():
    with pytest.raises(MoneyValidationError):
        compute_forward_vat(Decimal("100.00"), Decimal("100.01"))


def test_compute_forward_rejects_non_finite_amount():
    with pytest.raises(MoneyValidationError):
        compute_forward_vat(Decimal("NaN"), Decimal("18.00"))


def test_compute_forward_rejects_calculated_overflow():
    with pytest.raises(MoneyValidationError):
        compute_forward_vat(Decimal("999999999999.99"), Decimal("0.01"))


def test_compute_forward_max_amount_zero_vat():
    before, vat, total = compute_forward_vat(
        Decimal("999999999999.99"), Decimal("0.00")
    )
    assert before == Decimal("999999999999.99")
    assert vat == Decimal("0.00")
    assert total == Decimal("999999999999.99")


def test_compute_reverse_rounding_case():
    before, vat, total = compute_reverse_vat(Decimal("100.00"), Decimal("18.00"))
    assert before == Decimal("84.75")
    assert vat == Decimal("15.25")
    assert total == Decimal("100.00")


def test_compute_reverse_clean_example():
    before, vat, total = compute_reverse_vat(Decimal("1180.00"), Decimal("18.00"))
    assert before == Decimal("1000.00")
    assert vat == Decimal("180.00")
    assert total == Decimal("1180.00")


def test_compute_reverse_max_total_zero_vat():
    before, vat, total = compute_reverse_vat(
        Decimal("999999999999.99"), Decimal("0.00")
    )
    assert before == Decimal("999999999999.99")
    assert vat == Decimal("0.00")
    assert total == Decimal("999999999999.99")


def test_validate_vat_rate_examples():
    assert validate_vat_rate(Decimal("18.00")) == Decimal("18.00")
    assert validate_vat_rate(Decimal("0.50")) == Decimal("0.50")
    assert validate_vat_rate(Decimal("100.00")) == Decimal("100.00")

    with pytest.raises(MoneyValidationError):
        validate_vat_rate(Decimal("100.01"))
    with pytest.raises(MoneyValidationError):
        validate_vat_rate(Decimal("-0.01"))
    with pytest.raises(MoneyValidationError):
        validate_vat_rate(Decimal("18.001"))


def test_validate_amount_examples():
    assert validate_amount_before_vat(Decimal("999999999999.99")) == Decimal(
        "999999999999.99"
    )

    with pytest.raises(MoneyValidationError):
        validate_amount_before_vat(Decimal("1000000000000.00"))
    with pytest.raises(MoneyValidationError):
        validate_amount_before_vat(Decimal("10.005"))
    with pytest.raises(MoneyValidationError):
        validate_amount_before_vat(Decimal("NaN"))
    with pytest.raises(MoneyValidationError):
        validate_amount_before_vat(Decimal("Infinity"))


def test_validate_storable_money_values_rejects_overflow():
    with pytest.raises(MoneyValidationError):
        validate_storable_money_values(
            Decimal("999999999999.99"),
            Decimal("0.01"),
            Decimal("1000000000000.00"),
        )


def test_vat_calculate_requires_auth(test_app):
    response = test_app["client"].post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "1000.00",
            "vat_rate": "18.00",
        },
    )
    assert response.status_code == 401


def test_vat_calculate_forward_mode(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "1000.00",
            "vat_rate": "18.00",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["amount_before_vat"] == "1000.00"
    assert payload["vat_amount"] == "180.00"
    assert payload["total_amount"] == "1180.00"


def test_vat_calculate_reverse_mode(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_total_including_vat",
            "amount": "1180.00",
            "vat_rate": "18.00",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["amount_before_vat"] == "1000.00"
    assert payload["vat_amount"] == "180.00"
    assert payload["total_amount"] == "1180.00"


def test_vat_calculate_rejects_null_amount(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": None,
            "vat_rate": "18.00",
        },
    )
    assert response.status_code == 422


def test_vat_calculate_rejects_null_vat_rate(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "100.00",
            "vat_rate": None,
        },
    )
    assert response.status_code == 422


def test_vat_calculate_rejects_infinity_amount(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "Infinity",
            "vat_rate": "18.00",
        },
    )
    assert response.status_code == 422


def test_vat_calculate_rejects_nan_vat_rate(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "100.00",
            "vat_rate": "NaN",
        },
    )
    assert response.status_code == 422


def test_vat_calculate_rejects_invalid_vat_scale(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "100.00",
            "vat_rate": "18.001",
        },
    )
    assert response.status_code == 422


def test_vat_calculate_rejects_vat_over_max(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "100.00",
            "vat_rate": "100.01",
        },
    )
    assert response.status_code == 422


def test_vat_calculate_forward_overflow_not_500(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "999999999999.99",
            "vat_rate": "0.01",
        },
    )
    assert response.status_code == 422


def test_vat_calculate_reverse_max_total(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_total_including_vat",
            "amount": "999999999999.99",
            "vat_rate": "0.00",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["amount_before_vat"] == "999999999999.99"
    assert payload["vat_amount"] == "0.00"
    assert payload["total_amount"] == "999999999999.99"


def test_vat_calculate_half_up_vector(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "0.01",
            "vat_rate": "50.00",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["vat_amount"] == "0.01"
    assert payload["total_amount"] == "0.02"


def test_vat_calculate_rejects_negative_vat_rate(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "from_before_vat",
            "amount": "100.00",
            "vat_rate": "-1.00",
        },
    )
    assert response.status_code == 422


def test_vat_calculate_rejects_invalid_mode(auth_client):
    response = auth_client.post(
        "/api/vat/calculate",
        json={
            "mode": "invalid_mode",
            "amount": "100.00",
            "vat_rate": "18.00",
        },
    )
    assert response.status_code == 422

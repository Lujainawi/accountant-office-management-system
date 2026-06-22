from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_serializer, field_validator

from app.utils.money_validation import validate_amount_before_vat, validate_vat_rate

VatCalculationMode = Literal["from_before_vat", "from_total_including_vat"]


class VatCalculateRequest(BaseModel):
    mode: VatCalculationMode
    amount: Decimal
    vat_rate: Decimal

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, value: Decimal) -> Decimal:
        return validate_amount_before_vat(value)

    @field_validator("vat_rate")
    @classmethod
    def validate_vat_rate_field(cls, value: Decimal) -> Decimal:
        return validate_vat_rate(value)


class VatCalculateResponse(BaseModel):
    mode: VatCalculationMode
    vat_rate: Decimal
    amount_before_vat: Decimal
    vat_amount: Decimal
    total_amount: Decimal

    @field_serializer(
        "vat_rate", "amount_before_vat", "vat_amount", "total_amount"
    )
    def serialize_money(self, value: Decimal) -> str:
        return f"{value:.2f}"

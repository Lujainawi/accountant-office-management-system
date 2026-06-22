from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class OcrMockProcessRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    preset: str = Field(min_length=1, max_length=80)


class OcrExtractedFields(BaseModel):
    vendor_name: str
    document_name: str
    document_date: str
    amount_before_vat: Decimal
    vat_rate: Decimal
    vat_amount: Decimal
    total_amount: Decimal
    currency: str = "ILS"

    @field_serializer("amount_before_vat", "vat_rate", "vat_amount", "total_amount")
    def serialize_money(self, value: Decimal) -> str:
        return f"{value:.2f}"


class OcrMockProcessResponse(BaseModel):
    preset: str
    extracted_fields: OcrExtractedFields
    disclaimer: str
    is_mock: bool = True
    data_source: str = "sample"

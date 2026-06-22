from decimal import Decimal

from pydantic import BaseModel, Field, field_serializer

ZERO_MONEY = Decimal("0.00")


class DocumentsByStatus(BaseModel):
    new: int = 0
    in_progress: int = 0
    completed: int = 0
    missing_information: int = 0


class PaymentsByStatus(BaseModel):
    unpaid: int = 0
    paid: int = 0
    partially_paid: int = 0
    pending: int = 0
    failed: int = 0


class ClientSummaryResponse(BaseModel):
    client_id: int
    document_count: int = 0
    documents_by_status: DocumentsByStatus = Field(default_factory=DocumentsByStatus)
    total_before_vat: Decimal = ZERO_MONEY
    vat_total: Decimal = ZERO_MONEY
    total_including_vat: Decimal = ZERO_MONEY
    open_task_count: int = 0
    payment_record_count: int = 0
    payments_by_status: PaymentsByStatus = Field(default_factory=PaymentsByStatus)

    @field_serializer("total_before_vat", "vat_total", "total_including_vat")
    def serialize_money(self, value: Decimal) -> str:
        return f"{value:.2f}"

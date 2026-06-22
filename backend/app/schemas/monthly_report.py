from decimal import Decimal

from pydantic import BaseModel, Field, field_serializer

from app.schemas.client_summary import DocumentsByStatus

ZERO_MONEY = Decimal("0.00")


class MonthlyReportPeriod(BaseModel):
    year: int
    month: int


class MonthlyReportSummary(BaseModel):
    clients_handled: int = 0
    document_count: int = 0
    total_before_vat: Decimal = ZERO_MONEY
    vat_total: Decimal = ZERO_MONEY
    total_including_vat: Decimal = ZERO_MONEY

    @field_serializer("total_before_vat", "vat_total", "total_including_vat")
    def serialize_money(self, value: Decimal) -> str:
        return f"{value:.2f}"


class MonthlyReportClientRow(BaseModel):
    client_id: int
    client_name: str
    document_count: int = 0
    total_before_vat: Decimal = ZERO_MONEY
    vat_total: Decimal = ZERO_MONEY
    total_including_vat: Decimal = ZERO_MONEY

    @field_serializer("total_before_vat", "vat_total", "total_including_vat")
    def serialize_money(self, value: Decimal) -> str:
        return f"{value:.2f}"


class MonthlyReportResponse(BaseModel):
    period: MonthlyReportPeriod
    summary: MonthlyReportSummary
    documents_by_status: DocumentsByStatus = Field(default_factory=DocumentsByStatus)
    clients: list[MonthlyReportClientRow] = Field(default_factory=list)

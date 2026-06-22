from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field, field_serializer

from app.schemas.client_summary import DocumentsByStatus
from app.schemas.task import TaskPriority, TaskStatus

ZERO_MONEY = Decimal("0.00")


class DashboardCurrentMonth(BaseModel):
    year: int
    month: int


class DashboardUrgentTaskItem(BaseModel):
    id: int
    title: str
    client_id: int
    client_name: str
    due_date: date | None
    status: TaskStatus
    priority: TaskPriority
    is_overdue: bool

    @field_serializer("due_date")
    def serialize_due_date(self, value: date | None) -> str | None:
        if value is None:
            return None
        return value.isoformat()


class DashboardMissingInfoDocumentItem(BaseModel):
    id: int
    document_name: str
    client_id: int
    client_name: str
    document_date: date
    status: str

    @field_serializer("document_date")
    def serialize_document_date(self, value: date) -> str:
        return value.isoformat()


class DashboardNeedsAttention(BaseModel):
    urgent_tasks: list[DashboardUrgentTaskItem] = Field(default_factory=list)
    missing_information_documents: list[DashboardMissingInfoDocumentItem] = Field(
        default_factory=list
    )


class DashboardSummaryResponse(BaseModel):
    office_name: str
    default_currency: str
    current_month: DashboardCurrentMonth
    total_clients: int = 0
    active_clients: int = 0
    total_documents: int = 0
    documents_by_status: DocumentsByStatus = Field(default_factory=DocumentsByStatus)
    open_task_count: int = 0
    urgent_task_count: int = 0
    current_month_total_before_vat: Decimal = ZERO_MONEY
    current_month_vat_total: Decimal = ZERO_MONEY
    current_month_total_including_vat: Decimal = ZERO_MONEY
    needs_attention: DashboardNeedsAttention = Field(default_factory=DashboardNeedsAttention)

    @field_serializer(
        "current_month_total_before_vat",
        "current_month_vat_total",
        "current_month_total_including_vat",
    )
    def serialize_money(self, value: Decimal) -> str:
        return f"{value:.2f}"

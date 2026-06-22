from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

INTEGRATION_SERVICE_NAMES = (
    "email",
    "ocr",
    "tax_authority",
    "digital_signature",
    "online_payments",
    "ai_assistant",
)


class IntegrationStatus(Base):
    __tablename__ = "integration_statuses"
    __table_args__ = (
        UniqueConstraint("service_name", name="uq_integration_statuses_service_name"),
        Index("ix_integration_statuses_service_name", "service_name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    service_name: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    mode: Mapped[str] = mapped_column(String(50), nullable=False)
    configured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

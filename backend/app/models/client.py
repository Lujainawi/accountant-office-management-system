from datetime import datetime

from sqlalchemy import DateTime, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

CLIENT_TYPES = (
    "private_client",
    "exempt_dealer",
    "authorized_dealer",
    "company",
    "other",
)

CLIENT_STATUSES = ("active", "inactive")


class Client(Base):
    __tablename__ = "clients"
    __table_args__ = (
        Index("ix_clients_client_name", "client_name"),
        Index("ix_clients_business_name", "business_name"),
        Index("ix_clients_status", "status"),
        Index("ix_clients_client_type", "client_type"),
        Index("ix_clients_business_id", "business_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_name: Mapped[str] = mapped_column(String(160), nullable=False)
    business_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    business_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    client_type: Mapped[str] = mapped_column(String(30), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

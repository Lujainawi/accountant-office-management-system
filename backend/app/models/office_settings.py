from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class OfficeSettings(Base):
    __tablename__ = "office_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    accountant_name: Mapped[str] = mapped_column(String(120), nullable=False)
    office_name: Mapped[str] = mapped_column(String(160), nullable=False)
    default_vat_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    default_currency: Mapped[str] = mapped_column(String(3), nullable=False)
    allowed_file_extensions: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

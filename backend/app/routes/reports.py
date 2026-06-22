from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.monthly_report import MonthlyReportResponse
from app.services.monthly_report import get_monthly_report

router = APIRouter(tags=["reports"])

MONTH_REQUIRED_MESSAGE = "יש לבחור חודש."
YEAR_REQUIRED_MESSAGE = "יש לבחור שנה."
INVALID_MONTH_MESSAGE = "חודש לא תקין. יש לבחור ערך בין 1 ל-12."
INVALID_YEAR_MESSAGE = "שנה לא תקינה. יש לבחור ערך בין 1900 ל-2100."


def _validate_month_year(month: int | None, year: int | None) -> tuple[int, int]:
    if month is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=MONTH_REQUIRED_MESSAGE,
        )
    if year is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=YEAR_REQUIRED_MESSAGE,
        )
    if month < 1 or month > 12:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=INVALID_MONTH_MESSAGE,
        )
    if year < 1900 or year > 2100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=INVALID_YEAR_MESSAGE,
        )
    return month, year


@router.get("/reports/monthly", response_model=MonthlyReportResponse)
def read_monthly_report(
    month: int | None = Query(default=None),
    year: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MonthlyReportResponse:
    _ = current_user
    validated_month, validated_year = _validate_month_year(month, year)
    return get_monthly_report(db, year=validated_year, month=validated_month)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_summary import get_dashboard_summary

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def read_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardSummaryResponse:
    _ = current_user
    return get_dashboard_summary(db)

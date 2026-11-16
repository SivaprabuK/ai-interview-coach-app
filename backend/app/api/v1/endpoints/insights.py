
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.insights import InsightsOverviewResponse
from app.services.ai.insights_service import InsightsService


router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("/overview")
def get_insights_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    insights = InsightsService(db).get_insights(
        user_id=current_user.id
    )

    return {
        "status": True,
        "data": InsightsOverviewResponse(**insights).model_dump(),
        "status_code": status.HTTP_200_OK,
        "message": "Insights retrieved successfully",
    }

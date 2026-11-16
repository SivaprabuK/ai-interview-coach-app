from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class InsightItem(BaseModel):
    name: str
    count: int

class ScoreTrendItem(BaseModel):
    evaluation_id: int
    score: int = Field(ge=0, le=100)
    created_at: datetime

class InsightsOverviewResponse(BaseModel):
    total_evaluations: int
    average_score: float = Field(ge=0, le=100)
    recent_score_trend: list[ScoreTrendItem]
    top_strengths: list[InsightItem]
    improvement_areas: list[InsightItem]

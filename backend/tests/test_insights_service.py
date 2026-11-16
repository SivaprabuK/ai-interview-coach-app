
from datetime import datetime, timezone
from unittest.mock import MagicMock

from app.services.ai.insights_service import InsightsService


def create_evaluation(
    evaluation_id,
    score,
    strengths,
    areas_to_improve,
    created_at,
):
    return MagicMock(
        id=evaluation_id,
        score=score,
        strengths=strengths,
        areas_to_improve=areas_to_improve,
        created_at=created_at,
    )


def test_get_insights_calculates_metrics():
    db = MagicMock()

    evaluations = [
        create_evaluation(
            3, 90,
            ["Clear explanation", "Good examples"],
            ["Improve technical depth"],
            datetime(2026, 11, 12, tzinfo=timezone.utc),
        ),
        create_evaluation(
            2, 70,
            ["Clear explanation"],
            ["Improve technical depth", "Add examples"],
            datetime(2026, 11, 11, tzinfo=timezone.utc),
        ),
        create_evaluation(
            1, 80,
            ["Good examples"],
            ["Add examples"],
            datetime(2026, 11, 10, tzinfo=timezone.utc),
        ),
    ]

    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = (
        evaluations
    )

    service = InsightsService(db)

    result = service.get_insights(user_id=1)

    assert result["total_evaluations"] == 3
    assert result["average_score"] == 80.0

    assert [
        item["evaluation_id"]
        for item in result["recent_score_trend"]
    ] == [1, 2, 3]

    assert result["top_strengths"] == [
        {"name": "Clear explanation", "count": 2},
        {"name": "Good examples", "count": 2},
    ]

    assert result["improvement_areas"] == [
        {"name": "Improve technical depth", "count": 2},
        {"name": "Add examples", "count": 2},
    ]

    db.query.assert_called_once()


def test_get_insights_returns_empty_defaults():
    db = MagicMock()

    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = (
        []
    )

    service = InsightsService(db)

    result = service.get_insights(user_id=1)

    assert result["total_evaluations"] == 0
    assert result["average_score"] == 0.0
    assert result["recent_score_trend"] == []
    assert result["top_strengths"] == []
    assert result["improvement_areas"] == []


def test_get_insights_limits_recent_trend_to_ten():
    db = MagicMock()

    evaluations = [
        create_evaluation(
            i,
            50 + i,
            [],
            [],
            datetime(2026, 11, i, tzinfo=timezone.utc),
        )
        for i in range(12, 0, -1)
    ]

    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = (
        evaluations
    )

    service = InsightsService(db)

    result = service.get_insights(user_id=1)

    assert result["total_evaluations"] == 12
    assert len(result["recent_score_trend"]) == 10
    assert result["recent_score_trend"][0]["evaluation_id"] == 3
    assert result["recent_score_trend"][-1]["evaluation_id"] == 12

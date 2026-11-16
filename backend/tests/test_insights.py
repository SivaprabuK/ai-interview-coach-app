
from unittest.mock import MagicMock, patch


@patch("app.api.v1.endpoints.insights.InsightsService")
def test_get_insights_overview_success(
    mock_service_class, client, auth_headers, auth_user
):
    mock_service = MagicMock()
    mock_service_class.return_value = mock_service

    mock_service.get_insights.return_value = {
        "total_evaluations": 2,
        "average_score": 75.0,
        "recent_score_trend": [
            {
                "evaluation_id": 1,
                "score": 70,
                "created_at": "2026-11-10T10:00:00+00:00",
            },
            {
                "evaluation_id": 2,
                "score": 80,
                "created_at": "2026-11-11T10:00:00+00:00",
            },
        ],
        "top_strengths": [
            {"name": "Clear explanation", "count": 2},
        ],
        "improvement_areas": [
            {"name": "Add examples", "count": 1},
        ],
    }

    response = client.get(
        "/api/v1/insights/overview",
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()

    assert body["status"] is True
    assert body["data"]["total_evaluations"] == 2
    assert body["data"]["average_score"] == 75.0
    assert len(body["data"]["recent_score_trend"]) == 2
    assert body["data"]["top_strengths"][0]["name"] == "Clear explanation"
    assert body["data"]["improvement_areas"][0]["name"] == "Add examples"

    mock_service.get_insights.assert_called_once_with(
        user_id=auth_user.id
    )


@patch("app.api.v1.endpoints.insights.InsightsService")
def test_get_insights_overview_empty(
    mock_service_class, client, auth_headers
):
    mock_service = MagicMock()
    mock_service_class.return_value = mock_service

    mock_service.get_insights.return_value = {
        "total_evaluations": 0,
        "average_score": 0.0,
        "recent_score_trend": [],
        "top_strengths": [],
        "improvement_areas": [],
    }

    response = client.get(
        "/api/v1/insights/overview",
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()

    assert body["status"] is True
    assert body["data"]["total_evaluations"] == 0
    assert body["data"]["average_score"] == 0.0
    assert body["data"]["recent_score_trend"] == []
    assert body["data"]["top_strengths"] == []
    assert body["data"]["improvement_areas"] == []


def test_get_insights_requires_authentication(client):
    response = client.get("/api/v1/insights/overview")

    assert response.status_code == 401

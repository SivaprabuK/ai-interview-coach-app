from collections import Counter
from sqlalchemy.orm import Session
from app.models.answer_evaluation import AnswerEvaluation


class InsightsService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_insights(self, user_id: int) -> dict:
        evaluations = (
            self.db.query(AnswerEvaluation)
            .filter(AnswerEvaluation.user_id == user_id)
            .order_by(
                AnswerEvaluation.created_at.desc(),
                AnswerEvaluation.id.desc(),
            )
            .all()
        )

        total_evaluations = len(evaluations)

        average_score = (
            round(
                sum(item.score for item in evaluations)
                / total_evaluations,
                2,
            )
            if total_evaluations
            else 0.0
        )

        recent_score_trend = [
            {
                "evaluation_id": item.id,
                "score": item.score,
                "created_at": item.created_at,
            }
            for item in reversed(evaluations[:10])
        ]

        strengths_counter = Counter(
            strength.strip()
            for item in evaluations
            for strength in item.strengths
            if strength and strength.strip()
        )

        improvements_counter = Counter(
            area.strip()
            for item in evaluations
            for area in item.areas_to_improve
            if area and area.strip()
        )

        return {
            "total_evaluations": total_evaluations,
            "average_score": average_score,
            "recent_score_trend": recent_score_trend,
            "top_strengths": [
                {"name": name, "count": count}
                for name, count in strengths_counter.most_common(5)
            ],
            "improvement_areas": [
                {"name": name, "count": count}
                for name, count in improvements_counter.most_common(5)
            ],
        }

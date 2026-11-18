from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator

class InterviewQuestion(BaseModel):
    question: str = Field(min_length=5)
    expected_answer_points: list[str] = Field(min_length=1)


class QuestionGenerationResponse(BaseModel):
    role: str
    questions: list[InterviewQuestion]


class GeneratedQuestionHistory(BaseModel):
    id: int
    question: str
    expected_answer_points: list[str]


class QuestionGenerationRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    role: str | None = Field(default=None, min_length=2, max_length=100)
    experience_years: float | None = Field(default=None, ge=0, le=50)
    skills: list[str] | None = Field(
        default=None,
        min_length=1,
        max_length=20,
    )
    difficulty: Literal["easy", "medium", "hard"] | None = None
    interview_id: int | None = Field(default=None, ge=1)
    number_of_questions: int = Field(default=5, ge=1, le=20)

    @field_validator("skills")
    @classmethod
    def validate_skills(
        cls,
        skills: list[str] | None,
    ) -> list[str] | None:
        if skills is None:
            return None

        cleaned_skills = [skill.strip() for skill in skills]

        if any(not skill for skill in cleaned_skills):
            raise ValueError("Skills cannot be empty or contain only whitespace")

        return cleaned_skills

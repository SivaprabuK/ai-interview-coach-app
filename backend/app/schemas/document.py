from pydantic import BaseModel, Field


class DocumentQuestionRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=10)

class DocumentInterviewRequest(BaseModel):
    document_id: int = Field(..., gt=0)
    difficulty: str = Field(default="Intermediate")
    question_count: int = Field(default=5, ge=1, le=20)

class GeneratedInterviewQuestion(BaseModel):
    question: str
    expected_answer_points: list[str]

class DocumentInterviewResponse(BaseModel):
    document_id: int
    difficulty: str
    questions: list[GeneratedInterviewQuestion]
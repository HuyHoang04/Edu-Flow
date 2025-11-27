from pydantic import BaseModel
from typing import Optional, List


class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 500
    temperature: Optional[float] = 0.7


class GenerateResponse(BaseModel):
    text: str
    tokens_used: int


class GradeRequest(BaseModel):
    submission: str
    rubric: str
    max_score: int


class GradeResponse(BaseModel):
    score: int
    feedback: str
    strengths: List[str]
    improvements: List[str]

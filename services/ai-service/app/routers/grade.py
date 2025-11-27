from fastapi import APIRouter, HTTPException
from app.models import GradeRequest, GradeResponse
from app.utils.ai_client import ai_client

router = APIRouter(prefix="/grade", tags=["grade"])


@router.post("", response_model=GradeResponse)
async def grade_submission(request: GradeRequest):
    """Grade a submission using AI"""
    try:
        result = await ai_client.grade(
            submission=request.submission,
            rubric=request.rubric,
            max_score=request.max_score
        )
        return GradeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

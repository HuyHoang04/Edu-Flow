from fastapi import APIRouter, HTTPException
from app.models import GenerateRequest, GenerateResponse
from app.utils.ai_client import ai_client

router = APIRouter(prefix="/generate", tags=["generate"])


@router.post("", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    """Generate text using AI"""
    try:
        result = await ai_client.generate(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        return GenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

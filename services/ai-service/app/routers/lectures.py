from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.utils.ai_client import ai_client

router = APIRouter(prefix="/lectures", tags=["lectures"])



class GenerateLectureRequest(BaseModel):
    topic: str
    audience: Optional[str] = "Students"
    duration_minutes: Optional[int] = 45
    detail_level: Optional[str] = "Detailed"

class SlideContent(BaseModel):
    title: str
    bullets: List[str]
    speaker_notes: str

class GenerateLectureResponse(BaseModel):
    title: str
    outline: List[str]
    slides: List[SlideContent]

@router.post("/generate", response_model=GenerateLectureResponse)
async def generate_lecture(request: GenerateLectureRequest):
    """Generate a lecture outline and slides based on a topic"""
    try:
        prompt = f"""Create a detailed lecture about "{request.topic}".
        Target Audience: {request.audience}
        Duration: {request.duration_minutes} minutes
        Detail Level: {request.detail_level}

        Respond in JSON format with the following structure:
        {{
            "title": "Lecture Title",
            "outline": ["Topic 1", "Topic 2", ...],
            "slides": [
                {{
                    "title": "Slide 1 Title",
                    "bullets": ["Point 1", "Point 2", ...],
                    "speaker_notes": "Notes for the speaker..."
                }},
                ...
            ]
        }}
        Ensure the content is educational, structured, and suitable for the specified duration.
        """

        result = await ai_client.generate_json(prompt)
        return GenerateLectureResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

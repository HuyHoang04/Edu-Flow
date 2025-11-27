from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any, Dict, Optional
from app.utils.ai_client import ai_client

router = APIRouter(prefix="/workflows", tags=["workflows"])

class GenerateWorkflowRequest(BaseModel):
    prompt: str

class WorkflowNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = "default"

class GenerateWorkflowResponse(BaseModel):
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]
    description: str

@router.post("/generate", response_model=GenerateWorkflowResponse)
async def generate_workflow(request: GenerateWorkflowRequest):
    """Generate a workflow structure from a natural language prompt"""
    try:
        prompt = f"""Create a workflow based on this request: "{request.prompt}"

        Available Node Types:
        - manual-trigger: Starts the workflow manually.
        - send-email: Sends an email. Inputs: to, subject, body.
        - condition: Checks a condition. Inputs: field, operator (==, !=, >, <, contains), value.
        - delay: Waits for a duration. Inputs: duration (ms).
        - loop: Loops over a list. Inputs: items.
        - create-exam: Creates an exam. Inputs: title, duration.
        - assign-grade: Assigns a grade. Inputs: studentId, score.
        - ai-grade: AI grading. Inputs: submissionKey, rubric.

        Respond in JSON format with:
        {{
            "description": "Brief explanation of the workflow",
            "nodes": [
                {{ "id": "1", "type": "manual-trigger", "position": {{ "x": 100, "y": 50 }}, "data": {{ "label": "Start" }} }},
                ...
            ],
            "edges": [
                {{ "id": "e1-2", "source": "1", "target": "2" }},
                ...
            ]
        }}
        Ensure the workflow is logical and connected. Use reasonable positions for nodes (layout from top to bottom or left to right).
        """

        result = await ai_client.generate_json(prompt)
        return GenerateWorkflowResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

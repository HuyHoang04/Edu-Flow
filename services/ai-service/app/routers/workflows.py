from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any, Dict, Optional
from app.utils.ai_client import ai_client

router = APIRouter(prefix="/workflows", tags=["workflows"])

class GenerateWorkflowRequest(BaseModel):
    prompt: str
    available_nodes: Optional[List[Dict[str, Any]]] = None

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
        nodes_description = ""
        if request.available_nodes:
            nodes_description = "Available Node Types:\n"
            for node in request.available_nodes:
                fields = ", ".join([f"{f['name']} ({f['type']})" for f in node.get('fields', [])])
                nodes_description += f"- {node['type']} ({node.get('category', 'General')}): {node.get('description', '')}. Fields: {fields}\n"
        else:
            # Fallback if no nodes provided
            nodes_description = """Available Node Types:
            - manual-trigger: Starts the workflow manually.
            - send-email: Sends an email. Inputs: to, subject, body.
            - condition: Checks a condition. Inputs: field, operator, value.
            - delay: Waits for a duration. Inputs: duration.
            """

        prompt = f"""Create a workflow based on this request: "{request.prompt}"

        {nodes_description}

        Respond in JSON format with:
        {{
            "description": "Brief explanation of the workflow",
            "nodes": [
                {{ 
                    "id": "1", 
                    "type": "custom", 
                    "position": {{ "x": 100, "y": 50 }}, 
                    "data": {{ 
                        "label": "Start", 
                        "nodeType": "manual-trigger",
                        "category": "Trigger"
                    }} 
                }},
                {{ 
                    "id": "2", 
                    "type": "custom", 
                    "position": {{ "x": 100, "y": 200 }}, 
                    "data": {{ 
                        "label": "Send Email", 
                        "nodeType": "send-email",
                        "category": "Action",
                        "to": "student@example.com",
                        "subject": "Exam Notification",
                        "body": "Your exam is ready."
                    }} 
                }}
            ],
            "edges": [
                {{ "id": "e1-2", "source": "1", "target": "2" }}
            ]
        }}
        Ensure the workflow is logical and connected. 
        ALWAYS set "type" to "custom". 
        Put the specific logic type (e.g., manual-trigger, send-email) in "data.nodeType".
        Set "data.category" to one of: Trigger, Action, Logic, AI.
        Use reasonable positions for nodes (layout from top to bottom).
        """

        result = await ai_client.generate_json(prompt)
        return GenerateWorkflowResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

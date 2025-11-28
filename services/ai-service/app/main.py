from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import generate, grade, lectures, workflows


app = FastAPI(
    title="AI Service",
    description="AI service for text generation and grading",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generate.router)
app.include_router(grade.router)
app.include_router(lectures.router)
app.include_router(workflows.router)

print("Loaded routers:")
for route in app.routes:
    print(f"Path: {route.path}, Name: {route.name}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "ai-service"}


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}

@app.get("/ping")
async def ping():
    return {"message": "pong"}

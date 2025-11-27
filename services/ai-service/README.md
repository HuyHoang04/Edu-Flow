# AI Service

AI microservice supporting text generation and grading via OpenAI, Gemini, or Phi-3.

## Setup

1. **Install Python 3.9+**

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure provider:**
   - Copy `.env.example` to `.env`
   - Set `AI_PROVIDER` to `openai`, `gemini`, or `phi3`
   - Add corresponding API key if using cloud providers
   
5. **For Phi-3 (Local):**
   - Install Ollama: https://ollama.ai
   - Pull Phi-3 model: `ollama pull phi3`

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### POST /generate
Generate text from a prompt.

**Request:**
```json
{
  "prompt": "Write a poem about coding",
  "max_tokens": 500,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "text": "Generated text...",
  "tokens_used": 123
}
```

### POST /grade
Grade a submission against a rubric.

**Request:**
```json
{
  "submission": "Essay text...",
  "rubric": "Grading criteria...",
  "max_score": 100
}
```

**Response:**
```json
{
  "score": 85,
  "feedback": "Good work...",
  "strengths": ["Clear structure", "Good examples"],
  "improvements": ["Add more detail", "Fix grammar"]
}
```

## Test

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, AI!"}'
```

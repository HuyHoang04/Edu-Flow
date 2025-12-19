# AI Client Factory
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

AI_PROVIDER = os.getenv("AI_PROVIDER", "phi3")


class AIClient:
    """AI Client abstraction supporting multiple providers"""
    
    def __init__(self):
        self.provider = AI_PROVIDER
        
        if self.provider == "openai":
            self.client = OpenAIClient()
        elif self.provider == "gemini":
            self.client = GeminiClient()
        elif self.provider == "phi3":
            self.client = Phi3Client()
        else:
            raise ValueError(f"Unknown AI provider: {self.provider}")
    
    async def generate(self, prompt: str, max_tokens: int = 500, temperature: float = 0.7) -> Dict[str, Any]:
        """Generate text from prompt"""
        return await self.client.generate(prompt, max_tokens, temperature)
    
    async def grade(self, submission: str, rubric: str, max_score: int) -> Dict[str, Any]:
        """Grade a submission against a rubric"""
        return await self.client.grade(submission, rubric, max_score)

    async def generate_json(self, prompt: str) -> Dict[str, Any]:
        """Generate JSON response from prompt"""
        return await self.client.generate_json(prompt)


class OpenAIClient:
    """OpenAI GPT client"""
    
    def __init__(self):
        try:
            from openai import AsyncOpenAI
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment")
            self.client = AsyncOpenAI(api_key=api_key)
        except ImportError:
            raise ImportError("openai package not installed. Run: pip install openai")
    
    async def generate(self, prompt: str, max_tokens: int, temperature: float) -> Dict[str, Any]:
        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature
        )
        return {
            "text": response.choices[0].message.content,
            "tokens_used": response.usage.total_tokens
        }
    
    async def grade(self, submission: str, rubric: str, max_score: int) -> Dict[str, Any]:
        prompt = f"""Grade the following submission against this rubric. Provide a score (0-{max_score}), feedback, strengths, and improvements.

RUBRIC:
{rubric}

SUBMISSION:
{submission}

Respond in JSON format:
{{
  "score": <number>,
  "feedback": "<text>",
  "strengths": ["<item>"],
  "improvements": ["<item>"]
}}"""
        return await self.generate_json(prompt)

    async def generate_json(self, prompt: str) -> Dict[str, Any]:
        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        import json
        return json.loads(response.choices[0].message.content)


class GeminiClient:
    """Google Gemini client"""
    
    def __init__(self):
        try:
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY not found in environment")
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')
        except ImportError:
            raise ImportError("google-generativeai package not installed. Run: pip install google-generativeai")
    
    async def generate(self, prompt: str, max_tokens: int, temperature: float) -> Dict[str, Any]:
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "max_output_tokens": max_tokens,
                    "temperature": temperature
                }
            )
            
            # Check if response has text
            if response.text:
                return {
                    "text": response.text,
                    "tokens_used": len(response.text.split())
                }
            else:
                # Response was blocked or empty
                return {
                    "text": "[No response generated - possibly blocked by safety filters]",
                    "tokens_used": 0
                }
        except Exception as e:
            return {
                "text": f"[Error: {str(e)}]",
                "tokens_used": 0
            }
    
    async def grade(self, submission: str, rubric: str, max_score: int) -> Dict[str, Any]:
        prompt = f"""Grade the following submission against this rubric. Provide a score (0-{max_score}), feedback, strengths, and improvements.

RUBRIC:
{rubric}

SUBMISSION:
{submission}

Respond in JSON format:
{{
  "score": <number>,
  "feedback": "<text>",
  "strengths": ["<item>"],
  "improvements": ["<item>"]
}}"""
        return await self.generate_json(prompt)

    async def generate_json(self, prompt: str) -> Dict[str, Any]:
        import asyncio
        import json
        
        max_retries = 3
        base_delay = 2
        
        for attempt in range(max_retries + 1):
            try:
                response = await self.model.generate_content_async(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                # Check if response was blocked
                if not response.parts:
                    if response.prompt_feedback:
                        raise ValueError(f"Response blocked. Feedback: {response.prompt_feedback}")
                    raise ValueError("Response was empty (possibly blocked)")
                    
                return json.loads(response.text)
            
            except Exception as e:
                is_rate_limit = "429" in str(e) or "quota" in str(e).lower()
                
                if is_rate_limit and attempt < max_retries:
                    delay = base_delay * (2 ** attempt)
                    print(f"Gemini 429 Rate Limit. Retrying in {delay}s... (Attempt {attempt+1}/{max_retries})")
                    await asyncio.sleep(delay)
                    continue
                
                print(f"Gemini generate_json error: {e}")
                # Identify if it is a safety block or other error
                if "safety" in str(e).lower() or "block" in str(e).lower():
                     raise ValueError(f"Content generation blocked by safety filters: {e}")
                raise e


class Phi3Client:
    """Phi-3 local model via Ollama"""
    
    def __init__(self):
        try:
            import ollama
            self.client = ollama
            self.model = "phi3"
            # Test connection
            try:
                self.client.list()
            except Exception:
                raise ValueError("Ollama not running. Install from https://ollama.ai and run 'ollama serve'")
        except ImportError:
            raise ImportError("ollama package not installed. Run: pip install ollama")
    
    async def generate(self, prompt: str, max_tokens: int, temperature: float) -> Dict[str, Any]:
        response = self.client.generate(
            model=self.model,
            prompt=prompt,
            options={
                "num_predict": max_tokens,
                "temperature": temperature
            }
        )
        return {
            "text": response['response'],
            "tokens_used": 0  # Ollama doesn't provide token count
        }
    
    async def grade(self, submission: str, rubric: str, max_score: int) -> Dict[str, Any]:
        prompt = f"""Grade the following submission against this rubric. Provide a score (0-{max_score}), feedback, strengths, and improvements.

RUBRIC:
{rubric}

SUBMISSION:
{submission}

Respond in JSON format ONLY:
{{
  "score": <number>,
  "feedback": "<text>",
  "strengths": ["<item>"],
  "improvements": ["<item>"]
}}"""
        return await self.generate_json(prompt)

    async def generate_json(self, prompt: str) -> Dict[str, Any]:
        response = self.client.generate(
            model=self.model,
            prompt=prompt,
            format="json"
        )
        import json
        return json.loads(response['response'])


# Global client instance
ai_client = AIClient()

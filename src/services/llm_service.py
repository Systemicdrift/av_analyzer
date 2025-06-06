# services/llm_service.py
import asyncio
import httpx
import json
from typing import Optional, Dict, Any
import logging
import os

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self,
                 model_url: str = None,
                 model_name: str = "llama3:8b",
                 api_key: str = None):
        """
        Initialize LLM service
        Supports both local Ollama and remote API endpoints
        """
        self.model_url = model_url or os.getenv("LLM_API_URL", "http://localhost:11434")
        self.model_name = model_name
        self.api_key = api_key or os.getenv("LLM_API_KEY")
        self.timeout = 300  # 5 minutes timeout

    async def analyze_text(self, text: str, prompt: str) -> str:
        """Analyze text using the configured LLM"""
        try:
            logger.info("Starting text analysis with LLM")

            # Construct the full prompt
            full_prompt = f"""
            Analysis Task: {prompt}

            Content to analyze:
            {text}

            Please provide a detailed analysis based on the given task.
            """

            # Try Ollama format first (local LLM)
            if "ollama" in self.model_url.lower() or "11434" in self.model_url:
                result = await self._analyze_with_ollama(full_prompt)
            else:
                # Generic API format
                result = await self._analyze_with_api(full_prompt)

            logger.info("Text analysis completed successfully")
            return result

        except Exception as e:
            logger.error(f"Text analysis failed: {e}")
            raise

    async def _analyze_with_ollama(self, prompt: str) -> str:
        """Analyze using Ollama API format"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False
            }

            response = await client.post(
                f"{self.model_url}/api/generate",
                json=payload
            )
            response.raise_for_status()

            result = response.json()
            return result.get("response", "No analysis generated")

    async def _analyze_with_api(self, prompt: str) -> str:
        """Analyze using generic API format"""
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            payload = {
                "model": self.model_name,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }

            response = await client.post(
                f"{self.model_url}/v1/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()

            result = response.json()
            return result["choices"][0]["message"]["content"]
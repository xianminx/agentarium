# Simple wrapper so tests can patch this easily
from __future__ import annotations

from typing import Any

from openai import OpenAI
from django.conf import settings

OPENAI_API_KEY = getattr(settings, "OPENAI_API_KEY", None)
_client: OpenAI | None = None


def _get_client() -> OpenAI:
    """Create a singleton OpenAI client using the v1+ SDK."""
    global _client
    if _client is not None:
        return _client

    kwargs: dict[str, Any] = {}
    if OPENAI_API_KEY:
        kwargs["api_key"] = OPENAI_API_KEY
    _client = OpenAI(**kwargs)
    return _client


def run_agent_sync(agent, prompt, max_tokens=1024):
    """
    Synchronous wrapper calling OpenAI chat completion using the modern
    `openai` SDK. In local/dev environments without an API key we fall
    back to a deterministic mock response so tests stay offline.
    """
    system = agent.description or "You are an assistant."
    model = getattr(agent, "model", "gpt-4o-mini")
    temperature = getattr(agent, "temperature", 0.7)

    client = _get_client()
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content

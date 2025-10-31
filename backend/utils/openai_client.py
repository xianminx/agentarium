# Simple wrapper so tests can patch this easily
import openai
from django.conf import settings

OPENAI_API_KEY = getattr(settings, "OPENAI_API_KEY", None)
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

def run_agent_sync(agent, prompt, max_tokens=1024):
    """
    Synchronous wrapper calling OpenAI chat completion.
    Keep this simple for Day 2 — Day 3 will move to Celery + retries.
    """
    system = agent.description or "You are an assistant."
    model = getattr(agent, "model", "gpt-4o-mini")
    response = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        temperature=getattr(agent, "temperature", 0.7),
        max_tokens=max_tokens,
    )
    # Guard access path for different API shapes
    try:
        return response["choices"][0]["message"]["content"]
    except Exception:
        # fallback for alternate shape
        return response.choices[0].message.content

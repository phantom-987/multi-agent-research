import time
import json
from openai import AsyncOpenAI
from config import OPENAI_API_KEY, MODEL, MAX_TOKENS

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

FACT_CHECKER_PROMPT = """You are a fact-checking agent.
Given a research summary and a list of claims to verify, 
evaluate each claim and rate it as:
- VERIFIED: supported by the research
- UNVERIFIED: not enough evidence
- FALSE: contradicted by the research

Respond in this exact JSON format:
{
  "fact_checks": [
    {"claim": "...", "verdict": "VERIFIED", "reason": "..."},
    {"claim": "...", "verdict": "UNVERIFIED", "reason": "..."}
  ],
  "overall_score": 0.85
}
Only respond with JSON. No extra text."""


async def run_fact_checker(research_output: str, facts_to_verify: list[str]) -> dict:
    start = time.time()

    facts_text = "\n".join([f"- {f}" for f in facts_to_verify])

    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[
            {"role": "system", "content": FACT_CHECKER_PROMPT},
            {"role": "user", "content": f"Research Summary:\n{research_output}\n\nClaims to verify:\n{facts_text}"}
        ],
        response_format={"type": "json_object"}
    )

    latency = (time.time() - start) * 1000
    tokens = response.usage.total_tokens
    result = json.loads(response.choices[0].message.content)
    result["latency_ms"] = latency
    result["tokens_used"] = tokens

    return result
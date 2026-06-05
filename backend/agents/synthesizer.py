import time
from openai import AsyncOpenAI
from config import OPENAI_API_KEY, MODEL, MAX_TOKENS

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

SYNTHESIZER_PROMPT = """You are a research synthesis agent.
You receive findings from a researcher and fact-checker.
Your job is to combine them into a clean, structured JSON report.

Respond in this exact JSON format:
{
  "summary": "2-3 sentence executive summary",
  "sections": [
    {"title": "Introduction", "content": "..."},
    {"title": "Key Findings", "content": "..."},
    {"title": "Analysis", "content": "..."},
    {"title": "Conclusion", "content": "..."}
  ]
}
Only respond with JSON. No extra text."""


async def run_synthesizer(query: str, research_output: str, fact_check_result: dict, report_sections: list[str]) -> dict:
    start = time.time()

    context = f"""Original Query: {query}

Research Findings:
{research_output}

Fact Check Results:
{fact_check_result}

Required Sections: {", ".join(report_sections)}"""

    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[
            {"role": "system", "content": SYNTHESIZER_PROMPT},
            {"role": "user", "content": context}
        ],
        response_format={"type": "json_object"}
    )

    latency = (time.time() - start) * 1000
    tokens = response.usage.total_tokens

    import json
    result = json.loads(response.choices[0].message.content)
    result["latency_ms"] = latency
    result["tokens_used"] = tokens

    return result
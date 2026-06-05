import time
from openai import AsyncOpenAI
from config import OPENAI_API_KEY, MODEL, MAX_TOKENS

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

PLANNER_PROMPT = """You are a research planning agent. 
Given a research query, break it down into 4 specific sub-tasks:
1. What to search on the web
2. What academic papers to look for
3. What facts need to be verified
4. What the final report structure should look like

Respond in this exact JSON format:
{
  "web_search_query": "...",
  "arxiv_query": "...",
  "facts_to_verify": ["fact1", "fact2", "fact3"],
  "report_sections": ["Introduction", "section2", "section3", "Conclusion"]
}
Only respond with the JSON. No extra text."""


async def run_planner(query: str) -> dict:
    start = time.time()

    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[
            {"role": "system", "content": PLANNER_PROMPT},
            {"role": "user", "content": f"Research query: {query}"}
        ],
        response_format={"type": "json_object"}
    )

    latency = (time.time() - start) * 1000
    tokens = response.usage.total_tokens
    output = response.choices[0].message.content

    import json
    plan = json.loads(output)
    plan["latency_ms"] = latency
    plan["tokens_used"] = tokens

    return plan
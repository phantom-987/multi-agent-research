import time
from openai import AsyncOpenAI
from config import OPENAI_API_KEY, MODEL, MAX_TOKENS

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

WRITER_PROMPT = """You are a professional research writer.
You receive a structured research report and rewrite it into 
polished, well-formatted Markdown.
Use headings, bullet points, and bold text where appropriate.
Keep the tone professional and academic.
Always include a Sources section at the end."""


async def run_writer(synthesized_report: dict, sources: list[str]) -> dict:
    start = time.time()

    sources_text = "\n".join([f"- {s}" for s in sources])

    context = f"""Synthesized Report:
{synthesized_report}

Sources:
{sources_text}"""

    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[
            {"role": "system", "content": WRITER_PROMPT},
            {"role": "user", "content": context}
        ]
    )

    latency = (time.time() - start) * 1000
    tokens = response.usage.total_tokens

    return {
        "output": response.choices[0].message.content,
        "latency_ms": latency,
        "tokens_used": tokens
    }
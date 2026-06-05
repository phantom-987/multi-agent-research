import time
from openai import AsyncOpenAI
from config import OPENAI_API_KEY, MODEL, MAX_TOKENS
from tools.web_search import web_search
from tools.arxiv import search_arxiv

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

RESEARCHER_PROMPT = """You are a research agent. 
You are given a query and raw search results from the web and academic papers.
Your job is to extract the most relevant and important information.
Write a detailed research summary with key findings.
Always mention your sources."""


async def run_researcher(query: str, web_query: str, arxiv_query: str) -> dict:
    start = time.time()

    # Run both searches
    web_results = await web_search(web_query, max_results=5)
    arxiv_results = await search_arxiv(arxiv_query, max_results=3)

    # Format results for the LLM
    web_text = "\n\n".join([
        f"Source: {r['url']}\nTitle: {r['title']}\nContent: {r['content']}"
        for r in web_results
    ])

    arxiv_text = "\n\n".join([
        f"Paper: {r['title']}\nAuthors: {r['authors']}\nSummary: {r['summary']}\nURL: {r['url']}"
        for r in arxiv_results
    ])

    combined = f"WEB RESULTS:\n{web_text}\n\nACADEMIC PAPERS:\n{arxiv_text}"

    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[
            {"role": "system", "content": RESEARCHER_PROMPT},
            {"role": "user", "content": f"Query: {query}\n\nSearch Results:\n{combined}"}
        ]
    )

    latency = (time.time() - start) * 1000
    tokens = response.usage.total_tokens

    sources = [r["url"] for r in web_results] + [r["url"] for r in arxiv_results]

    return {
        "output": response.choices[0].message.content,
        "sources": sources,
        "latency_ms": latency,
        "tokens_used": tokens
    }
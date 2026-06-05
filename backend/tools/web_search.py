import httpx
from config import TAVILY_API_KEY


async def web_search(query: str, max_results: int = 5) -> list[dict]:
    """Search the web using Tavily API. Returns list of {title, url, content}."""

    if not TAVILY_API_KEY:
        raise ValueError("TAVILY_API_KEY is not set in .env")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": TAVILY_API_KEY,
                "query": query,
                "max_results": max_results,
                "search_depth": "advanced",
                "include_raw_content": False,
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()

    results = []
    for r in data.get("results", []):
        results.append({
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "content": r.get("content", ""),
        })

    return results
import httpx
import xml.etree.ElementTree as ET


async def search_arxiv(query: str, max_results: int = 3) -> list[dict]:
    """
    Search ArXiv for academic papers.

    Returns:
    [
        {
            "title": "...",
            "authors": "...",
            "summary": "...",
            "url": "..."
        }
    ]
    """

    url = "https://export.arxiv.org/api/query"

    params = {
        "search_query": f"all:{query}",
        "start": 0,
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending",
    }

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            headers={
                "User-Agent": "MultiAgentResearch/1.0"
            }
        ) as client:

            response = await client.get(
                url,
                params=params,
                timeout=15.0,
            )

            # Don't crash if ArXiv rate-limits us
            if response.status_code != 200:
                print(
                    f"ArXiv returned {response.status_code}: "
                    f"{response.text[:200]}"
                )
                return []

        root = ET.fromstring(response.text)

        ns = {
            "atom": "http://www.w3.org/2005/Atom"
        }

        results = []

        for entry in root.findall("atom:entry", ns):
            title = entry.find("atom:title", ns)
            summary = entry.find("atom:summary", ns)
            link = entry.find("atom:id", ns)
            authors = entry.findall("atom:author", ns)

            author_names = []

            for author in authors:
                name = author.find("atom:name", ns)

                if name is not None:
                    author_names.append(name.text)

            results.append(
                {
                    "title": title.text.strip() if title is not None else "",
                    "authors": ", ".join(author_names[:3]),
                    "summary": (
                        summary.text.strip()[:500]
                        if summary is not None
                        else ""
                    ),
                    "url": link.text.strip() if link is not None else "",
                }
            )

        return results

    except Exception as e:
        print(f"ArXiv search failed: {e}")
        return []
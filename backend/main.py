import json
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models import ResearchQuery
from orchestrator import run_pipeline
from config import CORS_ORIGINS

app = FastAPI(title="Multi-Agent Research Analyst")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "running", "message": "Multi-Agent Research API"}


@app.post("/research")
async def research(body: ResearchQuery):
    events = []

    async def emit(event: str, agent: str, data: str):
        events.append({"event": event, "agent": agent, "data": data})

    async def stream():
        queue = asyncio.Queue()

        async def emit_to_queue(event: str, agent: str, data: str):
            await queue.put({"event": event, "agent": agent, "data": data})

        async def run():
            try:
                report = await run_pipeline(body.query, emit_to_queue)
                await queue.put({"event": "report_ready", "agent": None, "data": report.model_dump_json()})
            except Exception as e:
                await queue.put({"event": "error", "agent": None, "data": str(e)})
            finally:
                await queue.put(None)  # sentinel

        asyncio.create_task(run())

        while True:
            item = await queue.get()
            if item is None:
                break
            yield f"data: {json.dumps(item)}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")
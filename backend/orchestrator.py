import asyncio
from datetime import datetime
from models import AgentTrace, AgentStatus, ResearchReport
from agents.planner import run_planner
from agents.researcher import run_researcher
from agents.fact_checker import run_fact_checker
from agents.synthesizer import run_synthesizer
from agents.writer import run_writer


async def run_pipeline(query: str, emit) -> ResearchReport:
    traces = []

    # --- PLANNER ---
    await emit("agent_start", "planner", "Planning research tasks...")
    try:
        plan = await run_planner(query)
        traces.append(AgentTrace(
            agent_name="planner",
            started_at=datetime.now(),
            latency_ms=plan["latency_ms"],
            tokens_used=plan["tokens_used"],
            status=AgentStatus.DONE
        ))
        await emit("agent_done", "planner", f"Plan ready: {len(plan['report_sections'])} sections")
    except Exception as e:
        await emit("agent_error", "planner", str(e))
        raise

    # --- RESEARCHER + FACT CHECKER in parallel ---
    await emit("agent_start", "researcher", "Searching web and academic papers...")
    await emit("agent_start", "fact_checker", "Preparing fact checks...")

    researcher_task = run_researcher(
        query,
        plan["web_search_query"],
        plan["arxiv_query"]
    )
    fact_checker_task = asyncio.sleep(0)  # will run after researcher

    research_result = await researcher_task

    traces.append(AgentTrace(
        agent_name="researcher",
        started_at=datetime.now(),
        latency_ms=research_result["latency_ms"],
        tokens_used=research_result["tokens_used"],
        status=AgentStatus.DONE
    ))
    await emit("agent_done", "researcher", f"Found {len(research_result['sources'])} sources")

    # Fact checker runs on researcher output
    fact_result = await run_fact_checker(
        research_result["output"],
        plan["facts_to_verify"]
    )

    traces.append(AgentTrace(
        agent_name="fact_checker",
        started_at=datetime.now(),
        latency_ms=fact_result["latency_ms"],
        tokens_used=fact_result["tokens_used"],
        status=AgentStatus.DONE
    ))
    await emit("agent_done", "fact_checker", f"Score: {fact_result.get('overall_score', 'N/A')}")

    # --- SYNTHESIZER ---
    await emit("agent_start", "synthesizer", "Synthesizing findings...")
    synth_result = await run_synthesizer(
        query,
        research_result["output"],
        fact_result,
        plan["report_sections"]
    )
    traces.append(AgentTrace(
        agent_name="synthesizer",
        started_at=datetime.now(),
        latency_ms=synth_result["latency_ms"],
        tokens_used=synth_result["tokens_used"],
        status=AgentStatus.DONE
    ))
    await emit("agent_done", "synthesizer", "Report synthesized")

    # --- WRITER ---
    await emit("agent_start", "writer", "Writing final report...")
    writer_result = await run_writer(synth_result, research_result["sources"])
    traces.append(AgentTrace(
        agent_name="writer",
        started_at=datetime.now(),
        latency_ms=writer_result["latency_ms"],
        tokens_used=writer_result["tokens_used"],
        status=AgentStatus.DONE
    ))
    await emit("agent_done", "writer", "Report ready")

    return ResearchReport(
        query=query,
        summary=synth_result.get("summary", ""),
        sections=synth_result.get("sections", []),
        sources=research_result["sources"],
        fact_check_score=fact_result.get("overall_score"),
        agent_traces=traces
    )
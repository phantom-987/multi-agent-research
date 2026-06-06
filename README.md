# Multi-Agent Research Analyst

> Deploy a fleet of specialized AI agents to synthesize complex data points into actionable intelligence.

**Live Demo:** [multi-agent-research-fawn.vercel.app](https://multi-agent-research-fawn.vercel.app)  
**Backend API:** [multi-agent-research-production-6013.up.railway.app](https://multi-agent-research-production-6013.up.railway.app)




<img width="1912" height="870" alt="image" src="https://github.com/user-attachments/assets/e48b6af1-27bd-4327-8c18-c94b2c325c78" />


---

## What It Does

Multi-Agent Research Analyst is a AI application that accepts a natural language research question and autonomously dispatches a pipeline of five specialized LLM agents to plan, research, verify, synthesize, and write a structured report — all streamed in real time to the user.

---

## Architecture Overview

User Query
    │
    ▼
┌─────────────────────────────────────────────────────┐
│                  Orchestrator                        │
│         (coordinates agent pipeline)                 │
└──────┬──────────┬──────────┬──────────┬─────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
  Planner   Researcher  Fact Checker  Synthesizer  Writer
  Agent      Agent       Agent         Agent        Agent
       │          │          │          │
       └──────────┴──────────┴──────────┘
                       │
                  RAG Memory
               (Qdrant Vector DB)
                       │
                  Final Report
              (streamed via SSE)

---

## Agent Pipeline

Each agent is a focused LLM call with a specific role, system prompt, and tool access. They execute sequentially, with each agent's output feeding the next.

| # | Agent | Role | Tools |
|---|-------|------|-------|
| 01 | **Planner** | Breaks the query into structured sub-questions and a research strategy | GPT-4o |
| 02 | **Researcher** | Executes web searches and retrieves relevant sources for each sub-question | GPT-4o + Tavily Search API |
| 03 | **Fact Checker** | Cross-validates claims across sources, assigns a confidence score | GPT-4o |
| 04 | **Synthesizer** | Merges findings into coherent themes, deduplicates, resolves conflicts | GPT-4o + Qdrant RAG |
| 05 | **Writer** | Produces the final structured report with sections, summary, and citations | GPT-4o |

---

## LLM Integration

The application uses **OpenAI GPT-4o** as the core reasoning engine across all agents.

Each agent receives:
- A **tailored system prompt** defining its persona, constraints, and output format
- The **accumulated context** from upstream agents
- Access to **specific tools** relevant to its task (search, vector retrieval)

Responses are streamed back to the frontend via **Server-Sent Events (SSE)** so the user sees each agent activate in real time rather than waiting for the full pipeline to complete.


---

## RAG (Retrieval-Augmented Generation)

The Synthesizer agent uses **RAG** to enrich its output with knowledge from previous research sessions stored in **Qdrant**, a high-performance vector database.

### How It Works


New Research Session
        │
        ▼
  Researcher Output
  (raw text chunks)
        │
        ▼
  Text Embeddings          Past Sessions
  (OpenAI Ada-002)  ──▶   Qdrant Vector DB
                                │
                                ▼
                     Similarity Search
                     (top-k relevant chunks)
                                │
                                ▼
                    Synthesizer receives:
                    current findings + retrieved memory
                                │
                                ▼
                    Richer, context-aware synthesis

### Why RAG?

Without RAG, the Synthesizer only sees what was found in the current session. With RAG:
- **Persistent knowledge** — findings from past queries enrich future ones
- **Conflict resolution** — the agent can compare current claims against historical data
- **Reduced hallucination** — grounding outputs in retrieved evidence improves factual accuracy


---

## Tech Stack

### Backend
- **FastAPI** — async Python web framework, SSE streaming
- **OpenAI GPT-4o** — core LLM for all five agents
- **Tavily Search API** — real-time web search for the Researcher agent
- **Qdrant** — vector database for RAG memory
- **PostgreSQL** — persistent storage for report history
- **Pydantic** — data validation and schema definitions

### Frontend
- **Next.js 15** — React framework with app router
- **TypeScript** — type-safe frontend code
- **Tailwind CSS** — utility-first styling
- **Canvas API** — animated starfield background
- **SSE (EventSource)** — real-time agent status streaming

### Infrastructure
- **Railway** — backend deployment (Python, auto-scaling)
- **Vercel** — frontend deployment (edge network, CI/CD)

---


## Project Structure

multi-agent-research/
├── backend/
│   ├── main.py              # FastAPI app, SSE /research endpoint
│   ├── orchestrator.py      # Agent pipeline coordinator
│   ├── models.py            # Pydantic schemas (ResearchQuery, Report, etc.)
│   ├── config.py            # Env vars, model config, CORS
│   ├── agents/
│   │   ├── planner.py       # Query decomposition agent
│   │   ├── researcher.py    # Web search agent (Tavily)
│   │   ├── fact_checker.py  # Verification + confidence scoring
│   │   ├── synthesizer.py   # RAG-powered synthesis agent
│   │   └── writer.py        # Report generation agent
│   ├── rag/                 # Qdrant vector memory utilities
│   ├── tools/               # Shared tool definitions (search, embed)
│   └── database/            # PostgreSQL session/report persistence
└── frontend/
    └── app/
        ├── page.tsx                        # Main page, SSE handler
        ├── components/
        │   ├── QueryInput.tsx              # Search bar with example chips
        │   ├── AgentStatus.tsx             # Real-time agent pipeline view
        │   ├── ReportViewer.tsx            # Tabbed report + sources viewer
        │   └── StarfieldBackground.tsx     # Canvas animated background
        └── globals.css                     # Dark theme, glassmorphism styles


Backend (Railway)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o |
| `TAVILY_API_KEY` | Tavily Search API key |
| `QDRANT_URL` | Qdrant instance URL |
| `POSTGRES_URL` | PostgreSQL connection string |
| `PYTHONPATH` | Set to `/app/backend` for correct imports |

 Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Railway backend URL |

---

## Key Design Decisions

**Why multi-agent instead of a single prompt?**  
Decomposing the task into specialized agents produces significantly higher quality output. Each agent is optimized for one job — the Fact Checker, for instance, uses a different system prompt and temperature than the Writer, making each stage more precise.

**Why SSE instead of WebSockets?**  
SSE is simpler and sufficient for this one-directional use case (server → client). It works out of the box with `fetch` and doesn't require a persistent bidirectional connection.

**Why Qdrant for RAG?**  
Qdrant is purpose-built for vector similarity search with a clean Python client, supports filtering alongside vector search, and has a generous free cloud tier — ideal for a portfolio project.

---

## Author

**Shantanu Biswas**  
B.Tech Computer Science

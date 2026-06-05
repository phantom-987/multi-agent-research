from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


class ResearchQuery(BaseModel):
    query: str
    depth: Optional[str] = "standard"
    max_sources: Optional[int] = 5


class AgentResult(BaseModel):
    agent_name: str
    status: AgentStatus
    output: Optional[str] = None
    sources: Optional[List[str]] = []
    error: Optional[str] = None
    latency_ms: Optional[float] = None
    tokens_used: Optional[int] = None


class AgentTrace(BaseModel):
    agent_name: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    latency_ms: Optional[float] = None
    tokens_used: Optional[int] = None
    status: AgentStatus
    error: Optional[str] = None


class ResearchReport(BaseModel):
    query: str
    summary: str
    sections: List[dict]
    sources: List[str]
    fact_check_score: Optional[float] = None
    created_at: datetime = datetime.now()
    agent_traces: Optional[List[AgentTrace]] = []


class StreamEvent(BaseModel):
    event: str
    agent: Optional[str] = None
    data: Optional[str] = None
    timestamp: datetime = datetime.now()
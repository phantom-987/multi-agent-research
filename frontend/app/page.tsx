"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import QueryInput from "./components/QueryInput";
import AgentStatus from "./components/AgentStatus";
import ReportViewer from "./components/ReportViewer";

// Load starfield only on client (uses canvas/window)
const StarfieldBackground = dynamic(
  () => import("./components/StarfieldBackground"),
  { ssr: false }
);

interface AgentEvent {
  name: string;
  status: "pending" | "running" | "done" | "error";
  message: string;
}

interface Report {
  query: string;
  summary: string;
  sections: { title: string; content: string }[];
  sources: string[];
  fact_check_score: number | null;
}

export default function Home() {
  const [agents, setAgents] = useState<AgentEvent[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const AGENT_ORDER = ["planner", "researcher", "fact_checker", "synthesizer", "writer"];

  const updateAgent = (name: string, status: AgentEvent["status"], message: string) => {
    setAgents((prev) => {
      const existing = prev.find((a) => a.name === name);
      if (existing) {
        return prev.map((a) => (a.name === name ? { ...a, status, message } : a));
      }
      return [...prev, { name, status, message }];
    });
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    setReport(null);
    setError(null);
    setAgents(
      AGENT_ORDER.map((name) => ({ name, status: "pending" as const, message: "Waiting..." }))
    );

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream available");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.replace("data: ", ""));
            if (json.event === "agent_start") updateAgent(json.agent, "running", json.data);
            else if (json.event === "agent_done") updateAgent(json.agent, "done", json.data);
            else if (json.event === "agent_error") updateAgent(json.agent, "error", json.data);
            else if (json.event === "report_ready") setReport(JSON.parse(json.data));
            else if (json.event === "error") setError(json.data);
          } catch {
            // ignore malformed
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Animated background */}
      <StarfieldBackground />

      <main
        className="page-content"
        style={{ minHeight: "100vh", color: "white", overflowX: "hidden" }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 60px" }}>

          {/* ── Navbar ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 10,
              marginBottom: 48,
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "rgba(148,163,184,0.6)",
                fontWeight: 500,
              }}
            >
              Multi-Agent Research Analyst
            </span>
            <div className="nav-dot" />
          </div>

          {/* ── Hero ── */}
          <div style={{ marginBottom: 48 }}>
            {/* Status badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 99,
                border: "1px solid rgba(59,130,246,0.35)",
                background: "rgba(59,130,246,0.1)",
                padding: "8px 16px",
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#60a5fa",
                  boxShadow: "0 0 8px rgba(96,165,250,0.9)",
                  animation: "navPulse 2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#93c5fd",
                  fontWeight: 600,
                }}
              >
                Multi-Agent Engine Active
              </span>
            </div>

            {/* Heading */}
            <h1
              style={{
                fontSize: "clamp(2.8rem, 7vw, 5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
              }}
            >
              {greeting},{" "}
              <span style={{ color: "rgba(148,163,184,0.55)", fontWeight: 300 }}>
                Researcher.
              </span>
            </h1>

            {/* Subheading */}
            <p
              style={{
                fontSize: "1.1rem",
                color: "rgba(148,163,184,0.75)",
                maxWidth: 560,
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Deploy your fleet of specialized agents to synthesize complex data
              points into actionable intelligence.
            </p>
          </div>

          {/* ── Search ── */}
          <QueryInput onSearch={handleSearch} loading={loading} />

          {/* ── Agent Status ── */}
          {agents.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <AgentStatus agents={agents} />
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div
              className="fade-in"
              style={{
                marginTop: 24,
                borderRadius: 16,
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.08)",
                padding: "14px 18px",
                color: "#fca5a5",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Report ── */}
          {report && (
            <div style={{ marginTop: 32 }}>
              <ReportViewer report={report} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
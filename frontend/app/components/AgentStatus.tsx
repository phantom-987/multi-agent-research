"use client";

interface Agent {
  name: string;
  status: "pending" | "running" | "done" | "error";
  message: string;
}

interface Props {
  agents: Agent[];
}

const AGENT_META: Record<string, { label: string; icon: string }> = {
  planner: { label: "Planning research strategy", icon: "🗺" },
  researcher: { label: "Gathering sources", icon: "🔍" },
  fact_checker: { label: "Verifying information", icon: "✅" },
  synthesizer: { label: "Synthesizing findings", icon: "⚗" },
  writer: { label: "Generating report", icon: "✍" },
};

export default function AgentStatus({ agents }: Props) {
  const completed = agents.filter((a) => a.status === "done").length;
  const progress = agents.length > 0 ? Math.round((completed / agents.length) * 100) : 0;

  return (
    <div className="agent-card fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(59,130,246,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            📡
          </div>
          <h2 className="text-white font-semibold text-lg">Research Progress</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-sm font-medium">{progress}% Complete</span>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: progress === 100 ? "#22c55e" : "#3b82f6",
              boxShadow: `0 0 8px ${progress === 100 ? "rgba(34,197,94,0.8)" : "rgba(59,130,246,0.8)"}`,
            }}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-bg mb-6">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {agents.map((agent, i) => {
          const meta = AGENT_META[agent.name] ?? { label: agent.name, icon: "🤖" };

          const statusConfig = {
            pending: { color: "rgba(100,116,139,0.6)", dot: "#475569", ring: "rgba(71,85,105,0.3)" },
            running: { color: "#60a5fa", dot: "#3b82f6", ring: "rgba(59,130,246,0.3)" },
            done: { color: "#4ade80", dot: "#22c55e", ring: "rgba(34,197,94,0.2)" },
            error: { color: "#f87171", dot: "#ef4444", ring: "rgba(239,68,68,0.2)" },
          }[agent.status];

          return (
            <div key={agent.name} className="flex items-start gap-4">
              {/* Step indicator */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: `1.5px solid ${statusConfig.ring}`,
                    background: `${statusConfig.ring}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    transition: "all 0.3s ease",
                  }}
                >
                  {agent.status === "running" ? (
                    <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={statusConfig.dot} strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : agent.status === "done" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={statusConfig.dot} strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : agent.status === "error" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={statusConfig.dot} strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 10, color: statusConfig.dot }}>0{i + 1}</span>
                  )}
                </div>
                {i < agents.length - 1 && (
                  <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.06)", marginTop: 3 }} />
                )}
              </div>

              {/* Content */}
              <div style={{ paddingBottom: i < agents.length - 1 ? 4 : 0, paddingTop: 4 }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: agent.status === "pending" ? "rgba(148,163,184,0.5)" : "white",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: statusConfig.color, marginTop: 2, marginLeft: 22 }}>
                  {agent.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
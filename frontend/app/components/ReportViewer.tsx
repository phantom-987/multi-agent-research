"use client";

import { useState } from "react";

interface Section {
  title: string;
  content: string;
}

interface Report {
  query: string;
  summary: string;
  sections: Section[];
  sources: string[];
  fact_check_score: number | null;
}

interface Props {
  report: Report;
}

const scoreColor = (score: number | null): string => {
  if (score === null) return "rgba(148,163,184,0.8)";
  if (score >= 0.8) return "#4ade80";
  if (score >= 0.5) return "#fbbf24";
  return "#f87171";
};

export default function ReportViewer({ report }: Props) {
  const [activeTab, setActiveTab] = useState<"report" | "sources">("report");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const text = [
        `Query: ${report.query}`,
        "",
        "Executive Summary",
        report.summary,
        "",
        ...report.sections.map((s) => `${s.title}\n${s.content}`),
      ].join("\n\n");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        overflow: "visible",
        marginBottom: 40,
      }}
      className="fade-in"
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          background: "rgba(255,255,255,0.02)",
          borderRadius: "20px 20px 0 0",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ color: "white", fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>
            Research Report
          </h2>
          <p style={{ color: "rgba(148,163,184,0.7)", fontSize: "0.82rem", margin: "4px 0 0", wordBreak: "break-word" }}>
            {report.query}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {report.fact_check_score !== null && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, color: scoreColor(report.fact_check_score), margin: 0 }}>
                {Math.round(report.fact_check_score * 100)}%
              </p>
              <p style={{ fontSize: "0.65rem", color: "rgba(100,116,139,0.9)", margin: 0 }}>Fact Score</p>
            </div>
          )}

          <button
            onClick={handleCopy}
            style={{
              background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 10,
              color: copied ? "#4ade80" : "rgba(148,163,184,0.9)",
              fontSize: "0.82rem",
              padding: "8px 14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
              WebkitAppearance: "none",
            }}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {(["report", "sources"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px",
              fontSize: "0.85rem",
              fontWeight: 500,
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
              color: activeTab === tab ? "#60a5fa" : "rgba(100,116,139,0.8)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textTransform: "capitalize",
              WebkitAppearance: "none",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px 20px", overflow: "visible" }}>
        {activeTab === "report" && (
          <div style={{ overflow: "visible" }}>
            {/* Executive Summary */}
            <div
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 24,
              }}
            >
              <h3 style={{
                color: "#93c5fd",
                fontWeight: 600,
                fontSize: "0.85rem",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                Executive Summary
              </h3>
              <p style={{
                color: "rgba(203,213,225,0.9)",
                fontSize: "0.88rem",
                lineHeight: 1.7,
                margin: 0,
                wordBreak: "break-word",
              }}>
                {report.summary}
              </p>
            </div>

            {report.sections.map((section, index) => (
              <div key={index} style={{ marginBottom: 24 }}>
                <h3 style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  margin: "0 0 10px",
                  paddingLeft: 14,
                  borderLeft: "3px solid #3b82f6",
                  wordBreak: "break-word",
                }}>
                  {section.title}
                </h3>
                <p style={{
                  color: "rgba(148,163,184,0.9)",
                  fontSize: "0.88rem",
                  lineHeight: 1.75,
                  margin: 0,
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "sources" && (
          <div>
            <p style={{ color: "rgba(100,116,139,0.8)", fontSize: "0.82rem", marginBottom: 16 }}>
              {report.sources.length} source{report.sources.length !== 1 ? "s" : ""} found
            </p>

            {report.sources.map((src, index) => (
              <div
                key={index}
                style={{
                  marginBottom: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  overflow: "hidden",
                }}
              >
                <span style={{ color: "rgba(100,116,139,0.6)", fontSize: "0.78rem", flexShrink: 0 }}>
                  {index + 1}.
                </span>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#60a5fa",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {src}
                </a>
              </div>
            ))}

            {report.sources.length === 0 && (
              <p style={{ color: "rgba(100,116,139,0.6)", fontSize: "0.85rem" }}>No sources available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
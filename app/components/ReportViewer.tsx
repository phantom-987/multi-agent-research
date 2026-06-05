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
    <div className="report-card fade-in">
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div>
          <h2 style={{ color: "white", fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>
            Research Report
          </h2>
          <p style={{ color: "rgba(148,163,184,0.7)", fontSize: "0.82rem", margin: "4px 0 0" }}>
            {report.query}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {report.fact_check_score !== null && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: scoreColor(report.fact_check_score), margin: 0 }}>
                {Math.round(report.fact_check_score * 100)}%
              </p>
              <p style={{ fontSize: "0.7rem", color: "rgba(100,116,139,0.9)", margin: 0 }}>Fact Score</p>
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
              padding: "8px 16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
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
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        {activeTab === "report" && (
          <div>
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
              <h3 style={{ color: "#93c5fd", fontWeight: 600, fontSize: "0.9rem", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Executive Summary
              </h3>
              <p style={{ color: "rgba(203,213,225,0.9)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
                {report.summary}
              </p>
            </div>

            {report.sections.map((section, index) => (
              <div key={index} style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    margin: "0 0 10px",
                    paddingLeft: 14,
                    borderLeft: "3px solid #3b82f6",
                  }}
                >
                  {section.title}
                </h3>
                <p style={{ color: "rgba(148,163,184,0.9)", fontSize: "0.88rem", lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>
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
                }}
              >
                <span style={{ color: "rgba(100,116,139,0.6)", fontSize: "0.78rem", flexShrink: 0, minWidth: 20 }}>
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
                  onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
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
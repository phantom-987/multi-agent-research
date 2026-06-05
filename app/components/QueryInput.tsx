"use client";

import { useState } from "react";

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  { label: "What is the current state of fusion energy?", icon: "📈", bg: "rgba(59,130,246,0.2)" },
  { label: "How does CRISPR gene editing work?", icon: "⚗", bg: "rgba(139,92,246,0.2)" },
  { label: "Latest developments in quantum computing 2025", icon: "⚙", bg: "rgba(59,130,246,0.2)" },
  { label: "Impact of AI on financial markets", icon: "📊", bg: "rgba(16,185,129,0.2)" },
];

export default function QueryInput({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div>
      {/* Search glass container */}
      <div className="search-glass p-3 flex items-center gap-3">
        {/* Search icon */}
        <svg
          style={{ flexShrink: 0, marginLeft: "8px", opacity: 0.45 }}
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter a research question..."
          className="search-input"
          style={{ fontSize: "1rem", padding: "10px 4px" }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="research-btn"
        >
          {loading ? (
            <>
              <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Researching...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Research
            </>
          )}
        </button>
      </div>

      {/* Example chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => setQuery(ex.label)}
            className="chip"
          >
            <span
              className="chip-icon"
              style={{ background: ex.bg }}
            >
              {ex.icon}
            </span>
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
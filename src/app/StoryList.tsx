"use client";

import { useState } from "react";
import { HNItem, getAge, getDomain } from "./hn";

const TAG_KEYWORDS: Record<string, string[]> = {
  ai: ["ai", "gpt", "llm", "openai", "anthropic", "claude", "gemini", "ml", "machine learning", "neural", "transformer"],
  web: ["javascript", "typescript", "react", "next", "css", "html", "browser", "web", "http", "api", "node"],
  hw: ["hardware", "pcb", "chip", "cpu", "gpu", "fpga", "arduino", "raspberry", "embedded", "electronics", "emulator"],
  sci: ["science", "physics", "math", "research", "paper", "study", "arxiv", "biology", "chemistry", "space", "nasa"],
  sec: ["security", "vulnerability", "cve", "exploit", "hack", "breach", "malware", "crypto", "encryption", "zero-day"],
};

function tagStory(title: string): string {
  const lower = title.toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return tag;
  }
  return "other";
}

const TAGS = [
  { id: "all", label: "all" },
  { id: "ai", label: "ai" },
  { id: "web", label: "web" },
  { id: "hw", label: "hw" },
  { id: "sci", label: "sci" },
  { id: "sec", label: "sec" },
];

function StoryRow({ story, isLast }: { story: HNItem; isLast: boolean }) {
  const age = getAge(story.time);
  const domain = getDomain(story.url);
  const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "76px 1fr 56px",
        gap: "0 24px",
        padding: "22px 0",
        borderBottom: isLast ? "none" : "1px solid #161616",
        alignItems: "start",
      }}
    >
      {/* Points */}
      <div style={{ textAlign: "right", paddingTop: 2 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 30,
            fontWeight: 500,
            lineHeight: 1,
            color: "#d0d0d0",
            letterSpacing: "-0.02em",
          }}
        >
          {story.score}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#3d3d3d",
            marginTop: 5,
            lineHeight: 1.3,
          }}
        >
          points · {age}
        </div>
      </div>

      {/* Title + meta */}
      <div>
        <a
          href={story.url ?? hnUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            fontSize: 14.5,
            fontWeight: 500,
            color: "#dedede",
            lineHeight: 1.45,
            fontFamily: "var(--font-inter)",
            marginBottom: 7,
            transition: "color 0.1s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#fff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#dedede")
          }
        >
          {story.title}
        </a>
        <div
          style={{
            fontSize: 11,
            color: "#3d3d3d",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span style={{ color: "#4a4a4a" }}>{domain}</span>
          <span style={{ color: "#2e2e2e" }}> · by </span>
          <span style={{ color: "#505050" }}>{story.by}</span>
        </div>
      </div>

      {/* Comments */}
      <div style={{ textAlign: "right", paddingTop: 2 }}>
        <a
          href={hnUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 17,
              fontWeight: 500,
              color: "#666",
              lineHeight: 1,
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#aaa")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#666")
            }
          >
            {story.descendants ?? 0}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#333",
              marginTop: 5,
            }}
          >
            comments
          </div>
        </a>
      </div>
    </div>
  );
}

export default function StoryList({ stories }: { stories: HNItem[] }) {
  const [activeTag, setActiveTag] = useState("all");

  const tagged = stories.map((s) => ({ ...s, _tag: tagStory(s.title) }));
  const filtered =
    activeTag === "all" ? tagged : tagged.filter((s) => s._tag === activeTag);

  const tagCounts = TAGS.slice(1).map((t) => ({
    ...t,
    count: tagged.filter((s) => s._tag === t.id).length,
  }));

  return (
    <>
      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 18,
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          color: "#444",
        }}
      >
        <span>
          <span style={{ color: "#aaa" }}>{stories.length}</span> links
        </span>
        <span>
          <span style={{ color: "#aaa" }}>{tagCounts.filter((t) => t.count > 0).length}</span> tags
        </span>
        <span>
          updated <span style={{ color: "#aaa" }}>live</span>
        </span>
      </div>

      {/* Tag pills */}
      <div
        style={{
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
          marginBottom: 48,
        }}
      >
        {[{ id: "all", label: "all", count: stories.length }, ...tagCounts].map((tag) => {
          const active = activeTag === tag.id;
          return (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              style={{
                padding: "5px 13px",
                borderRadius: 100,
                border: "1px solid",
                borderColor: active ? "transparent" : "#222",
                background: active ? "#e6e6e6" : "transparent",
                color: active ? "#0c0c0c" : "#555",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                transition: "all 0.1s",
                display: "flex",
                alignItems: "center",
                gap: 4,
                outline: "none",
              }}
            >
              {tag.label}
              {tag.id !== "all" && tag.count > 0 && (
                <span style={{ opacity: 0.55, fontSize: 11 }}>
                  · {tag.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 0,
          paddingBottom: 12,
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#888",
            fontFamily: "var(--font-inter)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Front page
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#333",
            fontFamily: "var(--font-mono)",
          }}
        >
          {filtered.length} links
        </span>
      </div>

      {/* Story list */}
      <div>
        {filtered.map((story, i) => (
          <StoryRow
            key={story.id}
            story={story}
            isLast={i === filtered.length - 1}
          />
        ))}
      </div>
    </>
  );
}

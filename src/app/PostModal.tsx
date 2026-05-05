"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function PostModal({ onClose }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ storyId: string | null } | null>(null);

  const mode: "url" | "text" | "none" =
    url ? "url" : text ? "text" : "none";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, text }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess({ storyId: data.storyId });
      } else {
        setError(data.error ?? "Submission failed.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          padding: "32px 28px",
          width: 400,
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {success ? (
          <>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 22, color: "#ececec", marginBottom: 6, marginTop: 0 }}>
              Submitted
            </h2>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--ink-2)", marginBottom: 20, marginTop: 0 }}>
              Your post is live on Hacker News.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {success.storyId && (
                <a
                  href={`https://news.ycombinator.com/item?id=${success.storyId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...submitBtnStyle, textDecoration: "none", display: "inline-block", textAlign: "center", flex: 1 }}
                >
                  View on HN ↗
                </a>
              )}
              <button onClick={onClose} style={{ ...submitBtnStyle, flex: 1 }}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 22, color: "#ececec", marginBottom: 6, marginTop: 0 }}>
              Submit a post
            </h2>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#666", marginBottom: 22, marginTop: 0 }}>
              Posts to Hacker News as you
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={80}
                style={inputStyle}
              />
              <input
                type="url"
                placeholder="URL (leave blank for text post)"
                value={url}
                onChange={e => { setUrl(e.target.value); if (e.target.value) setText(""); }}
                disabled={mode === "text"}
                style={{ ...inputStyle, opacity: mode === "text" ? 0.4 : 1 }}
              />
              <textarea
                placeholder="Text (leave blank for link post)"
                value={text}
                onChange={e => { setText(e.target.value); if (e.target.value) setUrl(""); }}
                disabled={mode === "url"}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 80,
                  opacity: mode === "url" ? 0.4 : 1,
                  fontFamily: "var(--font-inter)",
                }}
              />
              {error && (
                <p style={{ color: "#c0392b", fontFamily: "var(--font-mono)", fontSize: 11, margin: 0 }}>{error}</p>
              )}
              <button type="submit" disabled={loading} style={submitBtnStyle}>
                {loading ? "Submitting…" : "Submit"}
              </button>
            </form>
            <p style={{
              fontFamily: "var(--font-inter)",
              fontSize: 11,
              color: "#4a4a4a",
              marginTop: 18,
              marginBottom: 0,
              lineHeight: 1.55,
              borderTop: "1px solid #1e1e1e",
              paddingTop: 14,
            }}>
              Submit either a URL or text — not both. HN guidelines apply.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0c0c0c",
  border: "1px solid #2a2a2a",
  borderRadius: 4,
  padding: "9px 12px",
  color: "#e2e2e2",
  fontFamily: "var(--font-inter)",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const submitBtnStyle: React.CSSProperties = {
  background: "#1e1e1e",
  border: "1px solid #333",
  borderRadius: 4,
  padding: "9px 12px",
  color: "#e2e2e2",
  fontFamily: "var(--font-inter)",
  fontSize: 13,
  cursor: "pointer",
  marginTop: 4,
};

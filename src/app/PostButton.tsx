"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function PostButton() {
  const { user, openLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title required.");
      return;
    }
    if (url && text) {
      setError("Provide either url or text, not both.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hn-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, text }),
      });
      const data = await res.json();
      if (data.ok) {
        setOpen(false);
        setTitle("");
        setUrl("");
        setText("");
      } else {
        setError(data.error || "Submission failed.");
      }
    } catch {
      setError("Submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <a
        href="#"
        onClick={e => {
          e.preventDefault();
          if (!user) {
            setNeedLogin(true);
            return;
          }
          setOpen(true);
        }}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "#bdbdbd",
          textDecoration: "none",
        }}
      >
        post
      </a>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
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
              width: 420,
            }}
          >
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 22, color: "#ececec", marginBottom: 6 }}>
              Submit
            </h2>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#666", marginBottom: 22 }}>
              Share a link or ask a question
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>title</span>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>url</span>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>text</span>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-inter)" }}
                />
              </label>
              {error && (
                <p style={{ color: "#c0392b", fontFamily: "var(--font-mono)", fontSize: 11 }}>{error}</p>
              )}
              <button type="submit" disabled={loading} style={submitBtnStyle}>
                {loading ? "Submitting…" : "Submit"}
              </button>
            </form>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444", marginTop: 16, lineHeight: 1.5 }}>
              Leave url blank to submit a question. If url is set, text is optional.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "48px 1fr",
  alignItems: "start",
  gap: 10,
};

const labelTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "#888",
  paddingTop: 10,
};

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

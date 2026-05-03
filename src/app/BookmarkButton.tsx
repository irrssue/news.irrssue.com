"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const KEY = "hn-bookmarks";

function getBookmarks(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function BookmarkButton({ id, onUnsave }: { id: number; onUnsave?: () => void }) {
  const { user, openLogin } = useAuth();
  const [saved, setSaved] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    setSaved(getBookmarks().includes(id));
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setNeedLogin(true);
      return;
    }
    const next = getBookmarks();
    const idx = next.indexOf(id);
    if (idx === -1) {
      next.push(id);
    } else {
      next.splice(idx, 1);
    }
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
    const nowSaved = idx === -1;
    setSaved(nowSaved);
    if (!nowSaved && onUnsave) onUnsave();
  }

  return (
    <>
      <button
        onClick={toggle}
        aria-label={saved ? "Remove bookmark" : "Bookmark"}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: saved ? "var(--ink-2)" : "var(--ink-4)",
          display: "flex",
          alignItems: "center",
          transition: "color 0.15s",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          if (!saved) (e.currentTarget as HTMLElement).style.color = "var(--ink-3)";
        }}
        onMouseLeave={(e) => {
          if (!saved) (e.currentTarget as HTMLElement).style.color = "var(--ink-4)";
        }}
      >
        <svg
          width="13"
          height="16"
          viewBox="0 0 13 16"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1h11v13.5L6.5 11 1 14.5V1z" />
        </svg>
      </button>

      {needLogin && (
        <div
          onClick={() => setNeedLogin(false)}
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
              width: 340,
            }}
          >
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 22, color: "#ececec", marginBottom: 6 }}>
              Sign in required
            </h2>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#888", marginBottom: 22, lineHeight: 1.5 }}>
              You need an HN account to save stories.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setNeedLogin(false);
                  openLogin();
                }}
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #333",
                  borderRadius: 4,
                  padding: "9px 12px",
                  color: "#e2e2e2",
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Login
              </button>
              <button
                onClick={() => setNeedLogin(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #2a2a2a",
                  borderRadius: 4,
                  padding: "9px 12px",
                  color: "#888",
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

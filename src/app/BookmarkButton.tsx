"use client";

import { useEffect, useState } from "react";

const KEY = "hn-bookmarks";

function getBookmarks(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function BookmarkButton({ id, onUnsave, className }: { id: number; onUnsave?: () => void; className?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getBookmarks().includes(id));
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
    <button
      onClick={toggle}
      aria-label={saved ? "Remove bookmark" : "Bookmark"}
      data-saved={saved ? "true" : "false"}
      className={className}
      style={className ? undefined : {
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
  );
}

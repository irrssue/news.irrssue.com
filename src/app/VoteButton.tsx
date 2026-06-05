"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function VoteButton({ id, score }: { id: number; score: number }) {
  const { user, openLogin } = useAuth();
  const [voted, setVoted] = useState(false);
  const [pending, setPending] = useState(false);

  const display = score + (voted ? 1 : 0);

  async function toggle() {
    if (!user) {
      openLogin();
      return;
    }
    if (pending) return;

    const next = !voted;
    setVoted(next); // optimistic
    setPending(true);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, dir: next ? "up" : "un" }),
      });
      if (!res.ok) {
        setVoted(!next); // revert
        if (res.status === 401) openLogin();
      }
    } catch {
      setVoted(!next); // revert on network error
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={"vote-btn" + (voted ? " on" : "")}
      onClick={toggle}
      aria-pressed={voted}
      aria-label={voted ? "remove upvote" : "upvote"}
      title={user ? "upvote" : "sign in to upvote"}
    >
      <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
        <path d="M8 3l5 6H9v4H7V9H3z" fill="currentColor" />
      </svg>
      <span className="vote-n">{display}</span>
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function ProfileButton() {
  const { user, setUser, loginOpen, openLogin, closeLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loginOpen) setOpen(true);
  }, [loginOpen]);

  function handleClose() {
    setOpen(false);
    closeLogin();
    setError("");
    setPassword("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setUser({ username: data.username });
        handleClose();
      } else {
        setError(data.error ?? "Login failed.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  }

  async function handleLogout() {
    setDropdownOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  const initials = user ? user.username.slice(0, 2).toLowerCase() : null;

  return (
    <>
      <button
        onClick={() => user ? setDropdownOpen(o => !o) : setOpen(true)}
        title={user ? user.username : "Sign in with HN"}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2a2a26 0%, #1a1a18 100%)",
          border: "1px solid var(--rule-2)",
          color: user ? "var(--op)" : "var(--ink-3)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.15s, color 0.15s",
          position: "relative",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#444";
          (e.currentTarget as HTMLButtonElement).style.color = user ? "#d4b07a" : "#bbb";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
          (e.currentTarget as HTMLButtonElement).style.color = user ? "var(--op)" : "var(--ink-3)";
        }}
      >
        {initials ?? <UserIcon />}
      </button>

      {/* Logged-in dropdown */}
      {user && dropdownOpen && (
        <>
          <div onClick={() => setDropdownOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            padding: "10px 0",
            minWidth: 160,
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}>
            <div style={{ padding: "6px 16px 10px", borderBottom: "1px solid #1e1e1e", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>signed in as</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--op)", marginTop: 2 }}>
                {user.username}
              </div>
            </div>
            <a
              href={`https://news.ycombinator.com/user?id=${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={dropdownItemStyle}
              onClick={() => setDropdownOpen(false)}
            >
              HN profile ↗
            </a>
            <button onClick={handleLogout} style={{ ...dropdownItemStyle, background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
              Sign out
            </button>
          </div>
        </>
      )}

      {/* Login modal */}
      {open && (
        <div
          onClick={handleClose}
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
              width: 340,
              maxWidth: "calc(100vw - 32px)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 22, color: "#ececec", marginBottom: 6, marginTop: 0 }}>
              Sign in
            </h2>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#666", marginBottom: 22, marginTop: 0 }}>
              Hacker News account
            </p>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={inputStyle}
              />
              {error && (
                <p style={{ color: "#c0392b", fontFamily: "var(--font-mono)", fontSize: 11, margin: 0 }}>{error}</p>
              )}
              <button type="submit" disabled={loading} style={submitBtnStyle}>
                {loading ? "Signing in…" : "Sign in"}
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
              We log you into Hacker News on your behalf and store only the session cookie HN returns — never your password. The cookie is encrypted at rest.
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444", marginTop: 12, marginBottom: 0 }}>
              No account?{" "}
              <a href="https://news.ycombinator.com/login" target="_blank" rel="noopener noreferrer" style={{ color: "#666" }}>
                Create one on HN
              </a>
            </p>
          </div>
        </div>
      )}
    </>
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

const dropdownItemStyle: React.CSSProperties = {
  display: "block",
  padding: "7px 16px",
  fontFamily: "var(--font-inter)",
  fontSize: 12,
  color: "#888",
  textDecoration: "none",
  transition: "color 0.15s",
};

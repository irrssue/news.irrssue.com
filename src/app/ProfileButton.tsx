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
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hn-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setUser({ username });
        handleClose();
        setPassword("");
      } else {
        setError("Invalid credentials.");
      }
    } catch {
      setError("Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setOpen(false);
  }

  const initials = user ? user.username.slice(0, 2).toLowerCase() : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={user ? user.username : "Sign in with HN"}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#1e1e1e",
          border: "1px solid #2a2a2a",
          color: user ? "#c9a96e" : "#888",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#444";
          (e.currentTarget as HTMLButtonElement).style.color = user ? "#d4b07a" : "#bbb";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
          (e.currentTarget as HTMLButtonElement).style.color = user ? "#c9a96e" : "#888";
        }}
      >
        {initials ?? <UserIcon />}
      </button>

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
              width: 320,
            }}
          >
            {user ? (
              <>
                <p style={{ color: "#e2e2e2", fontFamily: "var(--font-inter)", fontSize: 14, marginBottom: 20 }}>
                  Signed in as <span style={{ color: "#c9a96e", fontFamily: "var(--font-mono)" }}>{user.username}</span>
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <a
                    href={`https://news.ycombinator.com/user?id=${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkBtnStyle}
                  >
                    View HN profile
                  </a>
                  <button onClick={handleLogout} style={ghostBtnStyle}>Sign out</button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 22, color: "#ececec", marginBottom: 6 }}>
                  Sign in
                </h2>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#666", marginBottom: 22 }}>
                  Hacker News account
                </p>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                  {error && (
                    <p style={{ color: "#c0392b", fontFamily: "var(--font-mono)", fontSize: 11 }}>{error}</p>
                  )}
                  <button type="submit" disabled={loading} style={submitBtnStyle}>
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </form>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444", marginTop: 16, lineHeight: 1.5 }}>
                  No account?{" "}
                  <a href="https://news.ycombinator.com/login" target="_blank" rel="noopener noreferrer" style={{ color: "#666" }}>
                    Create one on HN
                  </a>
                </p>
              </>
            )}
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

const ghostBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #2a2a2a",
  borderRadius: 4,
  padding: "7px 12px",
  color: "#888",
  fontFamily: "var(--font-inter)",
  fontSize: 12,
  cursor: "pointer",
};

const linkBtnStyle: React.CSSProperties = {
  background: "#1e1e1e",
  border: "1px solid #333",
  borderRadius: 4,
  padding: "7px 12px",
  color: "#e2e2e2",
  fontFamily: "var(--font-inter)",
  fontSize: 12,
  textDecoration: "none",
  display: "inline-block",
};

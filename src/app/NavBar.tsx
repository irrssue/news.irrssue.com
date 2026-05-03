"use client";

import { useState } from "react";
import Link from "next/link";
import ProfileButton from "./ProfileButton";

const TABS = ["fresh", "threads", "archive", "replies", "ask", "show", "work"] as const;
type Tab = (typeof TABS)[number];

export default function NavBar() {
  const [active, setActive] = useState<Tab>("fresh");

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#0c0c0c",
        borderBottom: "1px solid var(--border)",
        height: 72,
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0 36px",
      }}
    >
      <div style={{ justifySelf: "start" }}>
        <a
          href="/"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#ececec",
            textDecoration: "none",
            lineHeight: 1,
          }}
        >
          Reads
        </a>
      </div>

      <ul
        style={{
          justifySelf: "center",
          display: "flex",
          gap: 28,
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {TABS.map(tab => {
          const isActive = active === tab;
          return (
            <li key={tab}>
              <button
                onClick={() => setActive(tab)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px 0",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: isActive ? "#ececec" : "#5a5a5a",
                  borderBottom: isActive ? "1px solid #ececec" : "1px solid transparent",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#9a9a9a";
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#5a5a5a";
                }}
              >
                {tab}
              </button>
            </li>
          );
        })}
      </ul>

      <div
        style={{
          justifySelf: "end",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <a
          href="#"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "#bdbdbd",
            textDecoration: "none",
          }}
        >
          post
        </a>
        <ProfileButton />
      </div>
    </nav>
  );
}

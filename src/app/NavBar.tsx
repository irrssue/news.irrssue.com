"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileButton from "./ProfileButton";
import PostButton from "./PostButton";

const TABS = [
  { label: "fresh", href: "/fresh" },
  { label: "threads", href: "/threads" },
  { label: "archive", href: "/archive" },
  { label: "replies", href: "/replies" },
  { label: "ask", href: "/ask" },
  { label: "show", href: "/show" },
  { label: "work", href: "/work" },
] as const;

export default function NavBar() {
  const pathname = usePathname();

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
        <Link
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
          Front Page
        </Link>
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
          const isActive = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                style={{
                  display: "inline-block",
                  padding: "4px 0",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: isActive ? "#ececec" : "#5a5a5a",
                  borderBottom: isActive ? "1px solid #ececec" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "#9a9a9a";
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "#5a5a5a";
                }}
              >
                {tab.label}
              </Link>
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
        <PostButton />
        <ProfileButton />
      </div>
    </nav>
  );
}

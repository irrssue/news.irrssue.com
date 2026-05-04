"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function getSavedCount(): number {
  try {
    return (JSON.parse(localStorage.getItem("hn-bookmarks") ?? "[]") as number[]).length;
  } catch {
    return 0;
  }
}

const TABS = [
  { label: "front page", href: "/" },
  { label: "fresh", href: "/fresh" },
  { label: "threads", href: "/threads" },
  { label: "work", href: "/work" },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const update = () => setHasSaved(getSavedCount() > 0);
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="hamburger"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="ham-bar" />
            <span className="ham-bar" />
            <span className="ham-bar" />
          </button>
          <Link href="/" className="brand">Reads</Link>
          <Link
            href="/saved"
            aria-label="Saved"
            style={{
              display: "flex",
              alignItems: "center",
              color: hasSaved ? "#ffffff" : "var(--ink-4)",
              transition: "color 0.15s",
              marginLeft: 2,
            }}
            onMouseEnter={(e) => { if (!hasSaved) (e.currentTarget as HTMLElement).style.color = "var(--ink-2)"; }}
            onMouseLeave={(e) => { if (!hasSaved) (e.currentTarget as HTMLElement).style.color = "var(--ink-4)"; }}
          >
            <svg width="13" height="16" viewBox="0 0 13 16" fill={hasSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1h11v13.5L6.5 11 1 14.5V1z" />
            </svg>
          </Link>
        </div>

        <ul className="nav">
          {TABS.map(tab => {
            const isActive = tab.href === "/" ? pathname === "/" : pathname === tab.href;
            return (
              <li key={tab.href}>
                <Link href={tab.href} className={isActive ? "on" : ""}>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="right" />
      </header>

      {open && (
        <>
          <div className="mobile-overlay-backdrop" onClick={() => setOpen(false)} />
          <div className="mobile-overlay">
            <ul className="mobile-nav">
              {TABS.map(tab => {
                const isActive = tab.href === "/" ? pathname === "/" : pathname === tab.href;
                return (
                  <li key={tab.href}>
                    <Link href={tab.href} className={isActive ? "on" : ""} onClick={() => setOpen(false)}>
                      {tab.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </>
  );
}

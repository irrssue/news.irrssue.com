"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useTransition, Suspense } from "react";
import ProfileButton from "./ProfileButton";
import PostModal from "./PostModal";
import { useAuth } from "./AuthContext";

const BOOKMARK_KEY = "hn-bookmarks";

function SavedNavButton() {
  const [hasSaved, setHasSaved] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function check() {
      try {
        const items = JSON.parse(localStorage.getItem(BOOKMARK_KEY) ?? "[]");
        setHasSaved(Array.isArray(items) && items.length > 0);
      } catch {
        setHasSaved(false);
      }
    }
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  const isActive = pathname === "/saved";

  return (
    <Link
      href="/saved"
      aria-label="Saved posts"
      style={{
        display: "flex",
        alignItems: "center",
        color: isActive ? "var(--ink)" : hasSaved ? "var(--ink-2)" : "var(--ink-4)",
        transition: "color 0.15s",
        lineHeight: 1,
      }}
    >
      <svg
        width="13"
        height="16"
        viewBox="0 0 13 16"
        fill={hasSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 1h11v13.5L6.5 11 1 14.5V1z" />
      </svg>
    </Link>
  );
}

const TABS = [
  { label: "front page", href: "/" },
  { label: "fresh", href: "/fresh" },
  { label: "threads", href: "/threads" },
  { label: "work", href: "/work" },
] as const;

const RANGES = [
  { id: "today", label: "Today", hint: "24h" },
  { id: "week",  label: "This week", hint: "7d" },
  { id: "month", label: "This month", hint: "30d" },
  { id: "all",   label: "All-time", hint: "" },
] as const;

type RangeId = typeof RANGES[number]["id"];

function RangePicker() {
  const router = useRouter();
  const params = useSearchParams();
  const t = params.get("t");
  const value: RangeId = (RANGES.find(r => r.id === t)?.id) ?? "today";
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = RANGES.find(r => r.id === value)!;

  function pick(id: RangeId) {
    setOpen(false);
    startTransition(() => {
      router.push(id === "today" ? "/" : `/?t=${id}`);
    });
  }

  return (
    <div className="range" ref={ref}>
      <button
        className="range-current"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="dot" />
        <span>{current.label.toLowerCase()}</span>
        <span className="caret" />
      </button>
      <div className={"range-menu" + (open ? " open" : "")} role="menu">
        {RANGES.map(r => (
          <button
            key={r.id}
            className={r.id === value ? "on" : ""}
            onClick={() => pick(r.id)}
            role="menuitemradio"
            aria-checked={r.id === value}
          >
            <span>{r.label}{r.hint && <span className="meta">{r.hint}</span>}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const { user, openLogin } = useAuth();

  useEffect(() => { setOpen(false); }, [pathname]);

  function handlePostClick() {
    if (!user) {
      openLogin();
    } else {
      setPostOpen(true);
    }
  }

  const showRange = pathname === "/";

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
          <SavedNavButton />
        </div>

        <div className="navcluster">
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
          {showRange && (
            <>
              <span className="pipe" />
              <Suspense fallback={null}>
                <RangePicker />
              </Suspense>
            </>
          )}
        </div>

        <div className="right" style={{ position: "relative" }}>
          <button className="post-btn" aria-label="Submit a post">+ post</button>
          <ProfileButton />
        </div>
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
              <li>
                <Link href="/saved" className={pathname === "/saved" ? "on" : ""} onClick={() => setOpen(false)}>
                  saved
                </Link>
              </li>
            </ul>
            <div className="mobile-actions">
              <button className="post-btn" aria-label="Submit a post">+ post</button>
              <ProfileButton />
            </div>
          </div>
        </>
      )}
    </>
  );
}

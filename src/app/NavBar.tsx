"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ProfileButton from "./ProfileButton";
import PostButton from "./PostButton";

const TABS = [
  { label: "front page", href: "/" },
  { label: "fresh", href: "/fresh" },
  { label: "threads", href: "/threads" },
  { label: "archive", href: "/archive" },
  { label: "show", href: "/show" },
  { label: "work", href: "/work" },
  { label: "saved", href: "/saved" },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

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

        <div className="right">
          <PostButton />
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
            </ul>
            <div className="mobile-actions">
              <PostButton />
              <ProfileButton />
            </div>
          </div>
        </>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileButton from "./ProfileButton";
import PostButton from "./PostButton";

const TABS = [
  { label: "front page", href: "/" },
  { label: "fresh", href: "/fresh" },
  { label: "threads", href: "/threads" },
  { label: "archive", href: "/archive" },
  { label: "show", href: "/show" },
  { label: "work", href: "/work" },
] as const;

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <Link href="/" className="brand">Reads</Link>

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
  );
}

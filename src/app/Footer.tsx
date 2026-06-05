import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="foot-brand">Reads · not affiliated with Hacker News</span>
        <nav className="foot-links">
          <Link href="/legal/terms">Terms</Link>
          <span className="foot-dot">·</span>
          <Link href="/legal/privacy">Privacy</Link>
          <span className="foot-dot">·</span>
          <span className="foot-copy">© {new Date().getFullYear()}</span>
        </nav>
      </div>
    </footer>
  );
}

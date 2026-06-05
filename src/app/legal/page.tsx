import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal · Reads",
  description: "Terms of Service and Privacy Policy for Reads.",
};

export default function LegalIndex() {
  return (
    <article className="legal">
      <h1>Legal</h1>
      <p className="lead">
        The agreements that govern your use of Reads. Please read both before signing in.
      </p>
      <ul className="legal-index">
        <li>
          <Link href="/legal/terms">Terms of Service</Link>
          <span>The rules for using this site, disclaimers, and limits of liability.</span>
        </li>
        <li>
          <Link href="/legal/privacy">Privacy Policy</Link>
          <span>What data we touch, how your Hacker News session is stored, and your choices.</span>
        </li>
      </ul>
    </article>
  );
}

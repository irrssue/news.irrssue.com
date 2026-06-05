import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Reads",
  description: "What data Reads handles and how your Hacker News session is stored.",
};

export default function PrivacyPage() {
  return (
    <article className="legal">
      <h1>Privacy Policy</h1>
      <p className="legal-date">Last updated: 4 June 2026</p>

      <p className="lead">
        This policy explains exactly what data Reads touches, what it stores, and what it does not.
        Reads is a personal project and deliberately collects as little as possible.
      </p>

      <h2>1. The short version</h2>
      <ul>
        <li><strong>We never store your Hacker News password.</strong> It is forwarded to Hacker News to log you in, then discarded.</li>
        <li><strong>We store your Hacker News session cookie, encrypted</strong>, so the app can post on your behalf.</li>
        <li>We store your Hacker News <strong>username</strong> to show who you are signed in as.</li>
        <li>Your <strong>bookmarks</strong> live only in your own browser — they never reach our server.</li>
        <li>No analytics, no ad trackers, no selling of data.</li>
      </ul>

      <h2>2. What we collect and why</h2>
      <table className="legal-table">
        <thead>
          <tr><th>Data</th><th>Stored?</th><th>Where</th><th>Why</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>HN password</td>
            <td><strong>No</strong></td>
            <td>In memory only, momentarily</td>
            <td>Forwarded to Hacker News to log you in, then cleared. Never written to disk or logs.</td>
          </tr>
          <tr>
            <td>HN session cookie</td>
            <td>Yes — encrypted (AES-256-GCM)</td>
            <td>A file on our server</td>
            <td>Lets Reads act as you on Hacker News (e.g. submit a post) without re-asking your password.</td>
          </tr>
          <tr>
            <td>HN username</td>
            <td>Yes</td>
            <td>Same file</td>
            <td>To display your account and link to your HN profile.</td>
          </tr>
          <tr>
            <td>Reads session ID</td>
            <td>Yes</td>
            <td>An <code>httpOnly</code> cookie in your browser + our server</td>
            <td>Keeps you signed in for up to 30 days. Random value, holds no personal data.</td>
          </tr>
          <tr>
            <td>IP address</td>
            <td>Briefly, in memory</td>
            <td>Server RAM only</td>
            <td>Rate-limits login attempts to prevent abuse. Not written to disk; cleared on restart.</td>
          </tr>
          <tr>
            <td>Bookmarks</td>
            <td>No (client-side)</td>
            <td>Your browser&rsquo;s <code>localStorage</code></td>
            <td>Saved stories stay on your device and are never sent to us.</td>
          </tr>
        </tbody>
      </table>

      <h2>3. About the stored session cookie</h2>
      <p>
        This is the most important thing to understand. When you sign in, Hacker News returns a
        session cookie. Reads encrypts it and stores it so it can submit posts as you. While stored,
        this cookie can be used to act on your Hacker News account. We protect it by encrypting it at
        rest and restricting access to the file, but{" "}
        <strong>
          no system is perfectly secure — if our server were compromised, a stored session could be
          misused
        </strong>
        . We disclose this plainly so you can make an informed choice. If you are not comfortable with
        this, do not sign in; you can still read everything without an account.
      </p>

      <h2>4. Retention &amp; deletion</h2>
      <ul>
        <li>Signing out immediately deletes your Reads session from our server.</li>
        <li>Your stored Hacker News cookie is removed when you sign out or when the session is invalidated.</li>
        <li>To revoke any cookie we may still hold, change your Hacker News password — that invalidates it on HN&rsquo;s side.</li>
        <li>Bookmarks are cleared by clearing your browser&rsquo;s site data.</li>
      </ul>

      <h2>5. Sharing</h2>
      <p>
        We do not sell, rent, or share your data with third parties. The only external service Reads
        talks to on your behalf is Hacker News itself (
        <a href="https://news.ycombinator.com" target="_blank" rel="noopener noreferrer">news.ycombinator.com</a>),
        to read content and to post as you. Hacker News&rsquo; own handling of your account is
        governed by their policies, not ours.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Reads sets a single <code>httpOnly</code> session cookie (<code>mhn_sid</code>) when you sign
        in, to keep you logged in. It contains a random identifier only. We use no advertising or
        analytics cookies.
      </p>

      <h2>7. Security</h2>
      <p>
        Login happens over HTTPS. Passwords are never persisted. Session cookies are encrypted at
        rest with AES-256-GCM and login attempts are rate-limited. This is a personal project,
        though, and we cannot guarantee absolute security. See section 3.
      </p>

      <h2>8. Children</h2>
      <p>The Service is not directed to children under 13, and we do not knowingly collect their data.</p>

      <h2>9. Changes</h2>
      <p>
        We may update this policy; the &ldquo;Last updated&rdquo; date reflects the current version.
        Material changes will be reflected here.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions or a deletion request? Email{" "}
        <a href="mailto:liam@irrssue.com">liam@irrssue.com</a>.
      </p>

      <p className="legal-foot">
        See also the <Link href="/legal/terms">Terms of Service</Link>.
      </p>
    </article>
  );
}

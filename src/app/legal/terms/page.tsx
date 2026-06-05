import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Reads",
  description: "The terms governing your use of Reads.",
};

export default function TermsPage() {
  return (
    <article className="legal">
      <h1>Terms of Service</h1>
      <p className="legal-date">Last updated: 4 June 2026</p>

      <p className="lead">
        Reads (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a personal,
        non-commercial project that displays content from Hacker News and lets you sign in with
        your Hacker News account to post. By using the Service you agree to these Terms. If you do
        not agree, do not use the Service.
      </p>

      <h2>1. What Reads is</h2>
      <p>
        Reads is an independent, minimal reader for Hacker News. It fetches public stories and
        comments from the Hacker News API and re-displays them. When you sign in, Reads can submit
        posts to Hacker News on your behalf using your Hacker News session. Reads is a hobby project
        run by an individual on a personal server. It is provided free of charge, with no guarantee
        of availability, support, or continued operation.
      </p>

      <h2>2. Not affiliated with Hacker News or Y Combinator</h2>
      <p>
        Reads is <strong>not affiliated with, endorsed by, sponsored by, or operated by</strong>{" "}
        Y Combinator, Hacker News, or any of their affiliates. &ldquo;Hacker News&rdquo; and
        &ldquo;Y Combinator&rdquo; are the property of their respective owners and are used here only
        to describe the source of the content and the account you sign in with. All stories,
        comments, usernames, and submissions originate from and remain governed by{" "}
        <a href="https://news.ycombinator.com/newsguidelines.html" target="_blank" rel="noopener noreferrer">
          Hacker News
        </a>{" "}
        and its own terms and guidelines. Your continued ability to use the sign-in feature depends
        on Hacker News, which we do not control and which may change or break at any time.
      </p>

      <h2>3. Signing in &amp; your Hacker News account</h2>
      <p>By signing in you understand and agree that:</p>
      <ul>
        <li>
          You enter your Hacker News username and password. Reads forwards them to Hacker News to
          log you in. <strong>Your password is never stored and never logged</strong> — it is held
          only in memory for the moment it takes to authenticate, then discarded.
        </li>
        <li>
          Reads stores the <strong>session cookie</strong> that Hacker News returns, encrypted at
          rest, so it can act on your behalf (for example, to submit a post). This cookie grants
          access to your Hacker News account for as long as it is valid. See the{" "}
          <Link href="/legal/privacy">Privacy Policy</Link> for details.
        </li>
        <li>
          You are responsible for everything done through your account via the Service. Only sign in
          if you own the Hacker News account and are comfortable with Reads acting on its behalf.
        </li>
        <li>
          You can sign out at any time, which deletes your Reads session immediately. To fully
          invalidate the stored Hacker News cookie, change your Hacker News password.
        </li>
        <li>
          Using the Service must not violate the Hacker News terms or guidelines. Do not use Reads
          to spam, manipulate rankings, or automate abuse.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Attempt to gain unauthorised access to the Service, its server, or other users&rsquo; data;</li>
        <li>Probe, scan, overload, or disrupt the Service or its infrastructure;</li>
        <li>Submit unlawful, infringing, or abusive content through the Service;</li>
        <li>Use the Service to access an account that is not yours.</li>
      </ul>

      <h2>5. Content</h2>
      <p>
        Reads does not own the stories or comments it displays — they belong to their authors and to
        Hacker News. Anything you submit through Reads is posted to Hacker News under your account
        and is governed by Hacker News&rsquo; rules. We are not responsible for content shown or
        submitted through the Service.
      </p>

      <h2>6. No warranty</h2>
      <p>
        The Service is provided <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>,
        without warranties of any kind, express or implied, including fitness for a particular
        purpose, accuracy, or non-infringement. We do not warrant that the Service will be
        uninterrupted, secure, error-free, or that any data will be preserved. You use it at your own
        risk.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, the operator of Reads shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages, or any loss of data,
        access, or accounts, arising out of or relating to your use of the Service — including any
        compromise of your Hacker News account or session. To the extent any liability cannot be
        excluded, it is limited to the amount you paid to use the Service, which is{" "}
        <strong>zero</strong>.
      </p>

      <h2>8. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless the operator of Reads from any claim or demand
        arising out of your use of the Service or your violation of these Terms.
      </p>

      <h2>9. Changes &amp; termination</h2>
      <p>
        We may change, suspend, or shut down the Service at any time without notice. We may update
        these Terms; the &ldquo;Last updated&rdquo; date above reflects the current version.
        Continued use after a change means you accept it.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws applicable where the operator resides, without regard to
        conflict-of-law rules. If any provision is found unenforceable, the rest remains in effect.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:liam@irrssue.com">liam@irrssue.com</a>.
      </p>

      <p className="legal-foot">
        See also the <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    </article>
  );
}

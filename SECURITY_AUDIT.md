# Security Audit

## 2. Secret Scan

Audited: committed files, full git history (`git log -p --all`), env var usage, `.gitignore` coverage, NEXT_PUBLIC_ vars, hardcoded infrastructure info, IDE/OS files, source maps.

---

### Findings

#### CRITICAL

None found. No raw API keys, private keys, tokens, or passwords committed in any file or commit.

---

#### HIGH

**H1 — Hardcoded Tailscale IP in git history**
- File/commit: `.github/workflows/deploy.yml` (deleted, commits `a7d08c6`, `551ed79`, `5cb96cf`, `92bbac5`)
- Detail: `irrssue@100.100.200.29` (Tailscale node IP) was hardcoded in the SSH deploy step across multiple commits. File is deleted now but the IP is permanently in git history.
- Action: Tailscale IPs are internal (100.x.x.x range, only reachable via Tailscale network) so exposure is low-impact, but still leaks your network topology. If you ever rotate or reassign that node, no action needed. To fully scrub: `git filter-repo --path .github/workflows/deploy.yml --invert-paths` (rewrites history — coordinate with any clones/forks first).

**H2 — SSH username exposed in git history and `.claude/settings.local.json`**
- Files: deleted `deploy.yml` history + `.claude/settings.local.json` (not tracked, but present locally)
- Detail: `irrssue@100.100.200.29` leaks the SSH username for the homeserver.
- Action: Same scrub as H1 if desired. Username alone is low risk but reduces attacker recon work.

**H3 — `StrictHostKeyChecking=no` in historical deploy pipeline**
- Commits: `a7d08c6` (later fixed in commit that added `StrictHostKeyChecking=yes` + `SSH_KNOWN_HOSTS`)
- Detail: Earlier deploy config disabled host key checking, enabling MITM during CI deploys. Already fixed in later commit.
- Action: Confirmed fixed. No action needed for current state, but the insecure version is preserved in history.

---

#### MEDIUM

**M1 — Personal username / domain / server info in committed files**
- Files: `README.md:5,43,45,47`, `CLAUDE.md:92-95`, `scripts/deploy-hn.sh:2`
- Detail: `news.irrssue.com`, `irrssue.com`, "personal Ubuntu homeserver", "Nginx reverse proxy" are committed. This is a public repo — this info is intentionally public (README links to live site), so severity depends on your threat model. The homeserver reference slightly fingerprints your infra stack.
- Action: Accept if intentional. Consider removing "personal Ubuntu homeserver" / "Nginx" details from CLAUDE.md if you want less infra fingerprinting.

**M2 — Personal email in git commit author metadata**
- Detail: `irrssue@gmail.com` appears in `git log` author fields. Not in files, but visible in public repo history.
- Action: Expected for a personal project. No action needed unless you want pseudonymity.

**M3 — `HN_COOKIE_ENCRYPTION_KEY` required but no `.env.example` or startup guard**
- Files: `src/lib/crypto.ts:7-12`, `scripts/test-hn-login.ts:11-13`
- Detail: App throws at runtime if `HN_COOKIE_ENCRYPTION_KEY` is missing. There's no `.env.example` and no documented key-generation step. Someone cloning the repo and running it without the env var gets a cryptic runtime error when any auth route is hit.
- Action: Add `.env.example` with `HN_COOKIE_ENCRYPTION_KEY=<run: openssl rand -hex 32>`. No secret value would be committed — only the placeholder.

**M4 — `scripts/test-hn-login.ts` committed — contains HN credential test harness**
- File: `scripts/test-hn-login.ts`
- Detail: Script accepts `<username> <password>` as CLI args and POSTs them to HN. Not a secret itself, but: (a) it auto-generates and logs a random key to stdout if env var missing (`console.log("[test] Generated random key: ...")`), making key leakage easy in CI logs; (b) signals to readers that the app handles HN passwords server-side, increasing interest from attackers.
- Action: Move to `.gitignore` or delete if no longer needed. At minimum, remove the `console.log` of the generated key.

---

#### LOW

**L1 — `.gitignore` missing `.claude/` directory**
- Detail: `.claude/settings.json` is committed (tracked by git). `settings.local.json` is not tracked (confirmed via `git ls-files`), but there's no `.gitignore` rule preventing it from being accidentally staged. `settings.local.json` contains a hardcoded `ssh` allow-rule with the Tailscale IP (line 26).
- Action: Add `.claude/settings.local.json` (or `.claude/*.local.*`) to `.gitignore` to prevent accidental future commit.

**L2 — `.gitignore` missing `.vscode/`, `.idea/`**
- Detail: No IDE config dirs currently committed, but no ignore rule blocks them either.
- Action: Add `.vscode/` and `.idea/` to `.gitignore`.

**L3 — `scripts/deploy-hn.sh` reveals exact homeserver path and PM2 app name**
- File: `scripts/deploy-hn.sh:6-7`
- Detail: `$HOME/minimal-hackernews` (path) and `hackernews` (PM2 app name) are committed. Low sensitivity.
- Action: Accept or use env vars (`PM2_APP="${PM2_APP:-hackernews}"`).

**L4 — `script-src 'unsafe-inline'` in CSP**
- File: `next.config.ts:12`
- Detail: Allows inline `<script>` tags, weakening XSS protection. Not a secret leak, but a security posture issue noted here for completeness.
- Action: Replace with nonce-based CSP (`next/headers` nonce) or `'strict-dynamic'`.

---

### NEXT_PUBLIC_* Variables

No `NEXT_PUBLIC_*` environment variables found anywhere in source. Nothing ships to the browser via env.

---

### .gitignore Coverage Check

| Pattern | Covered? |
|---------|----------|
| `.env` | Yes (`/.env*`) |
| `.env.local` | Yes (`/.env*`) |
| `.env*.local` | Yes (`/.env*`) |
| `node_modules` | Yes (`/node_modules`) |
| `.next` | Yes (`/.next/`) |
| `.vercel` | Yes (`/.vercel`) |
| `*.pem` | Yes (`*.pem`) |
| `.DS_Store` | Yes |
| `*.log` | Yes (npm/yarn/pnpm debug logs) |
| `.claude/settings.local.json` | **No** — add this |
| `.vscode/` | **No** — add this |
| `.idea/` | **No** — add this |

---

### Source Maps

`.next/` is gitignored — build output not committed. `next.config.ts` does not set `productionBrowserSourceMaps: true`. Default Next.js behavior: no source maps in production browser bundle. **No exposure.**

---

### Summary

No credentials or keys were ever committed. Main risk is **H1** (Tailscale IP in history) — low real-world impact since it's a private-network address, but worth scrubbing if the repo is public. Address **L1** (`.gitignore` gap for `settings.local.json`) to prevent future accidental commit of that file, which contains the hardcoded SSH target.

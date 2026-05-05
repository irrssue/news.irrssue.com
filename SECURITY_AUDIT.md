# Security Audit — minimal-hackernews

Date: 2026-05-05  
Auditor: Claude (read-only static analysis, no execution)

---

## 1. Stack Summary

| Component | Value |
|-----------|-------|
| Framework | Next.js 16.2.4 (App Router, SSR) |
| Runtime | Node.js (server-side); React 19 (client) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, inline styles |
| Key deps | `isomorphic-dompurify@3.12.0` (HTML sanitization) |
| Hosting | Personal Ubuntu homeserver, Nginx reverse proxy, Certbot SSL, PM2 |
| Domain | `news.irrssue.com` |
| Session store | Flat JSON file (`/.data/sessions.json`), written server-side only |
| Crypto | Node built-in `crypto` — AES-256-GCM |

No database engine (SQLite, Postgres, etc). No ORM. No third-party auth library.

---

## 2. Network Surface

All external HTTP calls are **server-side only** (in Route Handlers or Server Components). No client-side calls reach HN or Algolia directly.

| # | Where | Method | URL | Trigger |
|---|-------|--------|-----|---------|
| 1 | `hn.ts` (Server Component) | GET | `https://hacker-news.firebaseio.com/v0/{feed}.json` | Page load, revalidate 300s |
| 2 | `hn.ts` (Server Component) | GET | `https://hacker-news.firebaseio.com/v0/item/{id}.json` | Per-story fetch, parallel |
| 3 | `hn.ts` (Server Component) | GET | `https://hn.algolia.com/api/v1/search?...` | Range filter (week/month/all) |
| 4 | `hn.ts` (Server Component) | GET | `https://hacker-news.firebaseio.com/v0/item/{storyId}.json` | Comment thread load |
| 5 | `api/auth/login/route.ts` (Route Handler) | POST | `https://news.ycombinator.com/login` | User login action |
| 6 | `api/submit/route.ts` (Route Handler) | GET | `https://news.ycombinator.com/submit` | Fetch CSRF fnid token |
| 7 | `api/submit/route.ts` (Route Handler) | POST | `https://news.ycombinator.com/r` | Story submission to HN |
| 8 | `AuthContext.tsx` (Client Component) | GET | `/api/auth/me` (internal) | On mount — session hydration |
| 9 | `ProfileButton.tsx` (Client) | POST | `/api/auth/login` (internal) | Login form submit |
| 10 | `ProfileButton.tsx` (Client) | POST | `/api/auth/logout` (internal) | Logout button |
| 11 | `PostModal.tsx` (Client) | POST | `/api/submit` (internal) | Story submission form |
| 12 | `layout.tsx` | GET | `https://fonts.googleapis.com` / `https://fonts.gstatic.com` | Font loading (Next.js Google Fonts) |

Client-to-server calls (#8-11) go through Next.js Route Handlers — no direct external access from the browser.

---

## 3. Data Flow

### User inputs

| Input | Source | Destination | Sanitized? |
|-------|--------|-------------|-----------|
| `username` | Login form | POST body to /api/auth/login then to HN as `acct=` | Trimmed, not further validated |
| `password` | Login form | POST body to /api/auth/login then to HN as `pw=`; cleared after use | Never stored, never logged |
| `title` | Submit form | POST body to /api/submit then to HN | Trimmed; maxLength=80 client-only |
| `url` | Submit form | POST body to /api/submit then to HN | Not validated server-side beyond non-empty |
| `text` | Submit form | POST body to /api/submit then to HN | Not validated server-side beyond non-empty |
| `?feed=` query param | URL | /api/stories route | Allowlist checked against VALID_FEEDS |
| `?range=` query param | URL | /api/stories route | Allowlist checked against VALID_RANGES |
| `?offset=` query param | URL | /api/stories route | Parsed, clamped to [0, 1000] |
| `[id]` path param | /story/[id] URL | parseInt then Firebase fetch | isNaN check + notFound() |
| `?t=` query param | URL | NavBar RangePicker | Matched against static RANGES array |

### HN API responses rendered as HTML

- `HNItem.text` (story body) — rendered after `sanitizeHNHtml()` in `story/[id]/page.tsx:49`
- `HNComment.text` — rendered after `sanitizeHNHtml()` in `CommentsThread.tsx:82`
- `sanitizeHNHtml()` uses DOMPurify: allowlist tags (`p a i em b strong code pre br`), allowlist attrs (`href rel target`), URI scheme restricted to `https? | mailto | #`

### Bookmark data

- Stored in `localStorage` (`hn-bookmarks` key) as JSON array of numeric IDs
- Never sent to server

### Session data

- HN cookie encrypted AES-256-GCM before writing to `/.data/sessions.json`
- Browser holds only opaque `mhn_sid` cookie (32-byte random hex), httpOnly, secure (prod), sameSite: lax
- Session lookup: `mhn_sid` → `irrssue_sessions` → `hn_sessions`

---

## 4. Secrets & Env Vars

| Name | Where referenced | Purpose | Required? |
|------|-----------------|---------|----------|
| `HN_COOKIE_ENCRYPTION_KEY` | `src/lib/crypto.ts:7` | AES-256-GCM key (64 hex chars = 32 bytes) | Yes — throws if missing |
| `DATA_DIR` | `src/lib/db.ts:10` | Override path for sessions.json | No — defaults to `<cwd>/.data` |
| `NODE_ENV` | login route:9, submit route:5, cookie secure flag | Production mode gating | Set by Next.js |

No .env file found in repo (correctly gitignored via `.env*`). No secrets hardcoded in source.

---

## 5. Build / Deploy Config

### next.config.ts

- `poweredByHeader: false` — removes X-Powered-By fingerprint

**Security headers applied to `/:path*`:**

| Header | Value |
|--------|-------|
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), interest-cohort=() |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload |
| Content-Security-Policy | see below |

**CSP:**

```
default-src 'self'
script-src 'self' 'unsafe-inline'   <-- allows inline scripts; weakens XSS protection
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com data:
img-src 'self' data:
connect-src 'self' https://hacker-news.firebaseio.com https://hn.algolia.com
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

`'unsafe-inline'` in script-src is required by Next.js App Router hydration — known limitation.  
No `object-src` — inherits `default-src 'self'`, acceptable.

### Deployment

- No Vercel config (not Vercel-hosted)
- No Nginx config in repo
- No CI/CD config (no .github/workflows, no Dockerfile)
- `/.data/` gitignored — correct

---

## 6. Authentication, Mutation, and User Input Surface

### Endpoint auth requirements

| Endpoint | Auth required | What it does |
|----------|--------------|-------------|
| POST /api/auth/login | None (creates session) | Proxies credentials to HN, stores encrypted cookie |
| POST /api/auth/logout | None (soft — no 401 if missing) | Deletes session from store, clears cookie |
| GET /api/auth/me | None (returns null if no session) | Returns username or null |
| POST /api/submit | Yes — 401 if no valid session | Proxies story submission to HN |
| GET /api/stories | None (public) | Returns story list from HN/Algolia |

### State mutation

- Login: writes to `/.data/sessions.json`
- Logout: writes to `/.data/sessions.json`
- Submit: posts to HN (real external side effect)
- Bookmarks: writes to localStorage (client-only, no server)
- Vote / reply / share / save / report buttons in CommentsThread.tsx: **all non-functional stubs** — no handlers, no API calls

### Rate limiting

- Only on `POST /api/auth/login`: 5 attempts / 15 min per IP, in-memory (resets on restart)
- No rate limit on `/api/submit` beyond HN's own limiting
- No rate limit on `/api/stories`

### CSRF posture

- No explicit CSRF tokens on internal API routes
- `sameSite: lax` cookie provides baseline: cross-site POST won't carry the session cookie
- `form-action 'self'` in CSP prevents form action hijacking
- HN submission fetches HN's own `fnid` CSRF token server-side — correct

### Session management

- Session IDs: 32-byte randomBytes hex (256-bit entropy) — strong
- HN session IDs: 16-byte hex (128-bit) — acceptable
- No server-side session expiry beyond 30-day cookie maxAge
- No session rotation after login (existing session replaced — correct)
- File writes via synchronous readFileSync/writeFileSync — **race condition** under concurrent logins from same user

### Notable issues found

**1. X-Forwarded-For trust without proxy allowlist**  
`api/auth/login/route.ts:15-19` trusts the first value of `X-Forwarded-For` for rate limiting. If Nginx is misconfigured or bypassed, a client can spoof this header and evade the rate limiter. Should validate that request comes from a trusted proxy.

**2. No server-side URL validation in /api/submit**  
`url` receives an `<input type="url">` client-side only. Server accepts any string for `url`. HN will reject malformed values, but the app does not validate scheme (e.g., `javascript:`). Low risk since HN is the final processor, but defense-in-depth suggests a server-side URL parse + scheme check.

**3. story.url used directly as href without sanitization**  
`story/[id]/page.tsx:39` renders `<a href={story.url}>` where `story.url` comes raw from the HN Firebase API. HN could theoretically return a `javascript:` URL. Same pattern likely exists in StoryRow. DOMPurify sanitizes comment HTML but not story URLs used as href values. Should add `ALLOWED_URI_REGEXP` check or parse + validate scheme before rendering.

**4. No Nginx config in repo**  
Nginx is part of the security boundary (proxy, TLS termination, header forwarding) but is not version-controlled. A misconfigured Nginx (missing `proxy_set_header X-Real-IP`, or forwarding untrusted XFF) would affect rate-limit accuracy and request attribution.

**5. sessions.json unbounded growth**  
`upsertHNSession` deduplicates by username. `createIrrssueSession` replaces per HN session. But if many different usernames log in, `hn_sessions` array grows without bound. No eviction policy for stale sessions.

---

## 4. Application Review

_Static analysis of `src/`. Severity: CRITICAL / MEDIUM / LOW / INFO._

---

### 4.1 Rendered HTML from HN API

**[MEDIUM]** Three files render HTML from external sources using React's raw HTML insertion API:

| File | Line | Source |
|------|------|--------|
| `src/app/story/[id]/page.tsx` | 49 | `story.text` via Firebase |
| `src/app/story/[id]/CommentsThread.tsx` | 81 | `comment.text` via Firebase |
| `src/app/StoryRow.tsx` | 45 | `comment.text` via Firebase |

All three route through `sanitizeHNHtml()` first. That function runs DOMPurify (isomorphic-dompurify 3.12.0) with:
- Allowlisted tags: `p a i em b strong code pre br`
- Allowlisted attributes: `href rel target`
- URI allowlist: `https? | mailto | #` — blocks `javascript:` and `data:` schemes in anchor hrefs

Risk is low given the tight allowlist. The main caveat: isomorphic-dompurify uses JSDOM server-side and the browser DOM client-side — they are different code paths. Server-rendered and client-rendered outputs may differ for edge-case inputs. No unsafe tags or event attributes can currently pass through.

**No `eval`, dynamic function constructors, or raw `innerHTML` assignments were found anywhere in the codebase.**

---

### 4.2 Story URLs Used as Link Destinations Without Scheme Validation

**[MEDIUM]** `story.url` from the HN Firebase API and Algolia is placed directly into `href` attributes in three locations:

| File | Line |
|------|------|
| `src/app/story/[id]/page.tsx` | 39 |
| `src/app/StoryRow.tsx` | 140 |
| `src/app/saved/page.tsx` | 86 |

`getDomain()` parses the URL for display-only purposes but does not validate the scheme for use as a link destination. HN validates URLs at submission time, but the app fetches from the raw public API — a `javascript:` scheme value in the API response would execute in the user's browser on click.

React's JSX renderer does not strip `javascript:` scheme hrefs in production builds; it logs a warning in development only. A server-side scheme allowlist (`https?:|mailto:`) should be enforced at the data-fetch layer before the URL reaches any renderer.

---

### 4.3 SSRF / API Abuse

**[LOW — no SSRF surface]** All server-side fetches target hardcoded hostnames constructed from constants (`BASE`, `ALGOLIA`). No client-supplied URL is ever used as a fetch destination. The `[id]` path parameter is `parseInt`-ed and guards with `isNaN` + `notFound()` before use.

**[MEDIUM]** `POST /api/submit` has no app-level rate limit. An authenticated user can submit stories programmatically until HN's own throttle fires. The app surfaces HN's "submitting too fast" error but does not enforce its own limit.

**[LOW]** `GET /api/stories` is public with no rate limit. Each request proxies to Firebase or Algolia. Low risk for a personal app but worth noting.

---

### 4.4 Next.js Specifics

**No middleware.ts** — no Edge-layer interception. All auth lives inside individual Route Handlers. No misconfiguration risk.

**No CORS headers configured** — correct. Next.js defaults to blocking cross-origin API requests from other origins. No permissive `Access-Control-Allow-Origin` found anywhere.

**Route handler auth audit:**

| Endpoint | Auth check | Verdict |
|----------|-----------|---------|
| `POST /api/auth/login` | None (creates session) | Correct |
| `POST /api/auth/logout` | Soft (no 401 if missing) | Acceptable — idempotent |
| `GET /api/auth/me` | Returns null if no session | Correct |
| `POST /api/submit` | `getSessionUser()` → 401 | Correct |
| `GET /api/stories` | None (public) | Correct |

**[LOW]** `POST /api/submit` — `url` field not scheme-validated server-side; title length cap (`maxLength=80`) is browser-enforced only. HN is the terminal validator, but adding a server-side `new URL(url)` parse + scheme allowlist and title length check would be proper defense-in-depth.

**[LOW] CSP `script-src 'unsafe-inline'`** — required by Next.js App Router inline hydration. Prevents CSP from blocking injected inline scripts. Cannot be removed without nonce-based CSP via middleware. Acceptable limitation; no other viable injection vector found.

---

### 4.5 Headers & Transport

Current headers in `next.config.ts` (applied to `/:path*`):

| Header | Value | Status |
|--------|-------|--------|
| X-Frame-Options | DENY | ✓ Good |
| X-Content-Type-Options | nosniff | ✓ Good |
| Referrer-Policy | strict-origin-when-cross-origin | ✓ Good |
| Permissions-Policy | camera/mic/geo/cohort denied | ✓ Good |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | ✓ Good |
| X-Powered-By | Suppressed | ✓ Good |

**[LOW] Missing headers** — recommended additions to `securityHeaders` in `next.config.ts`:

| Header | Value | Reason |
|--------|-------|--------|
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates browsing context; mitigates Spectre |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Process isolation companion to COOP |
| `Cross-Origin-Resource-Policy` | `same-origin` | Prevents cross-origin embedding of this server's responses |

**[INFO]** No mixed content — all external URLs in source use `https://`. Zero `http://` references found in `src/`.

---

### 4.6 Client-Side Storage

**[INFO] localStorage** — single key `hn-bookmarks`, stores a JSON array of numeric HN story IDs. Not sensitive. Never transmitted to server. Session token is httpOnly cookie, inaccessible to JS.

**[INFO] sessionStorage** — not used anywhere.

---

### 4.7 Third-Party Origins

| Origin | Purpose | How loaded |
|--------|---------|-----------|
| `fonts.googleapis.com` | Google Fonts CSS | `next/font/google` in `layout.tsx` |
| `fonts.gstatic.com` | Font files | Via CSS from googleapis.com |

No analytics, tracking pixels, ad networks, or CDN-loaded scripts.

**[INFO]** `next/font/google` downloads font files at build time and self-hosts them from `/_next/static/`. At runtime, no request reaches Google domains — fonts are served from `self`. The `font-src https://fonts.gstatic.com` allowance in the CSP is therefore unnecessary in production (harmless, but could be tightened to `font-src 'self' data:`).

---

### 4.8 Summary

| # | Severity | Area | Finding |
|---|----------|------|---------|
| 1 | MEDIUM | XSS | Story URLs from HN API used as raw link destinations — no server-side scheme validation; React does not block `javascript:` scheme in production builds |
| 2 | MEDIUM | API abuse | `/api/submit` has no app-level rate limit; relies on HN's own throttle |
| 3 | MEDIUM | XSS (mitigated) | HN HTML rendered via DOMPurify allowlist — risk low, but depends on JSDOM/browser parity in isomorphic-dompurify |
| 4 | LOW | Headers | COOP / COEP / CORP headers absent |
| 5 | LOW | CSP | `script-src 'unsafe-inline'` required by Next.js — cannot be hardened without nonce-based CSP |
| 6 | LOW | Input validation | `/api/submit` does not validate URL scheme or title length server-side |
| 7 | LOW | Rate limiting | `/api/stories` unauthenticated, no rate limit |
| 8 | INFO | Rate limiting | X-Forwarded-For trusted without proxy allowlist (noted in §6) |
| 9 | INFO | CSP | `font-src fonts.gstatic.com` unnecessary — fonts self-hosted at runtime |
| 10 | INFO | Third-party | No third-party JS, analytics, or tracking found |

---

*End of application review. No source code modified.*

---

## 7. Dependency Security Audit

_Run: 2026-05-05_

### npm audit results

**Critical: 0 | High: 0 | Moderate: 2 | Low: 0**

| # | Package | Severity | CVE/Advisory | Description | Fix |
|---|---------|----------|-------------|-------------|-----|
| 1 | `postcss@8.4.31` (bundled inside `next`) | Moderate | GHSA-qx2v-qp2m-jg93 (CWE-79, CVSS 6.1) | PostCSS XSS via unescaped `</style>` in CSS Stringify output. Affects postcss `< 8.5.10`. Next.js 16.2.4 bundles 8.4.31 as a nested dep. Root `postcss@8.5.12` (used by Tailwind) is clean. | Wait for Next.js patch that upgrades its bundled postcss, or add an `overrides` entry: `"overrides": { "postcss": "^8.5.10" }` in package.json, then `npm install` |
| 2 | `next@16.2.4` | Moderate (indirect) | Same as above — reported as a vuln in next because of the bundled postcss | See above | Same resolution |

**Exploitability note:** The postcss XSS is in CSS stringification output — it fires when PostCSS processes attacker-controlled CSS and the output is embedded in an HTML `<style>` block. This app does not accept user CSS input; PostCSS runs at build time only. **Runtime exploitability is very low** for this specific app. Still worth fixing for supply-chain hygiene.

**Suggested fix command:**
```json
// Add to package.json before "dependencies":
"overrides": {
  "postcss": ">=8.5.10"
}
```
Then run:
```sh
npm install
npm audit  # should be clean
```

---

### Outdated packages

`npm outdated` as of 2026-05-05:

| Package | Current | Wanted | Latest | Notes |
|---------|---------|--------|--------|-------|
| `@types/node` | 20.19.39 | 20.19.39 | 25.6.0 | Major version gap; `^20` range won't auto-update. Harmless — types only. |
| `eslint` | 9.39.4 | 9.39.4 | 10.3.0 | Major bump; `^9` won't auto-update. Lint-only; no runtime impact. |
| `react` | 19.2.4 | 19.2.4 | 19.2.5 | Patch release available. |
| `react-dom` | 19.2.4 | 19.2.4 | 19.2.5 | Patch release available. |
| `typescript` | 5.9.3 | 5.9.3 | 6.0.3 | Major bump; `^5` won't auto-update. Build-only; no runtime impact. |

**To update patch releases:**
```sh
npm update react react-dom
```
Major bumps (eslint 10, typescript 6, @types/node 25) require manual testing — no action needed urgently.

---

### Package version pinning

| Package | Specifier | Assessment |
|---------|-----------|------------|
| `next` | `16.2.4` (exact) | Good — pinned |
| `react` | `19.2.4` (exact) | Good — pinned |
| `react-dom` | `19.2.4` (exact) | Good — pinned |
| `eslint-config-next` | `16.2.4` (exact) | Good — pinned, matches next version |
| `isomorphic-dompurify` | `^3.12.0` | Range — lock file fixes the installed version (3.12.0), so installs are reproducible as long as lock is committed |
| `@tailwindcss/postcss` | `^4` | Range — only major version pinned; minor/patch can drift |
| `@types/node` | `^20` | Range — only major pinned |
| `@types/react` | `^19` | Range |
| `@types/react-dom` | `^19` | Range |
| `eslint` | `^9` | Range |
| `tailwindcss` | `^4` | Range |
| `typescript` | `^5` | Range |

Range specifiers on dev/type packages are low-risk because `package-lock.json` is committed and CI/production should use `npm ci`. **No accidental packages found.**

---

### Suspicious package check

- **Typosquatting:** No suspicious names found. All packages are well-known (`next`, `react`, `tailwindcss`, `eslint`, `typescript`, `isomorphic-dompurify`).
- **Low-download packages:** `isomorphic-dompurify` is the only less-prominent package. It is the official DOMPurify isomorphic wrapper (npm: ~800k weekly downloads as of audit date), maintained by the DOMPurify org. Not suspicious.
- **Accidental installs:** No unrecognized packages in `package.json`.
- **Non-npm registry sources:** 0 packages resolved from non-`registry.npmjs.org` URLs.
- **Postinstall scripts in lock file:** 0 packages with `postinstall`, `install`, or `preinstall` scripts found in `package-lock.json`.

---

### Lock file status

| Check | Result |
|-------|--------|
| `package-lock.json` committed to git | YES |
| lockfileVersion | 3 (npm 7+) |
| All `package.json` deps present in lock | YES — 0 missing |
| All resolutions from official npm registry | YES |

**Recommendation:** Use `npm ci` (not `npm install`) on the homeserver for deployments. `npm ci` enforces the lock file exactly and fails if it diverges from `package.json`.

---

### PostCSS vulnerability: postcss instances in tree

```
node_modules/postcss                     8.5.12  (clean — used by Tailwind)
node_modules/next/node_modules/postcss   8.4.31  (VULNERABLE — bundled by Next.js)
node_modules/@tailwindcss/postcss        4.2.4   (postcss plugin, not postcss itself)
```

The vulnerable instance lives in Next.js's own `node_modules` subtree. An `overrides` entry in `package.json` would force npm to hoist 8.5.10+ into that slot.

*End of dependency audit section.*

---

## 5. Ship Checklist

_Priority order: block launch → fix within 48h → harden later._

---

### MUST-FIX before public launch

These are actionable, low-effort, and address real attack surface. Nothing here requires architectural changes.

---

#### M1 — Sanitize story URLs before use as href

**Why:** `story.url` from Firebase/Algolia placed raw into `href` in three files. React 19 production builds do not strip `javascript:` scheme from anchor hrefs. If HN's API ever returns a malformed or injected URL, it executes on click.

**Files to change:** `src/app/hn.ts`, then all three call sites update automatically.

Add a URL sanitizer helper to `hn.ts` immediately after `getDomain`:

```ts
// src/app/hn.ts  — add after getDomain()
const SAFE_SCHEMES = /^https?:|^mailto:/i;

export function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return SAFE_SCHEMES.test(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
```

Then in every caller replace `story.url` with `sanitizeUrl(story.url)`:

```ts
// src/app/story/[id]/page.tsx  line 38-40
// BEFORE:
{story.url ? (
  <a href={story.url} target="_blank" rel="noopener noreferrer">

// AFTER:
{sanitizeUrl(story.url) ? (
  <a href={sanitizeUrl(story.url)!} target="_blank" rel="noopener noreferrer">
```

```ts
// src/app/StoryRow.tsx  line 140
// BEFORE:
href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}

// AFTER:
href={sanitizeUrl(story.url) ?? `https://news.ycombinator.com/item?id=${story.id}`}
```

```ts
// src/app/saved/page.tsx  line 86
// BEFORE:
href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}

// AFTER:
href={sanitizeUrl(story.url) ?? `https://news.ycombinator.com/item?id=${story.id}`}
```

Import `sanitizeUrl` in each file alongside the existing `getDomain` import.

---

#### M2 — Add missing COOP / COEP / CORP headers

**Why:** Three standard isolation headers absent. COOP/COEP enable cross-origin process isolation (required if you ever use `SharedArrayBuffer`; also mitigates Spectre-class side-channel reads on modern browsers). CORP prevents other origins from embedding your server's responses.

**File:** `next.config.ts` — add three entries to `securityHeaders`:

```ts
// next.config.ts — replace the securityHeaders array:
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data:",
      "connect-src 'self' https://hacker-news.firebaseio.com https://hn.algolia.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];
```

**Changes vs current:**
- Added `Cross-Origin-Opener-Policy: same-origin`
- Added `Cross-Origin-Embedder-Policy: require-corp`
- Added `Cross-Origin-Resource-Policy: same-origin`
- `style-src`: removed `https://fonts.googleapis.com` — not needed at runtime (Next.js font CSS is inlined)
- `font-src`: removed `https://fonts.gstatic.com` — not needed at runtime (fonts self-hosted in `/_next/static/`)

**Risk:** `COEP: require-corp` can break cross-origin iframes or resources that don't send `Cross-Origin-Resource-Policy` themselves. This app has no iframes and no cross-origin images, so it is safe. If a future change embeds external content, revisit.

---

#### M3 — Validate URL scheme server-side in `/api/submit`

**Why:** Client-side `<input type="url">` is not a security control. Server should refuse non-http(s) URLs before forwarding to HN.

```ts
// src/app/api/submit/route.ts — add after the existing trim/empty checks, before the hnCookie fetch:

if (url) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid URL" }, { status: 400 });
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return NextResponse.json({ ok: false, error: "URL must be http or https" }, { status: 400 });
  }
}
if (title.length > 80) {
  return NextResponse.json({ ok: false, error: "Title must be 80 characters or fewer" }, { status: 400 });
}
```

Insert this block at line 33 (after the `if (url && text)` check, before the `getValidHNCookie` call).

---

#### M4 — Apply postcss override to clear `npm audit`

**Why:** `next@16.2.4` bundles `postcss@8.4.31` (GHSA-qx2v-qp2m-jg93, CVSS 6.1). Runtime exploitability is low for this app (no user CSS input, PostCSS build-time only), but the advisory will show as moderate in any automated scan and is trivially fixed.

```json
// package.json — add before "dependencies":
"overrides": {
  "postcss": ">=8.5.10"
},
```

Then:

```sh
npm install
npm audit   # expect 0 findings
```

---

### SHOULD-FIX within 48h post-launch

Lower urgency but worth closing before traffic grows.

---

#### S1 — Rate-limit `/api/submit`

`checkRateLimit` already exists in `src/lib/rateLimit.ts`. Wire it into the submit handler with a separate, tighter limit (e.g., 3 submissions / 10 min per IP):

```ts
// src/lib/rateLimit.ts — add a second exported function:

const SUBMIT_WINDOW_MS = 10 * 60 * 1000;
const SUBMIT_MAX = 3;
const submitStore = new Map<string, Entry>();

export function checkSubmitRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = submitStore.get(ip);
  if (!entry || now - entry.window_start > SUBMIT_WINDOW_MS) {
    submitStore.set(ip, { count: 1, window_start: now });
    return { allowed: true };
  }
  if (entry.count >= SUBMIT_MAX) return { allowed: false };
  entry.count++;
  return { allowed: true };
}
```

```ts
// src/app/api/submit/route.ts — add near top of POST handler, after proto check:
import { checkSubmitRateLimit } from "@/lib/rateLimit";

const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
  req.headers.get("x-real-ip") ??
  "unknown";
if (!checkSubmitRateLimit(ip).allowed) {
  return NextResponse.json(
    { ok: false, error: "Too many submissions. Try again in 10 minutes." },
    { status: 429 }
  );
}
```

---

#### S2 — Version-control the Nginx config

Nginx is part of the security boundary (TLS termination, XFF forwarding, proxy headers) but lives only on the server. A misconfigured Nginx breaks rate-limit IP attribution.

Minimum required config block:

```nginx
# /etc/nginx/sites-available/news.irrssue.com
server {
    listen 443 ssl http2;
    server_name news.irrssue.com;

    ssl_certificate     /etc/letsencrypt/live/news.irrssue.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/news.irrssue.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Forward only the connecting IP — do not trust client-supplied XFF
    proxy_set_header X-Real-IP        $remote_addr;
    proxy_set_header X-Forwarded-For  $remote_addr;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Host             $host;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}

server {
    listen 80;
    server_name news.irrssue.com;
    return 301 https://$host$request_uri;
}
```

Key: `proxy_set_header X-Forwarded-For $remote_addr` — this overwrites any client-supplied XFF with the actual connecting IP, preventing rate-limit bypass.

Commit a copy of this file at `nginx/news.irrssue.com.conf` in the repo (strip actual cert paths to paths only).

---

#### S3 — Add server-side session expiry

Currently sessions expire only when the browser cookie expires (30-day `maxAge`). The server-side `hn_sessions` and `irrssue_sessions` records never expire. Add a cleanup pass in `db.ts`:

```ts
// src/lib/db.ts — add after the save() function:
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function pruneExpiredSessions(): void {
  const db = load();
  const cutoff = new Date(Date.now() - SESSION_TTL_MS).toISOString();
  db.hn_sessions = db.hn_sessions.filter(s => s.last_used_at > cutoff);
  const validHNIds = new Set(db.hn_sessions.map(s => s.id));
  db.irrssue_sessions = db.irrssue_sessions.filter(s => validHNIds.has(s.hn_session_id));
  save(db);
}
```

Call `pruneExpiredSessions()` inside `load()` before returning, or on a startup hook. This also caps `sessions.json` growth (finding §6.5 in audit).

---

### NICE-TO-HAVE hardening

For a future pass — none of these block launch.

---

#### N1 — Nonce-based CSP (eliminates `unsafe-inline`)

Next.js 13+ supports nonce-based CSP via `src/middleware.ts`. Requires generating a nonce per request, injecting it into the CSP header and the `<script>` tags via `next/headers`. Detailed guide: Next.js docs → "Content Security Policy". This is the only way to remove `'unsafe-inline'` from `script-src` while keeping App Router hydration working.

Effort: ~2h. Impact: closes the last meaningful CSP gap.

---

#### N2 — Upgrade to SQLite for session storage

The flat JSON file has a synchronous read-modify-write loop with no locking. Under concurrent login requests from the same user, writes can race and corrupt the file. For a personal app the probability is very low, but SQLite (via `better-sqlite3`) provides file-level locking with zero operational overhead and no additional service.

---

#### N3 — `npm ci` on deploy + lock file integrity check

In your deploy script or PM2 ecosystem file, replace `npm install` with `npm ci`. Add a pre-start check:

```sh
# deploy.sh
set -e
git pull origin main
npm ci                   # enforces lock file exactly
npm run build
pm2 restart news
```

---

#### N4 — Tighten CSP `font-src` and `style-src`

`next/font/google` self-hosts fonts at build time. At runtime, `fonts.googleapis.com` and `fonts.gstatic.com` are never contacted. The current CSP allows them unnecessarily. Already captured in M2 diff — remove `https://fonts.googleapis.com` from `style-src` and `https://fonts.gstatic.com` from `font-src`.

---

### Rollback plan

If a header or config change breaks the site post-deploy:

```sh
# Revert last commit (preserves history)
git revert HEAD --no-edit
git push origin main

# Rebuild and restart
npm ci
npm run build
pm2 restart news
```

**What to check first if something breaks after M2 (headers):**
- `COEP: require-corp` is the most likely breakage. It causes browsers to block cross-origin resources that don't send `Cross-Origin-Resource-Policy`. Check browser DevTools → Network tab for blocked requests. If anything breaks, remove just COEP from `next.config.ts` first.
- Font loading: if fonts go missing, it means `next/font/google` did not self-host them (check `.next/static/media/` for `.woff2` files). Re-add `font-src https://fonts.gstatic.com` temporarily.

**Checkpoint before launch:**

```sh
# Verify headers live (run from any machine with curl):
curl -sI https://news.irrssue.com | grep -iE "content-security|x-frame|cross-origin|strict-transport"
```

Expected output should include all six security headers. If any are missing, Nginx is stripping them — check `proxy_pass` config.

---

### First 48h monitoring (homeserver + public exposure)

This app is not on Vercel or Cloudflare — it's on a personal Ubuntu server. Monitoring is manual. Suggested checklist:

**Server-side (SSH in and check):**

```sh
# PM2 process health
pm2 status
pm2 logs news --lines 200 | grep -iE "error|fail|uncaught|unhandled"

# Nginx access log — look for scanner patterns
tail -f /var/log/nginx/access.log | grep -vE "GET / |GET /_next"

# Abnormal POST volume to auth endpoint (brute force probe)
grep "POST /api/auth/login" /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -20

# Disk — sessions.json size (should stay small for a personal app)
du -sh /path/to/.data/sessions.json

# Rate limit hits (in app logs)
pm2 logs news --lines 500 | grep "429"
```

**What to watch for:**

| Signal | What it means | Action |
|--------|--------------|--------|
| Repeated 429s on `/api/auth/login` from same IP | Credential stuffing probe | IP is being blocked by rate limiter — good. If volume is high, add Nginx `limit_req` as second layer |
| High volume GETs to `/api/stories` | Scraper | Add Nginx `limit_req` on that location |
| PM2 crashes / restarts | Unhandled exception, memory leak, or OOM | `pm2 logs news` for stack trace |
| `sessions.json` growing fast | Many different users logging in | Normal if the app goes viral; run `pruneExpiredSessions()` manually (S3) |
| Any 5xx spike | Application error | Check PM2 logs immediately |

**Browser check on launch day:**

Open DevTools → Network on `news.irrssue.com`. Verify:
- No mixed-content warnings
- No COEP-blocked resources (Console tab)
- Response headers on any page include CSP, HSTS, COOP, CORP

---

*End of ship checklist. No source code modified.*

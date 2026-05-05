@AGENTS.md

# minimal-hackernews

Personal HN-style reader. Dark, minimal, typographic.

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS
- Fonts: Playfair Display (title), IBM Plex Mono (numbers/meta), Inter (body)

## Design system

Dark theme only. All colors via CSS vars in `globals.css`.

**Rule: keep this section in sync with `globals.css`.** Every design change — token value, layout grid, spacing, font size, new token — must update CLAUDE.md in same commit. Token table, layout block, principles all reflect current state. Stale design docs forbidden.

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0b0d0f` | Page background (deep dark canvas) |
| `--bg-2` | `#141414` | Raised surface (composer, code) |
| `--bg-3` | `#1a1a1a` | Active nav pill, kbd |
| `--ink` | `#ededec` | Primary text |
| `--ink-2` | `#a8a8a6` | Secondary text |
| `--ink-3` | `#6e6e6c` | Faint / metadata |
| `--ink-4` | `#4a4a48` | Disabled / dot separators |
| `--rule` | `#1e1e1c` | Row dividers, borders |
| `--rule-2` | `#262624` | Stronger dividers |
| `--chip` | `#1d1d1b` | Filter chip background |
| `--op` | `#d9b27a` | OP / accent (warm) |
| `--hot` | `#d9b27a` | Live indicator |

## Layout: "B — Points first"

Three-column story row: `76px points | 1fr title+meta | 56px comments`

- Points: large mono number, dim `points · Xh` below
- Title: Inter 14.5px, hover to #fff
- Meta: mono 11px — `domain · by username`
- Comments: right-aligned mono number + "comments" label

## Dev

```
npm run dev   # localhost:3000
npm run build
npm run lint
```

## Data

Live data from HN Firebase API (`https://hacker-news.firebaseio.com/v0`). Top 30 stories, revalidated every 5 minutes. Tags auto-assigned by keyword matching in `src/app/hn.ts`.

## Git workflow
- Stage all relevant changes and push directly to `main`. No PRs needed.
- Write commit messages like an experienced engineer. Follow this format exactly:

```
<type>(<scope>): <short imperative summary, ≤60 chars>

<body — 2-4 sentences max. Explain WHY the change was made, what problem
it solves, and any non-obvious side effects or trade-offs. Be specific
about the behaviour before vs. after when it helps the reader.>
```

**type**: `feat` | `fix` | `refactor` | `style` | `perf` | `chore`  
**scope**: the component, module, or area affected (e.g. `Navbar`, `StoryList`, `api`, `layout`)

Examples of good commit messages:
```
feat(StoryList): paginate stories in batches of 30

Previously all top stories were fetched in a single waterfall request,
which caused a 2–3 s blank screen on slow connections. Stories now load
in the first batch immediately and subsequent pages are fetched on scroll,
cutting initial paint time by ~60%.
```
```
fix(Navbar): prevent layout shift on mobile viewport resize

The nav container used a fixed pixel width that overflowed below 480 px,
pushing the title off-screen. Switched to a fluid max-width with clamp()
so the layout adapts without a JS resize listener.
```
- Never use generic messages like "auto: update Navbar.tsx" or "update files".
- **Describe the change, not the file.** `auto: update InfiniteList.tsx` is forbidden — it tells the reader nothing. Subject must name the actual change in plain English (what behaviour, layout, or fix shipped). If you can't describe it in one short sentence, the commit is too big — split it.
- Readability beats cleverness. A teammate skimming `git log` six months from now should understand each commit without opening the diff. Prefer concrete nouns ("paginate stories", "fix mobile overflow", "swap bg to GitHub dark") over vague verbs ("update", "tweak", "adjust").
- Body is optional for trivial style/copy tweaks but required for any logic, layout, or dependency change.

## Deployment target

- Domain: `news.irrssue.com` (subdomain of owned domain `irrssue.com`)
- Host: personal Ubuntu homeserver
- Stack: Next.js SSR via `npm start`, Nginx reverse proxy, Certbot SSL
- DNS: point `news.irrssue.com` A record to homeserver public IP
- PM2 recommended for process management (`pm2 start npm -- start`)

## Principles

- No external component libraries
- Inline styles for component-level styling (avoids class noise)
- Tailwind for utility resets only
- No animations beyond quick color transitions

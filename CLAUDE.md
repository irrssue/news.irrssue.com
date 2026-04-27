@AGENTS.md

# minimal-hackernews

Personal HN-style reader. Dark, minimal, typographic.

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS
- Fonts: Playfair Display (title), IBM Plex Mono (numbers/meta), Inter (body)

## Design system

Dark theme only. All colors via CSS vars in `globals.css`.

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0c0c0c` | Page background |
| `--border` | `#1e1e1e` | Row dividers |
| `--text` | `#e2e2e2` | Primary text |
| `--text-dim` | `#888` | Secondary |
| `--text-faint` | `#4a4a4a` | Metadata |

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

```
git add <files>
git commit -m "message"
git push
```

Or use `/commit-push-pr` skill in Claude Code to commit, push, and open PR in one step.

## Principles

- No external component libraries
- Inline styles for component-level styling (avoids class noise)
- Tailwind for utility resets only
- No animations beyond quick color transitions

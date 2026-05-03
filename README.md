# Minimal Hacker News Reader

Personal feed reader for **Hacker News** — stripped down, fast, dark theme.

**[📖 Read the live site →](https://news.irrssue.com)**

---

## What is this?

A clean, minimal interface to browse the top tech stories from Hacker News. No distractions, no ads, no clutter — just stories and conversation.

### Features

- **Live feed**: Shows the 30 hottest stories updated every 5 minutes
- **Dark theme**: Easy on the eyes
- **Readable layout**: Large story titles, author info, comment count at a glance
- **Auto-categorized**: Stories tagged by type (AI, crypto, startups, etc.) based on keywords
- **Comments inline**: Click any story to expand discussion count and dive into comments

---

## For developers

### Tech stack

- **Next.js 16** with TypeScript
- **Tailwind CSS** for utility styling
- **Custom fonts**: Playfair Display (headlines), IBM Plex Mono (numbers), Inter (body)
- **Real-time data**: Connected to Hacker News Firebase API

### Quick start

```bash
npm install
npm run dev        # Start local server at http://localhost:3000
npm run build      # Build for production
npm run lint       # Check code quality
```

### Deployment

Runs on personal Ubuntu homeserver with Nginx reverse proxy + SSL.

- Domain: `news.irrssue.com`
- Process manager: PM2
- Live at: https://news.irrssue.com

### Bookmarks

Click the bookmark icon on any story to save it locally. Saved stories live in your browser's localStorage — nothing leaves your device.

---

## Design principles

- No component libraries — hand-crafted CSS
- Fast and minimal
- Dark only (no light mode)
- Keyboard & mouse friendly

---

Built with [Next.js](https://nextjs.org).




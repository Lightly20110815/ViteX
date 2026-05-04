# ViteX

> Personal Twitter-style timeline · Markdown-driven · Pure frontend static site

![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## Demo

Visit the live site at **https://vitex-one.vercel.app** (or deploy your own).

## Features

- **Markdown-driven** — Write tweets as `.md` files, push to Git, timeline updates
- **Glassmorphism UI** — Apple Frosted Glass style with frosted glass cards and sidebar
- **Bing Daily Background** — Beautiful wallpaper refreshed daily from Bing
- **Auto Dark/Light Mode** — Follows your system preference automatically
- **3D Card Effects** — Interactive hover with perspective transforms and cursor glow
- **Syntax Highlighting** — Code blocks with highlight.js support
- **Build-time Rendering** — All tweets pre-rendered at build time via custom Vite plugin
- **Pure Vanilla TS** — No framework, just TypeScript with DOM factory functions
- **Responsive** — Works on desktop and mobile

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Writing Tweets

Create `.md` files under `content/tweets/YYYY/MM/`:

```markdown
---
mood: 😊
created: 2026-05-02T12:00:00+08:00
---

# Hello, ViteX!

This is my first tweet. **ViteX** is a Markdown-driven timeline.

## Features

- Markdown writing
- Glassmorphism design

> Write Markdown, push to Git, timeline goes live.
```

### Frontmatter Fields

| Field   | Type     | Description           |
|---------|----------|-----------------------|
| `mood`  | `string` | Emoji mood (e.g., `😊`) |
| `created` | `string` | ISO 8601 creation time |

## Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

## Architecture

```
vitex/
├── content/tweets/     # Tweet Markdown files (YYYY/MM/*.md)
├── src/
│   ├── main.ts        # Entry point, rendering, interactions
│   ├── data/
│   │   ├── profile.ts  # User profile data
│   │   └── tweets.ts   # Build-time tweet data
│   ├── components/
│   │   ├── Profile.ts  # Sidebar profile renderer
│   │   ├── TweetCard.ts # Tweet card renderer
│   │   └── Timeline.ts  # Timeline container renderer
│   ├── utils/
│   │   ├── marked-config.ts # Markdown parser config
│   │   └── time.ts      # Time formatting utilities
│   ├── types/
│   │   ├── TweetData.ts
│   │   └── markdown.d.ts
│   └── styles.css      # Apple Frosted Glass styles
├── index.html
├── package.json
└── vite.config.ts
```

## Tech Stack

| Layer         | Choice                          |
|---------------|---------------------------------|
| Build Tool    | Vite 8                          |
| Language      | TypeScript 5.8                  |
| Markdown      | marked + gray-matter            |
| Styling       | Pico.css + custom CSS           |
| Syntax HL     | highlight.js                    |
| Time Utils    | dayjs                           |
| Deployment    | Vercel                          |

## Commands

| Command         | Action                    |
|-----------------|---------------------------|
| `npm run dev`   | Start Vite dev server     |
| `npm run build` | Production build          |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build and push to Vercel |

## License

MIT · © Sy

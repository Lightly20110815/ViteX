# Architecture Research

**Domain:** Markdown-driven static personal timeline (Twitter-style)
**Researched:** 2026-05-02
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BUILD TIME (Vite + Node.js)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  content/tweets/2026/05/my-post.md                                   │
│  ┌─────────────────────────────┐                                     │
│  │ ---                         │    ┌──────────────────┐            │
│  │ mood: 😊                    │───▶│ gray-matter      │────────┐   │
│  │ created: 2026-05-02T10:00Z  │    │ (frontmatter)    │        │   │
│  │ ---                         │    └──────────────────┘        │   │
│  │ Hello, world!               │                                 │   │
│  └─────────────────────────────┘                                 │   │
│                                                                  │   │
│                          ┌──────────────────┐                    │   │
│                          │ marked           │◀───────────────────┘   │
│                          │ (Markdown→HTML)  │                        │
│                          └────────┬─────────┘                        │
│                                   │                                   │
│                                   ▼                                   │
│                    ┌──────────────────────────┐                      │
│                    │ Custom Vite Plugin        │                      │
│                    │ transform(): .md → module │                      │
│                    │ exports { meta, html }    │                      │
│                    └──────────┬───────────────┘                      │
│                               │                                       │
├───────────────────────────────┼───────────────────────────────────────┤
│                        RUNTIME (Browser)                              │
├───────────────────────────────┼───────────────────────────────────────┤
│                               ▼                                       │
│                    ┌──────────────────────────┐                      │
│                    │ import.meta.glob('.md',   │                      │
│                    │   { eager: true })        │                      │
│                    │ → TweetData[]             │                      │
│                    └──────────┬───────────────┘                      │
│                               │                                       │
│                               ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                        main.ts                                 │    │
│  │  ┌─────────────────┐  ┌──────────────────────────────────┐   │    │
│  │  │ renderProfile()  │  │ renderTimeline(tweets: TweetData[])│   │    │
│  │  │ → #profile       │  │ → #timeline                       │   │    │
│  │  └─────────────────┘  └──────────────┬───────────────────┘   │    │
│  │                                      │                        │    │
│  │                          ┌───────────▼──────────────────┐    │    │
│  │                          │ TweetCard(tweet) → HTMLElement│    │    │
│  │                          │  ├─ TweetHeader               │    │    │
│  │                          │  ├─ TweetBody  (innerHTML)    │    │    │
│  │                          │  └─ TweetFooter               │    │    │
│  │                          └──────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `content/tweets/` | Source of truth: Markdown files organized by year/month | Filesystem, git-versioned |
| `gray-matter` | Parse YAML frontmatter from `.md` files into JS objects | npm package, runs in Vite plugin transform hook |
| `marked` | Convert Markdown body to HTML string | npm package, runs in Vite plugin transform hook |
| Custom Vite Plugin | Intercept `.md` imports, parse frontmatter + render HTML, export as ES module | `transform()` hook in `vite.config.ts` |
| `import.meta.glob` | Collect all tweet modules at build time into a typed array | Vite built-in, `{ eager: true }` |
| `data/profile.ts` | Static profile data (username, bio, avatar URL, background URL) | TypeScript const export, imported directly |
| `main.ts` | Entry point: sort tweets, render profile + timeline into DOM | Vanilla TypeScript, no framework |
| `TweetCard()` | Factory function: creates a single tweet DOM element from TweetData | Pure function, returns `HTMLElement` |
| `styles.css` | All styling with CSS custom properties for light/dark | `prefers-color-scheme` media query |

## Recommended Project Structure

```
vitex/
├── content/
│   └── tweets/
│       └── YYYY/
│           └── MM/
│               └── slug.md              # One file per tweet
├── public/
│   └── favicon.ico
├── scripts/
│   └── new-tweet.ts                     # Interactive tweet creation script
├── src/
│   ├── components/
│   │   ├── TweetCard.ts                 # Single tweet DOM element factory
│   │   ├── Timeline.ts                  # Timeline container + rendering
│   │   └── Profile.ts                   # Profile section DOM element factory
│   ├── data/
│   │   ├── tweets.ts                    # import.meta.glob → sorted TweetData[]
│   │   └── profile.ts                   # Static profile constants
│   ├── types/
│   │   ├── TweetData.ts                 # TweetData interface
│   │   └── markdown.d.ts                # .md module type declarations
│   ├── utils/
│   │   ├── time.ts                      # Relative time formatting
│   │   └── marked-config.ts             # marked renderer configuration
│   ├── main.ts                          # Entry point: mount everything
│   └── styles.css                       # All styles, light/dark via prefers-color-scheme
├── index.html                           # Shell HTML: #profile + #timeline containers
├── vite.config.ts                       # Vite config with custom Markdown plugin
├── tsconfig.json
├── package.json
└── vercel.json                          # Vercel static site deployment config
```

### Structure Rationale

- **`content/tweets/YYYY/MM/slug.md`:** Year/month hierarchy keeps files browsable as tweet count grows. The filename slug becomes the URL fragment. Two-digit months (01-12) ensure correct filesystem sorting. This pattern is used by Jekyll, Astro-Paper, and Hugo for content at scale.
- **`src/components/`:** Each component is a pure function that takes data and returns an `HTMLElement`. No framework means no virtual DOM, no reactivity system -- just `document.createElement` and `innerHTML`. This is appropriate for a display-only timeline where content never changes after load.
- **`src/data/tweets.ts`:** Single module that uses `import.meta.glob` to collect all tweets. This is the bridge between the build pipeline and the rendering layer. It transforms raw module imports into a sorted, typed array ready for rendering.
- **`src/types/`:** Separate from components because types are consumed by both the build pipeline (Vite plugin) and the runtime. The `markdown.d.ts` file tells TypeScript what `.md` imports resolve to.
- **`scripts/`:** Separate from `src/` because tweet creation scripts run in Node.js (interactive terminal), not in the browser. They are not bundled by Vite.
- **`public/`:** Only for truly static assets that need exact URL paths (favicon). Profile images and backgrounds are referenced by URL in `profile.ts`, not stored locally.
- **`index.html` at root:** Vite's required entry point. Contains minimal DOM shell (`<div id="profile">`, `<div id="timeline">`) that `main.ts` populates.

## Architectural Patterns

### Pattern 1: Build-Time Content Pipeline (Vite Plugin + glob)

**What:** All Markdown processing happens in a custom Vite plugin's `transform()` hook. The plugin intercepts `.md` imports, parses frontmatter with `gray-matter`, renders Markdown to HTML with `marked`, and exports a JS module with `{ meta, html }`. At runtime, `import.meta.glob('./content/**/*.md', { eager: true })` collects all modules into a single array with zero filesystem access.

**When to use:** Any Vite project where content lives in local files and must be available synchronously at page load. This is the standard pattern for blogs, documentation sites, and content-driven static sites built with Vite.

**Trade-offs:**
- Pro: Zero runtime dependencies for content loading. No `fs`, no `fetch`, no API calls.
- Pro: Full HMR during development -- edit a `.md` file, see changes instantly.
- Pro: TypeScript declarations give full type safety across the `.md` import boundary.
- Pro: Everything is bundled into static assets -- works on any static host (Vercel, GitHub Pages, Netlify).
- Con: All tweet content is bundled into the JS payload. For thousands of long posts, this could become large (mitigated by Markdown's compactness -- even 1000 tweets at ~500 bytes each is only ~500KB).
- Con: Adding a new tweet requires a rebuild + redeploy (acceptable: git push triggers Vercel deploy).
- Con: The Vite plugin runs in Node.js, so it cannot use browser APIs. This is fine for our tools (gray-matter, marked).

**Example:**
```typescript
// vite.config.ts -- the custom plugin
import grayMatter from 'gray-matter';
import { marked } from 'marked';

function markdownPlugin() {
  return {
    name: 'vitex-markdown',
    transform(code: string, id: string) {
      if (!id.endsWith('.md')) return;
      const { data: meta, content } = grayMatter(code);
      const html = marked.parse(content);
      return {
        code: `export const meta = ${JSON.stringify(meta)};
export const html = ${JSON.stringify(html)};`,
        map: null,
      };
    },
  };
}
```

```typescript
// src/data/tweets.ts -- the glob collection
export interface TweetMeta {
  mood: string;
  created: string;   // ISO 8601
  slug?: string;      // derived from filename, optional in frontmatter
}

export interface TweetData {
  meta: TweetMeta;
  html: string;
  slug: string;
}

const modules = import.meta.glob<{ meta: TweetMeta; html: string }>(
  '/content/tweets/**/*.md',
  { eager: true }
);

export const tweets: TweetData[] = Object.entries(modules)
  .map(([path, mod]) => ({
    ...mod,
    slug: path.split('/').pop()!.replace('.md', ''),
  }))
  .sort((a, b) =>
    new Date(b.meta.created).getTime() - new Date(a.meta.created).getTime()
  );
```

### Pattern 2: DOM Factory Functions (No Framework Components)

**What:** Each UI piece is a pure TypeScript function that takes data and returns an `HTMLElement`. Functions compose: `Timeline(tweets)` calls `TweetCard(tweet)` for each tweet. No virtual DOM, no reactivity, no state management library.

**When to use:** Static display pages where content is known at build time and never changes after render. The timeline is append-only (new tweets appear on next deploy), there's no user interaction beyond scrolling.

**Trade-offs:**
- Pro: Zero KB framework overhead. The entire JS bundle is application logic only.
- Pro: No build-step JSX transformation needed. TypeScript compiles directly to JS.
- Pro: Debugging is straightforward -- inspect real DOM nodes, not virtual DOM abstractions.
- Pro: Full control over DOM structure, class names, and attributes.
- Con: No declarative templating. Complex conditional rendering requires imperative code.
- Con: No built-in reactivity. If interactive features are added later (likes, comments), a framework may become warranted.
- Con: Re-rendering the entire timeline on data change requires manual DOM diffing or full clear-and-rebuild.

**Example:**
```typescript
// src/components/TweetCard.ts
export function TweetCard(tweet: TweetData): HTMLElement {
  const article = document.createElement('article');
  article.className = 'tweet-card';
  article.id = `tweet-${tweet.slug}`;

  article.innerHTML = `
    <header class="tweet-header">
      <span class="tweet-username">Sy</span>
      <span class="tweet-mood">${escapeHtml(tweet.meta.mood)}</span>
      <time class="tweet-time" datetime="${tweet.meta.created}">
        ${relativeTime(tweet.meta.created)}
      </time>
    </header>
    <div class="tweet-body">${tweet.html}</div>
    <footer class="tweet-footer">
      <a href="#tweet-${tweet.slug}" class="tweet-permalink">Permalink</a>
    </footer>
  `;

  return article;
}
```

### Pattern 3: Static Data as TypeScript Constants

**What:** Profile information, site config, and other non-content data lives in TypeScript files as exported `const` objects. These are imported directly and bundled into the JS output at build time.

**When to use:** Data that changes infrequently (bio, avatar URL, site name) and is small enough to bundle. This avoids runtime `fetch()` calls and keeps the site truly static.

**Trade-offs:**
- Pro: Type-safe -- TypeScript checks the shape of profile data at compile time.
- Pro: Zero latency -- data is in the JS bundle, no network request.
- Pro: Changes are versioned in git alongside code.
- Con: Changing profile data requires a rebuild + redeploy.
- Con: Not suitable for large datasets (use the content pipeline for that).

## Data Flow

### Build-Time Flow

```
Developer writes tweet Markdown
    │
    ▼
content/tweets/2026/05/hello-world.md
    │
    ▼
Vite dev server or build starts
    │
    ▼
import.meta.glob discovers all .md files under content/tweets/
    │
    ▼
For each .md file:
    │
    ├── gray-matter extracts frontmatter → { mood, created, ... }
    ├── marked converts Markdown body → HTML string
    ├── Plugin exports: export const meta = {...}; export const html = "...";
    │
    ▼
All modules bundled into JS chunks
    │
    ▼
Deployed to Vercel as static files (HTML + JS + CSS)
```

### Runtime Flow (Page Load)

```
User visits site
    │
    ▼
index.html loads → <div id="profile">, <div id="timeline">
    │
    ▼
main.ts executes:
    │
    ├── 1. import { tweets } from './data/tweets'
    │      tweets is already sorted by created desc (build-time)
    │
    ├── 2. import { profile } from './data/profile'
    │      Profile data is a const object
    │
    ├── 3. Profile.render(profile) → appends to #profile
    │      Sets background-image from profile.backgroundUrl
    │
    └── 4. Timeline.render(tweets) → appends to #timeline
           For each tweet: TweetCard(tweet) → #timeline.appendChild(card)
    │
    ▼
Page is fully rendered. No further JavaScript execution needed.
CSS handles responsive layout and dark/light mode via media queries.
```

### No State Management

This is a static display page. There is no state to manage:
- Tweets are immutable after build.
- Profile is immutable after build.
- No user input to track.
- No optimistic updates.
- No real-time data.

CSS custom properties handle the only "state" -- dark/light mode -- via `prefers-color-scheme: dark` media query, which the browser manages natively.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 tweets | No changes needed. `import.meta.glob` eager loads everything. Bundle size trivially small. |
| 100-1000 tweets | Still fine. 1000 tweets at ~500 bytes Markdown each = ~500KB bundled HTML. Consider gzip (reduces to ~150KB). Vercel serves with compression. |
| 1000-5000 tweets | Bundle size becomes a concern. Consider: (a) paginate with lazy glob imports for older years, (b) virtual scrolling to only render visible tweets, (c) split by year into separate chunks loaded on-demand. |
| 5000+ tweets | Switch to lazy `import.meta.glob` (without `eager: true`) with year-based code splitting. Or offload to a pre-built JSON index per year. This is far beyond the initial scope. |

### Scaling Priorities

1. **First bottleneck:** JS bundle size from eager-loading all tweet HTML. Mitigation: gzip compression (Vercel default) makes this a non-issue for the first few thousand tweets.
2. **Second bottleneck:** DOM node count from rendering thousands of tweet cards. Mitigation: Intersection Observer-based lazy rendering (only create DOM nodes for tweets near the viewport). Not needed until 1000+ tweets.

## Anti-Patterns

### Anti-Pattern 1: Runtime markdown-it / marked in Browser

**What people do:** Import `marked` or `markdown-it` in client code and parse Markdown at runtime in the browser.

**Why it's wrong:** Ships the entire Markdown parser (~40KB min+gzip for marked, ~50KB for markdown-it) to every user. Parsing happens on every page load, slowing down initial render. The Markdown content is already known at build time -- there is no reason to defer parsing.

**Do this instead:** Parse Markdown to HTML at build time in the Vite plugin. Ship only the pre-rendered HTML strings. The browser never sees a Markdown parser.

### Anti-Pattern 2: Dynamic `fs.readFileSync` for Content Loading

**What people do:** Write a Node.js script that uses `fs.readFileSync` to read Markdown files at runtime (or in a server-side handler).

**Why it's wrong:** `fs` does not exist in the browser. Even in a Vite SSR context, this couples content loading to Node.js APIs. It breaks static deployment (Vercel static, GitHub Pages) which have no filesystem access at request time.

**Do this instead:** Use `import.meta.glob` with `{ eager: true }`. Vite resolves all imports at build time and inlines the content into the bundle. No `fs`, no `path`, no Node.js APIs in the browser bundle.

### Anti-Pattern 3: Flat Content Directory

**What people do:** Drop all tweet Markdown files in a single flat directory (`content/tweets/post1.md`, `content/tweets/post2.md`, ...).

**Why it's wrong:** As tweet count grows past ~100, a flat directory becomes unwieldy. Finding a specific file by date is tedious. Filesystem performance degrades on some OS/filesystem combinations. Git operations (status, log) slow down.

**Do this instead:** Use `content/tweets/YYYY/MM/slug.md` from day one. This costs nothing to set up and prevents a painful migration later. The glob pattern `**/*.md` works identically for both flat and nested structures, so there is no code difference.

### Anti-Pattern 4: CSS-in-JS for a Static Page

**What people do:** Add a CSS-in-JS library (styled-components, emotion) for styling tweet cards.

**Why it's wrong:** Adds 12-15KB of runtime overhead for a page that renders once and never changes. CSS-in-JS runtime computes styles on every render, which is wasted on static content. Increases bundle size and time-to-interactive with no benefit.

**Do this instead:** Use a single `styles.css` file with CSS custom properties for theming. Dark/light mode via `prefers-color-scheme` media query. This is zero-runtime-cost, browser-native, and trivially cacheable.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel | Static site deployment via `vercel.json` | Set `outputDirectory: 'dist'`, framework preset to 'vite'. Git push triggers deploy. |
| Bing Daily Image | CSS `background-image: url()` | The URL `https://bing.img.run/rand.php` serves a random daily image. Applied as blurred background on profile section. No API key, no fetch, just a CSS property. |
| Avatar Image | HTML `<img>` with external URL | `https://api.ddnsy.fun/avatar.webp` -- referenced in `profile.ts`, rendered as standard `<img>` tag. No processing needed. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Vite Plugin → `src/data/tweets.ts` | ES module imports | Plugin transforms `.md` → JS module; glob collects modules into array. This is the only build-to-runtime boundary. |
| `src/data/tweets.ts` → `src/components/Timeline.ts` | Function argument (`TweetData[]`) | Timeline receives the pre-sorted array. No shared mutable state. |
| `src/data/profile.ts` → `src/components/Profile.ts` | Function argument (`ProfileData`) | Profile receives static config. Single direction, no callbacks. |
| `src/components/TweetCard.ts` → DOM | Returns `HTMLElement` | Each component is a pure factory function. No side effects, no subscriptions. |
| `scripts/new-tweet.ts` → `content/tweets/` | Writes `.md` file to disk | The tweet creation script is a standalone Node.js CLI tool. It does not interact with Vite or the browser bundle. |

## Build Order Implications

The architecture implies this dependency chain for implementation phases:

```
Phase 1: Foundation
  └── Vite project scaffold + index.html shell + CSS custom properties + static profile

Phase 2: Build Pipeline
  └── Custom Vite plugin (gray-matter + marked) + type declarations
      ↓ (depends on: Phase 1 project structure)

Phase 3: Content Loading
  └── import.meta.glob in tweets.ts + type definitions + time utilities
      ↓ (depends on: Phase 2 plugin -- need .md modules to import)

Phase 4: Tweet Rendering
  └── TweetCard component + Timeline component + main.ts mounting
      ↓ (depends on: Phase 3 -- need TweetData array)

Phase 5: Tweet Creation Script
  └── scripts/new-tweet.ts (interactive CLI for creating new tweet files)
      ↓ (independent of Phases 3-4, but needs Phase 2 types)

Phase 6: Deployment
  └── vercel.json + deployment configuration
      ↓ (depends on: Phase 4 -- need a working site to deploy)
```

**Critical path:** 1 → 2 → 3 → 4 → 6. Phase 5 is parallelizable after Phase 2.

## Sources

- [Vite import.meta.glob documentation](https://vitejs.dev/guide/features.html#glob-import) -- HIGH confidence (official docs)
- [gray-matter (jonschlinkert) GitHub](https://github.com/jonschlinkert/gray-matter) -- HIGH confidence (official repo, 4.4K stars)
- [@11ty/gray-matter (maintained fork)](https://www.npmjs.com/package/@11ty/gray-matter) -- HIGH confidence (official npm, Eleventy-maintained)
- [marked.js GitHub](https://github.com/markedjs/marked) -- HIGH confidence (official repo, v14+)
- [marked custom renderers (v13/v14)](https://deepwiki.com/markedjs/marked/3.1-custom-renderers) -- HIGH confidence (official deepwiki docs)
- [markdown-it vs marked vs remark performance benchmark (May 2025)](https://npm-compare.com/markdown-it,marked,micromark,remark,showdown) -- MEDIUM confidence (community benchmark)
- [Vite plugin Markdown pattern (custom transform)](https://github.com/lfarci/loganfarci.com/issues/105) -- MEDIUM confidence (real-world implementation)
- [vite-plugin-markdown (hmsk) GitHub](https://github.com/hmsk/vite-plugin-markdown) -- HIGH confidence (official repo, 260+ stars)
- [Jekyll content organization (year/month)](https://ubc-library-rc.github.io/intermediate-Jekyll/content/05.Blogging.html) -- MEDIUM confidence (community docs)
- [Astro-Paper year/month folder structure](https://blog.gitcode.com/00102db8e5b7bee7bb0b08e200ac5361.html) -- MEDIUM confidence (real-world example)
- [Vite + vanilla TypeScript static site approach](https://wenku.csdn.net/doc/77cqmcetkm) -- MEDIUM confidence (community article)
- [11ty + Vite for modern static websites (Nov 2025)](https://benswift.me/blog/2025/11/24/11ty-and-vite-for-modern-static-websites/) -- MEDIUM confidence (blog post)

---
*Architecture research for: ViteX -- Markdown-driven personal timeline*
*Researched: 2026-05-02*

# Stack Research

**Domain:** Vite-based Markdown-driven static personal timeline
**Researched:** 2026-05-02
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.0.x | Build tool, dev server, static output | Project name is "ViteX"; fastest HMR and build times; `import.meta.glob` for zero-runtime file discovery; native ESM throughout |
| TypeScript | 5.8.x | Type safety for frontmatter schemas and post data | Catches frontmatter shape mismatches at build time; self-documenting data contracts for tweet metadata |
| marked | 18.0.x | Markdown-to-HTML rendering at build time | Fastest Markdown parser; ESM-only since v16 (no CJS cruft); simple API for basic Markdown (bold, links, paragraphs — exactly what tweets need); actively maintained with security fixes (v17.0.4 fixed a ReDoS) |
| @11ty/gray-matter | 2.0.x | YAML frontmatter parsing at build time | Maintained fork by the Eleventy team; upgraded to js-yaml v4 (security); uses `Uint8Array` instead of `Buffer` for Deno/Bun/browser compat; removed JS frontmatter type (no `eval`); actively maintained as of 2025-05 |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dayjs | 1.11.x | Relative time formatting ("3 hours ago") | Client-side at render time; `relativeTime` plugin is bundled in the main package (no separate install); Chinese locale support for the target user; 2KB core + plugin; Moment.js-compatible API |
| @picocss/pico | 2.1.x | Semantic CSS framework with built-in dark mode | Base styling for all HTML elements; auto-detects system `prefers-color-scheme` when `data-theme` is omitted; 11KB gzipped; zero JavaScript; styles rendered Markdown HTML beautifully out of the box |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite dev server | HMR during development | `vite` command serves `index.html` with instant reload on `.md` or `.ts` changes |
| vite build | Static output to `dist/` | Outputs plain HTML/CSS/JS ready for Vercel static deployment |
| vercel | Deployment | `vercel --prod` from project root; Vercel auto-detects Vite and runs `vite build` |

## Installation

```bash
# Core (build-time dependencies)
npm install marked @11ty/gray-matter

# Runtime dependency (bundled for the browser)
npm install dayjs

# CSS framework
npm install @picocss/pico

# Dev dependencies
npm install -D vite typescript vercel
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| marked 18.x | markdown-it 14.x | When you need a plugin ecosystem (syntax highlighting, custom extensions). For this project's scope (bold, links, paragraphs), marked is simpler and faster. |
| @11ty/gray-matter 2.x | Original gray-matter 4.x | **Never for new projects.** Original is unmaintained since 2019, uses js-yaml v3 (security issues), and lacks ESM. The @11ty fork is a drop-in replacement. |
| @picocss/pico 2.x | Tailwind CSS 4.x | When you need pixel-level custom design control. For this project, Pico.css gives beautiful defaults with zero config and built-in dark mode. Tailwind adds a PostCSS build step and verbose class strings for minimal gain on a single-page timeline. |
| dayjs 1.11.x | @github/relative-time-element 5.x | When you want a framework-agnostic web component with live auto-updating timestamps. For this project, dayjs is simpler, supports Chinese locale, and auto-updating is unnecessary (page is static post-load). |
| dayjs 1.11.x | Native Intl.RelativeTimeFormat | When you want zero dependencies and can write the unit-calculation logic yourself. For this project, dayjs wraps this API with a clean `.fromNow()` call and includes Chinese locale — worth the 2KB. |
| Vite + custom plugin | Astro 5.x | When building a content-heavy multi-page site. Astro is excellent but overkill for a single-page timeline — it adds a framework, routing, and Island architecture that this project doesn't need. |
| Vite + custom plugin | VitePress 1.x | When building documentation sites. VitePress is Vue-based and optimized for docs navigation — wrong shape for a Twitter-style timeline. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Original `gray-matter` (jonschlinkert) | Unmaintained since 2019; depends on js-yaml v3 with known vulnerabilities; no ESM support; `Buffer`-based API incompatible with non-Node runtimes | @11ty/gray-matter 2.x |
| React / Vue / Svelte | Adds 30-100KB of framework overhead for a single-page timeline that renders static data; introduces component lifecycle complexity for zero benefit | Vanilla TypeScript with direct DOM manipulation |
| Any backend framework (Express, Fastify, etc.) | Project constraint: pure frontend, no backend | Vite static build |
| Any database (SQLite, PostgreSQL, etc.) | Project constraint: no database, content is Markdown files in git | `import.meta.glob` for file discovery |
| Tailwind CSS (for this project) | Adds PostCSS build step; verbose utility classes in HTML; dark mode requires manual Tailwind config; over-engineered for a single-page timeline with 10-20 CSS rules needed | @picocss/pico 2.x + ~50 lines of custom CSS |
| `@github/relative-time-element` | Web component with custom element registration; auto-updating timers are wasteful for a static page that doesn't change post-load; 5KB for functionality achievable in 2KB | dayjs 1.11.x + relativeTime plugin |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| marked 18.0.x | Vite 8.0.x | ESM-only, works natively with Vite's ESM dev server and Rollup production bundle |
| @11ty/gray-matter 2.0.x | Vite 8.0.x | ESM; build-time only (never shipped to browser); used inside Vite plugin |
| dayjs 1.11.x | All browsers (IE11+ with polyfills) | `relativeTime` plugin uses `Intl.RelativeTimeFormat` (available in all modern browsers since 2020) |
| @picocss/pico 2.1.x | All modern browsers | Pure CSS; `prefers-color-scheme` media query supported since Chrome 76, Firefox 67, Safari 12.1 |

## Architecture Notes

### Build-Time vs Runtime Boundary

```
BUILD TIME (Node.js, runs once at deploy):
  import.meta.glob → collect .md files
  @11ty/gray-matter → parse frontmatter
  marked → render Markdown → HTML string
  Output: static data object embedded in JS bundle

RUNTIME (Browser, runs on page load):
  dayjs → format timestamps as relative time
  Pico.css → apply system dark/light theme
  Custom CSS → Twitter-style card layout
```

This boundary is critical: all file I/O and Markdown processing happens at build time. The browser receives pre-rendered HTML strings and only needs to format timestamps and apply styles.

### Dark Mode Strategy

Pico.css v2 handles dark mode automatically:
1. Omit `data-theme` from `<html>` — Pico.css detects `prefers-color-scheme` from the OS
2. Pico.css provides CSS custom properties for all colors (`--pico-background-color`, `--pico-color`, etc.)
3. Custom CSS uses these variables, inheriting theme switching for free
4. Add `transition: background-color 0.3s, color 0.3s` for smooth switching

No JavaScript toggle needed (per requirement TW-06: "UI follows system light/dark mode preference").

## Sources

- [marked npm registry](https://www.npmjs.com/package/marked) — verified version 18.0.3 (MEDIUM-HIGH confidence, npm view)
- [@11ty/gray-matter npm registry](https://www.npmjs.com/package/@11ty/gray-matter) — verified version 2.0.2 (MEDIUM-HIGH confidence, npm view)
- [dayjs npm registry](https://www.npmjs.com/package/dayjs) — verified version 1.11.20 (MEDIUM-HIGH confidence, npm view + newreleases.io)
- [@picocss/pico npm registry](https://www.npmjs.com/package/@picocss/pico) — verified version 2.1.1 (MEDIUM-HIGH confidence, npm view)
- [Vite npm registry](https://www.npmjs.com/package/vite) — verified version 8.0.10 (MEDIUM-HIGH confidence, npm view)
- [Pico.css v2 dark mode documentation](https://picocss.com/docs/) — system preference detection via `prefers-color-scheme` (MEDIUM confidence, DeepWiki + WebSearch)
- [marked changelog — ReDoS fix in v17.0.4](https://github.com/markedjs/marked) — security patch verification (MEDIUM confidence, newreleases.io)
- [gray-matter ecosystem analysis](https://nodejs.libhunt.com/gray-matter-alternatives) — unmaintained status confirmed, @11ty fork recommended (MEDIUM confidence, LibHunt + npm metadata)
- WebSearch: `marked npm latest version`, `gray-matter alternatives 2025`, `Pico.css dark mode`, `dayjs relativeTime plugin` (various queries) — ecosystem survey (MEDIUM confidence, multiple corroborating sources)

---
*Stack research for: ViteX — Vite-based Markdown-driven static personal timeline*
*Researched: 2026-05-02*

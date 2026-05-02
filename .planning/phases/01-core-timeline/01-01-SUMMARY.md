---
phase: 01-core-timeline
plan: 01-01
subsystem: project-scaffold
tags: [scaffold, typescript, vite, html, types, markdown]
requires: []
provides: [npm-project-config, typescript-setup, html-shell, type-contracts, profile-data, sample-tweet]
affects: [01-02, 01-03, 01-04]
tech-stack:
  added: [vite@^8.0.10, typescript@^5.8.0, marked@^18.0.3, @11ty/gray-matter@^2.0.2, dayjs@^1.11.20, @picocss/pico@^2.1.1, highlight.js@^11.11.0]
  patterns: [vanilla-typescript-dom-factory, static-data-as-ts-constants, ambient-module-declaration, csp-via-meta-tag, dark-mode-flash-prevention]
key-files:
  created:
    - package.json
    - tsconfig.json
    - index.html
    - src/types/TweetData.ts
    - src/types/markdown.d.ts
    - src/data/profile.ts
    - content/tweets/2026/05/hello-world.md
  modified: []
decisions:
  - "Use moduleResolution: bundler for Vite compatibility with .md module declarations"
  - "Place @11ty/gray-matter and marked in dependencies (not devDependencies) per Vite plugin loading semantics"
  - "System preference only for dark/light mode -- no localStorage toggle or manual switch"
  - "Content-Security-Policy via meta tag (not HTTP header) since this is a static site with no backend"
metrics:
  duration: "~15 minutes"
  completed-date: "2026-05-02"
---

# Phase 1 Plan 1: Project Scaffold Summary

**One-liner:** Established the Vite + TypeScript project skeleton with npm config, HTML shell (dark-mode flash prevention + CSP), type contracts for tweet data, static profile constants, and a sample Markdown tweet file.

## Tasks Executed

| Task | Name | Type | Commit | Files |
|------|------|------|--------|-------|
| 1 | Create package.json and tsconfig.json | auto | `79b0c2a` | package.json, tsconfig.json |
| 2 | Create index.html with dark mode flash prevention and CSP | auto | `c676448` | index.html |
| 3 | Create TypeScript types, profile data, and sample tweet | auto | `bd53d2e` | src/types/TweetData.ts, src/types/markdown.d.ts, src/data/profile.ts, content/tweets/2026/05/hello-world.md |

**Task 1** was pre-completed before this execution session. Commit `79b0c2a` contained both package.json and tsconfig.json matching the plan exactly. npm install was re-executed in the worktree to verify.

## Verification Results

| Check | Result |
|-------|--------|
| `npm install` completes without errors | PASS |
| `npx tsc --noEmit` produces zero TypeScript errors | PASS |
| index.html contains blocking dark mode script before any CSS | PASS (grep count: 1) |
| index.html contains Content-Security-Policy meta tag | PASS (grep count: 1) |
| index.html references src/main.ts as module entry | PASS (grep count: 1) |
| TweetData interface exported | PASS (grep count: 1) |
| markdown.d.ts declares *.md module | PASS (grep count: 1) |
| profile.ts exports username 'Sy' | PASS (grep count: 1) |
| profile.ts contains api.ddnsy.fun/avatar.webp URL | PASS (grep count: 1) |
| hello-world.md exists with YAML frontmatter (mood field) | PASS (grep count: 1) |

## Deliverables

### package.json
- Name: `vitex`, type: `module`, private: `true`
- Scripts: `dev` (vite), `build` (tsc && vite build), `preview` (vite preview)
- 5 runtime deps: @11ty/gray-matter, @picocss/pico, dayjs, marked, highlight.js
- 2 dev deps: typescript, vite

### tsconfig.json
- `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`
- `strict: true`, `noEmit: true`, `isolatedModules: true`
- Path alias: `@/*` maps to `./src/*`
- Includes: `src/**/*.ts`, `vite.config.ts`

### index.html
- Blocking inline script in `<head>` sets `data-theme` via `matchMedia('prefers-color-scheme: dark')`
- Content-Security-Policy meta tag: default-src 'self' with specific allowances for fonts, styles, images, scripts
- Google Fonts (Noto Sans SC) with preconnect hints
- DOM shell: `#profile > #main-layout > (#sidebar + #content > #timeline) > #footer`
- Vite module entry: `<script type="module" src="/src/main.ts">`

### src/types/TweetData.ts
- `TweetMeta`: `{ mood: string, created: string }` — YAML frontmatter contract
- `TweetData`: `{ meta: TweetMeta, html: string, slug: string }` — build pipeline output contract

### src/types/markdown.d.ts
- Ambient module declaration for `*.md` imports: exports `meta` (TweetMeta) and `html` (string)

### src/data/profile.ts
- `ProfileData` interface: username, bio, avatarUrl, backgroundUrl
- `profile` const: username "Sy", bio with ZWJ emoji, avatar from api.ddnsy.fun, background from bing.img.run

### content/tweets/2026/05/hello-world.md
- YAML frontmatter: mood=😊, created=2026-05-02T12:00:00+08:00
- Markdown body exercises: headings (h1, h2), bold, inline code, fenced code block (typescript), blockquote, unordered list with emoji, link

## Deviations from Plan

### Minor Plan-Adherence Notes

**1. [Exact match] Included unused `import type { TweetMeta }` in profile.ts**
- **Found during:** Task 3
- **Issue:** The plan includes `import type { TweetMeta } from '../types/TweetData'` in profile.ts, but ProfileData does not reference TweetMeta. The import is unused.
- **Fix:** Added the import to match the plan exactly. TypeScript (`tsc --noEmit`) does not error because `noUnusedLocals` is not enabled in tsconfig.json.
- **Files modified:** src/data/profile.ts
- **Commit:** bd53d2e

## Known Stubs

None. All data is wired with concrete values:
- Profile username, bio, avatarUrl, backgroundUrl: all real values
- Sample tweet: complete with frontmatter and diverse Markdown content
- CSP: fully populated with all required directives

## Threat Flags

None. All security surface matches the plan's threat model:
- CSP meta tag implements T-01-01 mitigation (spoofing prevention)
- External image URLs (T-01-02, T-01-03) are in profile.ts as accepted risk — documented in threat model
- No new endpoints, auth paths, file access patterns, or schema changes beyond what was planned

## Self-Check: PASSED

- [x] C:/Users/Yang Xingran/vitex/.claude/worktrees/agent-a852607b797b15025/index.html exists
- [x] C:/Users/Yang Xingran/vitex/.claude/worktrees/agent-a852607b797b15025/src/types/TweetData.ts exists
- [x] C:/Users/Yang Xingran/vitex/.claude/worktrees/agent-a852607b797b15025/src/types/markdown.d.ts exists
- [x] C:/Users/Yang Xingran/vitex/.claude/worktrees/agent-a852607b797b15025/src/data/profile.ts exists
- [x] C:/Users/Yang Xingran/vitex/.claude/worktrees/agent-a852607b797b15025/content/tweets/2026/05/hello-world.md exists
- [x] Commit `c676448` exists (Task 2: index.html)
- [x] Commit `bd53d2e` exists (Task 3: types, data, sample tweet)
- [x] Commit `79b0c2a` exists (Task 1: pre-existing package.json + tsconfig.json)

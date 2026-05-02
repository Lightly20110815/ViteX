# Phase 1: Core Timeline - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

## Phase Boundary

A single-page static site that renders all Markdown tweets from `content/tweets/` in reverse-chronological order. Delivers: Vite build pipeline (Markdown → HTML), tweet cards with username/mood/relative-time headers, profile section (avatar, bio, blurred Bing background), system dark/light mode with no flash, and responsive layout. This is display-only — the tweet creation script and Vercel deployment come in Phase 2.

## Implementation Decisions

### Tweet Card Style
- **D-01:** Glassmorphism cards — semi-transparent with backdrop-blur over the Bing background image
- **D-02:** Top bar layout — username (Sy), mood emoji, relative time in a single row; Markdown body below
- **D-03:** Desktop max-width ~600px, centered
- **D-04:** Subtle background-color highlight on hover
- **D-05:** Light backdrop-blur (small blur value, performance-friendly)
- **D-06:** Medium border-radius (12-16px)
- **D-07:** Card spacing 16-20px between tweets
- **D-08:** 1px semi-transparent divider line between cards

### Page Layout
- **D-09:** Desktop: profile section at page top, below that a sidebar+content layout — sidebar holds navigation links, main area holds the tweet timeline
- **D-10:** Profile section positioned at the top of the page (visible immediately)
- **D-11:** Mobile: single-column stacked, compact profile version (smaller avatar/bio, reduced height)
- **D-12:** Content area max-width 672px
- **D-13:** No fixed top navigation bar — pure scrollable timeline
- **D-14:** Minimal footer: "Powered by ViteX · {year}", one line

### Background Visual Treatment
- **D-15:** Full-page Bing daily image background (`https://bing.img.run/rand.php`)
- **D-16:** Moderate CSS blur on the background image — colors/atmosphere visible but details softened
- **D-17:** Light mode: light-colored overlay on background; Dark mode: dark-colored overlay on background. Same image, different mask per theme.
- **D-18:** Pure color gradient placeholder while background loads; smooth transition when image is ready
- **D-19:** Fallback: solid background-color if Bing image fails to load

### Markdown Rendering Scope
- **D-20:** Supported basics: bold (`**`), italic (`*`), links (`[text](url)`), strikethrough (`~~`), inline code (`` ` ``)
- **D-21:** Fenced code blocks with syntax highlighting (via marked + highlight.js or similar)
- **D-22:** Embedded images supported (`![alt](url)`) — rendered as clickable/viewable images
- **D-23:** Security: marked configured to allow only safe HTML tags; no script, iframe, or event handlers

### Design Process
- **D-24:** The `/ui-ux-pro-max` skill MUST be invoked during design/implementation. This is a hard requirement — user explicitly requested it for visual design guidance.

### Claude's Discretion

None — user made all design choices explicitly.

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level
- `.planning/PROJECT.md` — Project definition, profile info, constraints, key decisions
- `.planning/REQUIREMENTS.md` — Full v1 requirements (20 total), traceability mapping
- `.planning/ROADMAP.md` — Phase structure, dependencies, success criteria
- `.planning/config.json` — Workflow preferences (quality models, research enabled)

### Research
- `.planning/research/STACK.md` — Technology stack: Vite 8 + TypeScript + marked + @11ty/gray-matter + dayjs + Pico.css
- `.planning/research/ARCHITECTURE.md` — Build pipeline design, component architecture, data flow
- `.planning/research/PITFALLS.md` — Critical pitfalls to avoid (YAML failures, dark mode flash, image fallbacks)
- `.planning/research/FEATURES.md` — Feature landscape, table stakes vs differentiators
- `.planning/research/SUMMARY.md` — Executive summary of all research

### UI/UX Design
- UI/UX Pro Max skill — MUST invoke `/ui-ux-pro-max` during design phase (per user requirement D-24)

## Existing Code Insights

Greenfield project — no existing code. All patterns are to be established.

### Architecture from Research
- Custom Vite plugin for build-time Markdown processing (gray-matter + marked + import.meta.glob)
- Vanilla TypeScript DOM factory functions (no framework)
- Pico.css for baseline styling with CSS custom properties for theming
- Content: `content/tweets/YYYY/MM/slug.md` with YAML frontmatter

## Specific Ideas

- User wants the personal timeline to feel like a modern Twitter/X profile but with a personal, atmospheric touch via the Bing background + glassmorphism
- The mood emoji in the tweet top bar is positioned as a key differentiator — give it visual presence
- Profile bio contains emoji and should render them well: `🏳️‍⚧️「重构时间线，再次重逢」 | 是夕妍？ | INFP | MtFtX | oler转oder | 🎂08.15 | Vite | Cpp | HRT 25.08.11~25.11.30 26.04.17~`
- Avatar: `https://api.ddnsy.fun/avatar.webp`

## Deferred Ideas

None — discussion stayed within phase scope.

---
*Phase: 1-Core Timeline*
*Context gathered: 2026-05-02*

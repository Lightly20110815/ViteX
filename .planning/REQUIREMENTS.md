# Requirements: ViteX

**Defined:** 2026-05-02
**Core Value:** Write posts in Markdown and see them rendered in a beautiful Twitter-style timeline — create file, git push, live.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Content Pipeline

- [ ] **PIPE-01**: Custom Vite plugin discovers `.md` files from `content/tweets/YYYY/MM/` directory structure using `import.meta.glob`
- [ ] **PIPE-02**: Plugin parses YAML frontmatter (username, mood, timestamp) from each Markdown file using @11ty/gray-matter
- [ ] **PIPE-03**: Plugin renders Markdown body to HTML string at build time using marked, never in the browser
- [ ] **PIPE-04**: Per-file try/catch in build plugin prevents single malformed YAML from aborting entire build

### Timeline Display

- [ ] **TIME-01**: Tweet card component renders username (Sy), mood emoji, and relative time in top bar
- [ ] **TIME-02**: Tweet card renders Markdown body as HTML below the top bar
- [ ] **TIME-03**: Timeline displays all tweets in reverse-chronological order
- [ ] **TIME-04**: Relative timestamps computed client-side using dayjs + relativeTime plugin + zh-cn locale (几秒前/几分钟前/几小时前/几天前)

### Profile & Visual Identity

- [ ] **PROF-01**: Profile section displays avatar image (https://api.ddnsy.fun/avatar.webp) with fallback on error
- [ ] **PROF-02**: Profile section displays bio text with emoji support
- [ ] **PROF-03**: Background uses Bing daily image (https://bing.img.run/rand.php) with CSS blur and solid color fallback
- [ ] **PROF-04**: UI follows system light/dark mode via `prefers-color-scheme` media query with Pico.css
- [ ] **PROF-05**: Blocking inline `<script>` in `<head>` prevents dark mode flash on page load
- [ ] **PROF-06**: Responsive layout adapts to desktop and mobile viewports

### Content Creation

- [ ] **CREA-01**: Node.js script generates new tweet Markdown files with auto-generated timestamp
- [ ] **CREA-02**: Script provides interactive mood emoji selector with common options and custom input
- [ ] **CREA-03**: Script creates file at correct `content/tweets/YYYY/MM/` path

### Deployment

- [ ] **DEPL-01**: `vercel.json` configures static site deployment with correct build command and output directory
- [ ] **DEPL-02**: Site builds and deploys successfully on git push to main branch
- [ ] **DEPL-03**: SEO meta tags (title, description, og:image) included in HTML head

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Polish

- **POL-01**: Syntax highlighting for code blocks in tweet body
- **POL-02**: RSS feed for timeline
- **POL-03**: Tweet search/filter functionality
- **POL-04**: Pagination or infinite scroll for 100+ tweets
- **POL-05**: Permalink pages for individual tweets

### Content Workflow

- **CREA-04**: Pre-commit git hook validates YAML frontmatter in all tweet files
- **CREA-05**: Watch mode — script detects new/modified files and auto-rebuilds

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user support | Single-user personal timeline by design |
| Comments/reply system | Pure display, no interaction |
| Likes/favorites | Not a social platform |
| OAuth/authentication | No backend, no users to authenticate |
| Database/API | Pure static generation, no server |
| Real-time updates | Git push triggers redeploy; no WebSocket/SSE |
| Mobile app | Responsive web covers mobile; native app is overkill |
| Admin panel/CMS | Git is the CMS; Markdown files are the database |
| Image upload in posts | External URLs only for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 1 | Pending |
| PIPE-02 | Phase 1 | Pending |
| PIPE-03 | Phase 1 | Pending |
| PIPE-04 | Phase 1 | Pending |
| TIME-01 | Phase 1 | Pending |
| TIME-02 | Phase 1 | Pending |
| TIME-03 | Phase 1 | Pending |
| TIME-04 | Phase 1 | Pending |
| PROF-01 | Phase 1 | Pending |
| PROF-02 | Phase 1 | Pending |
| PROF-03 | Phase 1 | Pending |
| PROF-04 | Phase 1 | Pending |
| PROF-05 | Phase 1 | Pending |
| PROF-06 | Phase 1 | Pending |
| CREA-01 | Phase 2 | Pending |
| CREA-02 | Phase 2 | Pending |
| CREA-03 | Phase 2 | Pending |
| DEPL-01 | Phase 2 | Pending |
| DEPL-02 | Phase 2 | Pending |
| DEPL-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-02*
*Last updated: 2026-05-02 after initial definition*

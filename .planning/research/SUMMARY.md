# Project Research Summary

**Project:** ViteX -- Markdown-driven personal Twitter-style timeline
**Domain:** Static personal microblog (single-user, Markdown-driven, pure frontend)
**Researched:** 2026-05-02
**Confidence:** HIGH

## Executive Summary

ViteX is a single-page static timeline that renders a personal Twitter-style feed from Markdown files. Experts in this domain build it with a build-time content pipeline: Markdown files on disk are transformed into pre-rendered HTML at build time via a custom Vite plugin, shipped as static assets, and rendered in the browser with vanilla TypeScript DOM manipulation -- no framework, no backend, no database. The defining characteristic is that all file I/O and Markdown processing happens at build time; the browser receives only pre-rendered HTML strings, CSS for theming, and minimal JavaScript for relative timestamps.

The recommended approach is a Vite 8.x project with four core libraries (marked for Markdown parsing, @11ty/gray-matter for YAML frontmatter, dayjs for relative time formatting, and @picocss/pico for semantic CSS with built-in dark mode), a custom Vite plugin that intercepts `.md` imports and transforms them into typed ES modules, and `import.meta.glob` to aggregate all tweets at build time into a sorted array. The architecture is deliberately minimal: DOM factory functions instead of framework components, CSS custom properties instead of CSS-in-JS, and system `prefers-color-scheme` instead of a manual dark mode toggle.

The key risks are: (1) a single malformed YAML frontmatter block can silently break the entire Vercel build, (2) unprotected external image URLs can cause broken visuals with no error reporting, (3) a dark-mode flash on first paint can ruin the experience, and (4) content growth can degrade build performance over time. All four risks are well-understood with established mitigation strategies -- per-file error handling in the Vite plugin, blocking inline scripts for dark mode, image `onerror` fallbacks, and lazy glob imports for scale.

## Key Findings

### Recommended Stack

This is a build-time-heavy, runtime-light project. All four package choices are maximally opinionated: one tool per responsibility with no overlap. The stack avoids every form of unnecessary complexity: no framework (Vite alone handles dev server, HMR, and static output), no CSS build step (Pico.css is semantic CSS with custom properties), no runtime Markdown parser, and no database.

**Core technologies:**

| Technology | Version | Purpose | Why chosen |
|------------|---------|---------|------------|
| Vite | 8.0.x | Build tool, dev server, HMR, static output, `import.meta.glob` for zero-runtime file discovery | The project's namesake; fastest HMR; native ESM throughout; built-in glob imports eliminate the need for a content plugin |
| TypeScript | 5.8.x | Type safety for frontmatter schemas and tweet data structures | Catches shape mismatches at build time; self-documenting data contracts; no runtime cost |
| marked | 18.0.x | Build-time Markdown-to-HTML rendering (GFM, no plugins) | Fastest Markdown parser; ESM-only (no CJS cruft); simple API sufficient for tweet content (bold, links, paragraphs); actively maintained with security patches |
| @11ty/gray-matter | 2.0.x | Build-time YAML frontmatter parsing | Maintained Eleventy fork (original `gray-matter` is abandoned since 2019 with js-yaml v3 security issues); uses `Uint8Array` instead of `Buffer` for Deno/Bun compat; no `eval`-based JS frontmatter |
| dayjs | 1.11.x | Client-side relative time formatting (`fromNow()`) | 2KB core + relativeTime plugin; Chinese locale support; simpler than `@github/relative-time-element` for a page that never changes post-load |
| @picocss/pico | 2.1.x | Semantic CSS framework with built-in dark mode | 11KB gzipped; zero JavaScript; auto-detects `prefers-color-scheme` from OS; styles rendered Markdown HTML beautifully out of the box |

For the full stack analysis including alternatives considered and what NOT to use, see [STACK.md](./STACK.md).

### Expected Features

The research identified 11 table-stakes features (P1, must launch with), 4 post-validation features (P2), and 7 deferred features (P3, v2+). The feature dependency graph reveals that the timeline requires three co-dependent rendering features: Markdown-to-HTML, frontmatter parsing, and the tweet card UI -- these must be built as a single unit.

**Must have for launch (v1):**

- Markdown-to-HTML rendering with GFM support -- the core function, without which nothing else matters
- YAML frontmatter parsing -- required for date (sorting), mood (display), and post metadata
- Reverse-chronological timeline -- the defining UX pattern
- Tweet card UI with header (avatar, username, mood, timestamp) and body (rendered HTML)
- Relative timestamps -- human-readable time in card headers
- Profile section (avatar + bio) with blurred Bing daily background
- Dark/light mode via system preference (zero JS, CSS custom properties from day one)
- Responsive layout (single-column mobile, multi-column desktop)
- Year/month directory structure for content organization
- Vercel deployment pipeline (git push triggers deploy)

**Should have (v1.x, after validation):**

- Script-based post creation with interactive mood selector -- automate boilerplate when manual friction is felt
- SEO basics (meta tags, Open Graph) -- enable link previews once the URL is public
- Mood emoji in tweet card header -- first-class `mood` frontmatter field, low cost, high emotional context

**Defer (v2+, future consideration):**

- RSS/Atom feed -- zero readers at launch; add when someone asks
- Syntax highlighting for code blocks -- add with first technical post
- Tag/category pages, static search (pagefind), pagination, post permalink pages, image optimization, WebMention support -- all add complexity without validating the core concept first

For the full feature catalog including competitor analysis, dependency graph, and anti-features (comments, likes, CMS, multi-user), see [FEATURES.md](./FEATURES.md).

### Architecture Approach

The architecture follows three opinionated patterns, each chosen to minimize runtime complexity by moving work to build time.

**Pattern 1 -- Build-Time Content Pipeline:** A custom Vite plugin intercepts `.md` imports in the `transform()` hook, parses frontmatter with `gray-matter`, renders Markdown to HTML with `marked`, and exports a typed ES module with `{ meta, html }`. At runtime, `import.meta.glob('/content/tweets/**/*.md', { eager: true })` collects all modules into a sorted `TweetData[]` array with zero filesystem access. This is the sole bridge between build and runtime.

**Pattern 2 -- DOM Factory Functions:** Each UI piece is a pure TypeScript function (`TweetCard(tweet): HTMLElement`, `Timeline(tweets): void`, `Profile(data): void`) that creates real DOM nodes via `document.createElement` and `innerHTML`. No virtual DOM, no reactivity system, no state management library. This is appropriate for a display-only page where content is immutable after build.

**Pattern 3 -- Static Data as TypeScript Constants:** Profile information and site configuration live in `src/data/profile.ts` as exported `const` objects, bundled into the JS output at build time. Type-safe, zero-latency, git-versioned.

**Major components:**

| Component | Responsibility |
|-----------|----------------|
| Custom Vite Plugin (`vite.config.ts`) | Transform `.md` files into typed ES modules at build time |
| `src/data/tweets.ts` | Collect all tweet modules via `import.meta.glob`, sort by date descending |
| `src/data/profile.ts` | Static constants: username, bio, avatar URL, background URL |
| `src/components/TweetCard.ts` | DOM factory: create a single tweet card `HTMLElement` from `TweetData` |
| `src/components/Timeline.ts` | DOM factory: iterate tweets, append TweetCards to the timeline container |
| `src/components/Profile.ts` | DOM factory: render profile section with avatar, bio, blurred background |
| `src/main.ts` | Entry point: mount profile and timeline into the DOM shell |
| `scripts/new-tweet.ts` | Interactive CLI: create new tweet Markdown file with validated frontmatter |
| `src/styles.css` | All visual styling via CSS custom properties, dark mode via `prefers-color-scheme` |
| `vercel.json` | Static site deployment config, SPA rewrites |

**Anti-patterns explicitly rejected:** runtime Markdown parsing in the browser (ships 40KB+ parser to every user for content known at build time), dynamic `fs.readFileSync` for content loading (breaks static deployment), flat content directories (unscalable past 100 files), and CSS-in-JS (12-15KB runtime overhead for a static page).

For the full architecture including data flow diagrams, scaling considerations, and component boundary documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Critical Pitfalls

Six pitfalls were identified, ranked by severity and preventability. Four require Phase 1 attention; two are deferred to later phases.

1. **Bad frontmatter silently breaks the entire build** -- A single malformed YAML block causes Vercel deploy failure for the whole site. **Prevent with:** per-file try/catch in the Vite plugin (skip broken files, log filename, continue), pre-commit validation hook, and a `npm run validate` script. Address in Phase 1.

2. **External image dependencies break silently** -- Avatar (`api.ddnsy.fun`) and background (`bing.img.run`) are external URLs with no uptime guarantee. When they fail: broken image icons, blank backgrounds, no error reporting. **Prevent with:** `onerror` fallback on avatar, solid `background-color` fallback behind the Bing image, GPU-composited `::before` pseudo-element for blur, explicit `width`/`height` on images to prevent CLS. Address in Phase 1.

3. **Dark/light mode flash (FOIT)** -- Users with `prefers-color-scheme: dark` see a white flash before CSS applies. **Prevent with:** blocking inline `<script>` in `<head>` that reads the system preference and sets `data-theme` on `<html>` synchronously before first paint. Address in Phase 1.

4. **Git-driven content workflow with zero validation** -- The only path to production is `git push`. A content mistake is discovered only when Vercel fails to deploy. **Prevent with:** pre-commit hook that validates YAML in staged `.md` files, tweet creation script that validates output before writing, per-file error handling at build time (partial deploy beats no deploy). Address in Phase 1.

5. **No CSP headers** -- A static site with no backend cannot set HTTP security headers. **Prevent with:** `<meta http-equiv="Content-Security-Policy">` in `index.html`. Since there are no user input forms, a strict CSP is easy to define. Address in Phase 2.

6. **Growing content degrades build performance** -- At 500+ tweets, build time scales linearly, risking Vercel timeout or OOM. **Prevent with:** file-content hashing for incremental builds, year-based code splitting with lazy `import.meta.glob`, pagination (50 tweets per page). Not urgent until 200+ tweets. Address in Phase 3.

**Technical debt patterns to avoid from day one:** hardcoding tweet counts (derive dynamically), omitting timezone offsets from timestamps (always include `+08:00`), skipping `width`/`height` on images (CLS penalty), using `base: './'` for Vite (breaks Vercel asset loading), and hand-writing frontmatter without a schema (defines a Zod schema in Phase 2).

For the full pitfall catalog including recovery strategies, verification checklists, and "looks done but isn't" items, see [PITFALLS.md](./PITFALLS.md).

## Implications for Roadmap

Based on combined research, the architecture implies a strict dependency chain. Phases are ordered by the critical path identified in ARCHITECTURE.md: the Vite plugin must exist before content can be loaded, content must be loadable before tweet cards can render, and rendering must work before deployment. Tweet creation scripting and SEO polish are parallelizable after the build pipeline exists.

### Phase 1: Core Timeline (MVP -- "Tweets on Screen")

**Rationale:** This is the critical path. Nothing else can be built until the build pipeline transforms Markdown files into rendered tweet cards. The architecture's dependency chain is: scaffold -> plugin -> content loading -> tweet rendering. These four steps must be a single phase because tweet cards depend on content loading, which depends on the plugin, which depends on the project scaffold. Dark mode, responsive layout, and the profile section are included because they are design foundations that cannot be retrofitted without painful refactoring (dark mode requires CSS custom properties from day one; responsive layout is non-negotiable for any web product).

**Delivers:** A single-page timeline site that renders all Markdown tweets from `content/tweets/` in reverse-chronological order, with tweet cards, relative timestamps, a profile section with blurred Bing background, system-respecting dark/light mode, and responsive layout.

**Implements (from FEATURES.md):** Markdown-to-HTML rendering, YAML frontmatter parsing, reverse-chronological timeline, tweet card UI, relative timestamps, profile section with blurred background, dark/light mode, responsive layout, year/month directory structure.

**Must avoid (from PITFALLS.md):** Pitfall 1 (bad frontmatter breaks build -- use per-file try/catch in the Vite plugin), Pitfall 3 (dark mode flash -- use blocking inline script in `<head>`), Pitfall 4 (external image failures -- use `onerror` fallback and solid background color fallback), anti-pattern 4 (CSS-in-JS -- use single `styles.css` with custom properties).

**Uses (from STACK.md):** Vite 8.x, TypeScript 5.8.x, marked 18.x, @11ty/gray-matter 2.x, dayjs 1.11.x, @picocss/pico 2.x.

**Key components built:** Custom Vite plugin (`vite.config.ts`), `src/data/tweets.ts` (glob + sort), `src/data/profile.ts` (static config), `src/components/TweetCard.ts`, `src/components/Timeline.ts`, `src/components/Profile.ts`, `src/main.ts`, `src/styles.css`.

**Validation gates:** Run `npm run build` with a known-bad Markdown file -- confirm the build succeeds with a warning (not a crash). Hard-refresh in dark mode -- confirm no white flash. Disconnect network -- confirm avatar and background show fallbacks. Verify HMR works on a single `.md` edit without full page reload.

### Phase 2: Creation, Validation, and Deployment

**Rationale:** Once the timeline renders, the missing pieces are: (1) a way to create tweets without manually writing YAML frontmatter, (2) content validation to prevent broken deploys, and (3) the actual deployment pipeline. The tweet creation script depends on the frontmatter types from Phase 1 but is otherwise independent of the rendering layer. SEO basics are included here because they are low-cost (a few `<meta>` tags in `index.html`) but worthless until the site is deployed and shareable.

**Delivers:** An interactive CLI script for creating tweet Markdown files with validated frontmatter, a pre-commit validation hook, Vercel deployment configuration, SEO meta tags and Open Graph, Content-Security-Policy meta tag.

**Implements (from FEATURES.md):** Script-based post creation with mood selector, Vercel deployment pipeline, SEO basics.

**Must avoid (from PITFALLS.md):** Pitfall 5 (zero validation -- the tweet creation script is the natural choke point; validate all output before writing), Git-driven workflow with no pre-commit hook (add `.git/hooks/pre-commit` or Husky), no CSP (add `<meta>` tag in `index.html`).

**Uses (from STACK.md):** Vercel CLI, Node.js stdin/stdout (for interactive mood selection), gray-matter (for output validation).

**Key components built:** `scripts/new-tweet.ts`, `.git/hooks/pre-commit`, `vercel.json`, CSP meta tag, OG meta tags.

**Validation gates:** Run the creation script with various mood selections -- confirm output has valid YAML. Create a tweet with deliberately broken YAML and attempt to commit -- confirm the pre-commit hook blocks it. Run `vercel --prod` -- confirm the site loads with correct OG tags visible in page source.

### Phase 3: Polish and Scale

**Rationale:** After the site is live and the author has written dozens of tweets, patterns emerge that justify additional work. This phase is deferred until real usage validates the need. It addresses the "nice to haves" that are commonly requested but premature at launch.

**Delivers:** Syntax highlighting for code blocks (triggered by first technical post), RSS feed (triggered by first subscriber request), build performance optimization for 200+ tweets (incremental builds, year-based code splitting).

**Implements (from FEATURES.md):** Syntax highlighting, RSS/Atom feed, pagination consideration, performance optimization for content scale.

**Must avoid (from PITFALLS.md):** Pitfall 6 (growing content degrades build -- introduce file-content hashing for incremental builds before tweet count causes Vercel timeout).

**Uses (from STACK.md):** Shiki or rehype-highlight (for syntax highlighting; deferred install until needed).

**Validation gates:** Build time with 200+ tweets must stay under 60 seconds. RSS feed must validate against W3C Feed Validator. Syntax highlighting must not break existing Markdown rendering.

### Phase Ordering Rationale

The architecture's critical path (scaffold -> plugin -> content loading -> rendering -> deployment) dictates the Phase 1 -> Phase 2 sequence. Phase 1 must produce a working timeline before deployment can be configured. The tweet creation script is intentionally deferred to Phase 2 (not Phase 1) because: (1) manually writing 5-10 tweets reveals where the boilerplate pain points actually are, leading to a better script design, and (2) the frontmatter types from Phase 1 inform the script's output validation. Phase 3 items are explicitly deferred until real usage provides the trigger -- this avoids premature optimization and keeps the initial shipping surface minimal.

The Phase 5 from ARCHITECTURE.md (tweet creation script) is merged into Phase 2 because the deployment pipeline and the creation script are both "bridge to production" concerns that benefit from being built together: the script creates content, validation ensures it won't break the build, and deployment puts it live.

### Research Flags

**Phases likely needing `/gsd-research-phase` during planning:**

- **Phase 3 (Syntax Highlighting):** Choosing between Shiki (build-time, zero JS, heavier) and rehype-highlight (lighter, Highlight.js-based) requires benchmarking against the existing Markdown pipeline. Shiki is preferred architecturally (build-time, consistent with the project philosophy) but adds significant build weight.
- **Phase 3 (RSS Feed):** RSS XML generation at build time requires correct RFC 822 date formatting, GUID management, and potentially a separate Vite plugin or build script. The pattern is well-known but the specific Vite integration needs research.

**Phases with well-documented, established patterns (skip research-phase):**

- **Phase 1:** All core patterns are trivially documented. The custom Vite plugin pattern is standard (Vite official docs, 260+ star reference implementation at `hmsk/vite-plugin-markdown`). DOM factory functions are vanilla JS. Dark mode via `prefers-color-scheme` is a CSS standard since 2019. No novel patterns exist in Phase 1.
- **Phase 2:** Interactive CLI scripts (readline/prompts), pre-commit hooks, and Vercel static site deployment are thoroughly documented. The tweet creation script is a standard Node.js CLI pattern with one twist (mood selector), but interactive prompts are a solved problem.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified via npm registry for version numbers and compatibility. Alternatives analysis backed by real-world usage data (npm download counts, GitHub stars, maintenance status). The `original gray-matter` deprecation (2019) is confirmed by multiple corroborating sources. |
| Features | HIGH | Competitor analysis covers the full spectrum: static microblogs (microblog.pub), timeline generators (static-timeline-generator, Timelino), and Twitter frontend patterns (Nitter). Table-stakes research grounded in swyx's community consensus document. Anti-feature rationale supported by architectural constraints (no backend, single-user). |
| Architecture | HIGH | All three architectural patterns are standard and production-proven. The Vite plugin pattern is documented in Vite's official docs and implemented in popular open-source plugins. The DOM factory pattern is the default approach for vanilla JS static sites. The static data constant pattern is trivial. The project structure follows Jekyll, Astro-Paper, and Hugo conventions for content organization. |
| Pitfalls | MEDIUM | Pitfalls are grounded in real community reports (Vercel community forums, StackOverflow, React 18 hydration discussions, Vite HMR GitHub issues). However, some pitfalls assume framework patterns that do not apply to this project (React hydration errors cited in Pitfall 2 are irrelevant for vanilla TypeScript -- the relative time concern is real but manifests differently). The performance scaling numbers (200 tweets, 1000 tweets) are estimates based on typical Markdown file sizes and Vite build behavior, not measured benchmarks. |

**Overall confidence:** HIGH

The only area requiring measured confidence is performance scaling at tweet counts beyond ~200, as this has not been benchmarked. All other domains are well-understood with high-quality sources and direct npm registry verification.

### Gaps to Address

- **Relative time flash (vanilla TS):** The PITFALLS.md research focused heavily on React 18 hydration errors, which do not apply to this vanilla TypeScript project. The actual concern for ViteX is simpler: build-time ISO timestamps must be immediately replaced with relative times on page load. The mitigation is to use `new Date(isoString)` with `Intl.RelativeTimeFormat` (or dayjs) computed at `DOMContentLoaded`, accepting a sub-second window where ISO strings are visible. This is a minor polish concern, not a blocker. Validate during Phase 1 implementation.

- **Bing image API reliability:** The URL `https://bing.img.run/rand.php` is a third-party proxy with no SLA. Research did not establish the uptime history or rate limits. The solid-color CSS fallback handles the failure case, but if the URL becomes permanently unavailable, the profile section loses its visual differentiator. Monitor during Phase 2 deployment and consider direct Bing API access if the proxy proves unreliable.

- **Year/month directory from day one:** The architecture recommends `content/tweets/YYYY/MM/slug.md` from the first tweet. This is a trivial setup decision but must be enforced in the tweet creation script (Phase 2) and pre-commit hook. The risk is low (the glob pattern `**/*.md` handles both flat and nested structures) but the migration pain from flat to nested is real.

- **Vite 8.x vs Vite 7.x stability:** The STACK.md assumes Vite 8.0.x (latest at research time). If Vite 8 introduces breaking changes to the plugin API or `import.meta.glob`, the Phase 1 implementation may need to pin to a specific minor version. This is a standard npm version pinning concern, not a research gap.

## Sources

### Primary (HIGH confidence)

- [Vite official documentation -- import.meta.glob](https://vitejs.dev/guide/features.html#glob-import)
- [marked.js GitHub repository](https://github.com/markedjs/marked)
- [@11ty/gray-matter npm registry](https://www.npmjs.com/package/@11ty/gray-matter)
- [dayjs npm registry](https://www.npmjs.com/package/dayjs)
- [@picocss/pico npm registry & documentation](https://picocss.com/docs/)
- [Vite npm registry](https://www.npmjs.com/package/vite) -- verified version 8.0.10
- [marked npm registry](https://www.npmjs.com/package/marked) -- verified version 18.0.3
- [vite-plugin-markdown (hmsk) GitHub](https://github.com/hmsk/vite-plugin-markdown) -- reference implementation for custom Vite Markdown plugin

### Secondary (MEDIUM confidence)

- swyxio, "The Surprisingly High Table Stakes of Modern Blogs" (GitHub Issue #443, 2022) -- community consensus on blog table stakes
- molly/static-timeline-generator (GitHub, 447 stars) -- dedicated static timeline tool patterns
- zernonia/timelino (GitHub) -- Vue+Vite timeline platform, no comments by design
- zedeus/nitter DeepWiki -- open-source Twitter frontend rendering patterns
- microblog.pub (sourcehut) -- single-user ActivityPub microblog patterns
- npm-compare.com benchmark: marked vs markdown-it vs remark (May 2025) -- performance comparison
- Vercel community forums -- static build pitfalls, Auto Minify hydration issues, environment variable behavior
- StackOverflow (vercel+vite tag) -- MIME type errors, SPA rewrite patterns, build directory mismatches
- Astro-Paper year/month directory structure -- real-world content organization pattern
- Tyler Sticka, "My Own Little New Post CLI" -- custom Node.js post creation script pattern

### Tertiary (LOW confidence, needs validation)

- Bing daily image proxy URL (`bing.img.run/rand.php`) -- third-party service, no SLA, no documented uptime
- Stubble CLI (codeberg) -- dedicated post creation CLI, small user base
- Various blog posts on 11ty+Vite integration (Nov 2025) -- individual developer patterns, not widely adopted

---
*Research completed: 2026-05-02*
*Ready for roadmap: yes*

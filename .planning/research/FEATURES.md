# Feature Research

**Domain:** Personal Twitter-style timeline (single-user, Markdown-driven, static site)
**Researched:** 2026-05-02
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Markdown-to-HTML rendering (GFM) | Posts are written in Markdown; rendering text, bold, italic, links, images, code blocks is the core function of the site | LOW | Use a Vite Markdown plugin; GFM support (tables, strikethrough, task lists) is standard. Syntax highlighting for code blocks via a plugin like rehype-highlight or Shiki. |
| Reverse-chronological timeline | Twitter's defining UX pattern; users expect newest content at top | LOW | Sort posts by `date` frontmatter field descending at build time. Trivial in Vite's data loading. |
| Tweet card UI with header/body structure | The visual unit of a timeline; header shows identity (avatar, username, mood, time), body renders content | MEDIUM | Card layout using CSS Flexbox/Grid. Header bar: avatar (left), username (left), mood emoji (left), relative timestamp (right). Body: rendered Markdown. Structure from Nitter and Tweeter projects. |
| Relative timestamps | "2 hours ago" is more human-readable than absolute timestamps for a timeline; standard on all social platforms | MEDIUM | Use `@github/relative-time-element` Web Component (designed for static sites, auto-updates, degrades gracefully) or native `Intl.RelativeTimeFormat` for zero-dependency. Decision: `Intl.RelativeTimeFormat` for zero JS bloat since this is a static site. |
| YAML frontmatter parsing | Separates metadata (date, mood, title) from post content; standard pattern across all static site generators (Jekyll, Hugo, Astro, Eleventy) | LOW | Use `gray-matter` (the standard JS frontmatter parser) or the Vite Markdown plugin's built-in frontmatter support. Fields: `date`, `mood`, optionally `title`. |
| Responsive layout | Must look good on desktop and mobile; Twitter's timeline works at all widths; non-negotiable for any web product | MEDIUM | CSS media queries or container queries. Cards stack full-width on mobile. Profile sidebar collapses below or above timeline. Single-column layout under 640px. |
| Dark/light mode via system preference | Users expect sites to respect their OS-level dark/light preference; standard on all modern sites | LOW | Pure CSS approach: define color variables on `:root`, swap them in `@media (prefers-color-scheme: dark)`. Set `color-scheme: light dark` on root. Zero JavaScript needed. No manual toggle (per requirements: "UI follows system light/dark mode preference"). |
| Profile section (avatar + bio) | Gives the timeline an author identity; standard on Twitter profiles and personal sites | LOW | Static image for avatar (external URL or local asset), text for bio. Rendered in a sidebar or header. Simple HTML + CSS. |
| Year/month directory structure | Keeps hundreds of posts organized on disk; standard in Jekyll (`_posts/YYYY-MM-DD-slug.md`) and Astro (`src/content/YYYY/MM/slug.md`) | LOW | Filesystem organization at content level. Vite glob patterns match nested directories. URL structure can map from file paths. |
| Git-driven deployment | Push Markdown files → site rebuilds and deploys; the core workflow of the product | LOW | Vercel auto-deploys on git push. No custom logic needed beyond Vercel configuration. |
| SEO basics (title, meta description, Open Graph) | Search engines and link previews need metadata; standard for any public site | LOW | `<title>`, `<meta description>`, Open Graph tags (`og:title`, `og:description`, `og:image`). Auto-generate from frontmatter or site config. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Mood emoji in tweet card header | Adds emotional context to each post; unique differentiator vs sterile tweet clones; visible at a glance in the timeline | LOW | Emoji character stored in `mood` frontmatter field. Rendered inline in the card header bar next to username. Interactive selector during post creation. |
| Script-based post creation with mood selector | Zero-friction content creation; auto-generates frontmatter with correct timestamp and user-chosen mood emoji; eliminates boilerplate errors | MEDIUM | A Node.js or Bash script that: (1) determines the correct year/month directory, (2) generates a filename with timestamp, (3) writes YAML frontmatter with `date` and `mood`, (4) opens the file in `$EDITOR`. Interactive mood selection via CLI prompt (numbered emoji list). |
| Bing daily background with CSS blur | Unique visual identity; the blurred background behind the profile section changes daily via Bing's image-of-the-day; no static banner image needed | LOW | CSS `background-image: url('https://bing.img.run/rand.php')` with `filter: blur()` and `background-size: cover`. Pure CSS, no JS. |
| Zero-JS core rendering | All content (tweet cards, profile, timeline) renders without JavaScript; only the relative timestamps and background need optional JS; works in text browsers and with JS disabled | LOW | Vite generates static HTML at build time. The `@github/relative-time-element` Web Component degrades gracefully (shows fallback text without JS). Profile background is CSS-only. |
| Editable timeline | Unlike Twitter, past posts can be revised, corrected, or removed; the timeline is a living document, not an immutable log | LOW (inherent to static site model) | Edit the Markdown file, push, redeploy. No technical feature needed -- this is a workflow property of the git-driven model. Communicate this as a feature. |
| Pure static output (no API, no DB, no runtime) | Infinite scalability; zero hosting cost beyond Vercel free tier; no backend to maintain or secure; pages load instantly from CDN | LOW (inherent to architecture) | Vite builds everything to static HTML/CSS/JS. No server-side code. |
| Git version history as content backup | Every post edit is tracked in git; accidental deletions are recoverable; full content history without a database | LOW (inherent to git workflow) | Content is Markdown in a git repo. No feature to build -- this is a property of the workflow. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Comments/disqus/utterances | "I want to hear from readers" | Requires backend or third-party JS embed; adds moderation burden; breaks pure static model; adds tracking; conflicts with single-user focus | If engagement is ever needed, use a "Reply via email" link (`mailto:` with post title in subject). Keeps it static and personal. |
| Likes/favorites/hearts | "Social proof for posts" | Requires backend + database + authentication; scope explosion; contradicts "no multi-user" constraint | None. This is a personal archive, not a social network. |
| Multi-user support | "What if I want to add someone?" | Requires authentication, user management, permissions, database; fundamentally changes the architecture; 10x complexity increase | Not applicable. Single-user is a core constraint. |
| CMS/admin panel | "I want a GUI to write posts" | Requires backend, authentication, rich text editor, draft management; duplicates what VS Code + git already does; adds maintenance burden | VS Code with Markdown preview + the post creation script is the CMS. Git is the version control. |
| Real-time updates / WebSockets | "I want posts to appear live" | Requires a server process (WebSocket or SSE); breaks static site model; Vercel cold starts make this impractical | Git push triggers Vercel redeploy (typically 30-60 seconds). "Real-time" in a single-user context is meaningless -- you are the only author. |
| Analytics / page view counters | "I want to know who's reading" | Adds tracking scripts; slows page load; privacy-hostile; conflicts with minimalist ethos | If absolutely needed, use Vercel Analytics (server-side, no client JS). But prefer no analytics. |
| Manual dark/light mode toggle | "I want to override the system setting" | Adds JS complexity and state management; conflicts with requirement TW-06 ("UI follows system light/dark mode preference"); users can already control this at OS level | The system preference approach is simpler and aligns with the requirement. If a toggle is needed later, CSS `:has()` with a `<select>` element + `localStorage` is the lightest approach. |
| RSS/Atom feed (in v1) | "Readers want to subscribe" | Adds complexity to the v1 build (feed XML generation, correct timestamps, GUID management); zero readers exist at launch; premature optimization | Defer to v1.1 or v2. When built, use a Vite plugin or build-time script to generate an RSS XML file from post frontmatter. |
| Tag/category pages | "I want to filter by topic" | Adds navigation complexity and multiple generated pages; a single-user timeline with mood emojis already provides emotional categorization | Mood emoji already serve as lightweight categorization. If tag filtering is needed later, generate tag index pages at build time. |
| Search | "I want to find old posts" | Full-text search on a static site requires either a client-side search index (increases JS bundle) or a third-party service (Algolia); overkill for a personal timeline | Browser's built-in Ctrl+F works on the full timeline page. If search is needed later, use `pagefind` (build-time index, zero-config, works on static sites). |
| Image upload/attachment handling | "I want images in my posts" | Requires asset pipeline, image optimization, responsive srcsets; significant build complexity; Markdown already supports external image URLs | Use external image URLs in Markdown (`![](url)`). For local images, co-locate them in the same year/month directory and reference them with relative paths. Image optimization can be deferred. |

## Feature Dependencies

```
Tweet Card UI
    ├──requires──> Markdown-to-HTML rendering
    ├──requires──> YAML frontmatter parsing
    └──requires──> Relative timestamps

Relative timestamps
    └──requires──> YAML frontmatter parsing (date field)

Mood emoji in card header
    └──requires──> YAML frontmatter parsing (mood field)

Script-based post creation
    ├──requires──> Year/month directory structure
    └──enhances──> Mood emoji in card header (provides interactive mood selector)

Profile section (blurred background)
    └──independent──> (CSS-only, no dependencies)

Dark/light mode
    └──enhances──> All visual components (must be designed with CSS variables from start)

Responsive layout
    └──enhances──> Tweet Card UI, Profile section

SEO + Open Graph
    └──enhances──> All content pages (applied globally, not per-feature)

Timeline (reverse-chronological list)
    ├──requires──> Markdown-to-HTML rendering
    ├──requires──> YAML frontmatter parsing (date for sorting)
    └──requires──> Tweet Card UI (each post renders as a card)
```

### Dependency Notes

- **Timeline requires all three core rendering features:** The timeline is the aggregation layer. It needs Markdown rendering, frontmatter parsing (for dates to sort by), and the tweet card UI (for display). These three must be built together as a unit.
- **Relative timestamps require `date` frontmatter:** The date must be parsed from frontmatter before it can be displayed as a relative time. Build frontmatter parsing first.
- **Script-based post creation enhances mood:** The script's interactive mood selector makes mood emojis easy to add. Without the script, moods must be typed manually -- still functional but less polished.
- **Dark/light mode must be designed from the start:** Retrofitting dark mode after building all UI with hardcoded colors is painful. Define all colors as CSS custom properties from day one, even if only light mode values exist initially.
- **Mood emoji and dark mode are independent:** Can be built in any order. Both enhance visual components but don't depend on each other.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate the concept.

- [ ] **Markdown-to-HTML rendering (GFM)** -- Core function: posts must render. Without this, nothing else matters.
- [ ] **YAML frontmatter parsing** -- Required for date (sorting), mood (display), and post metadata. Enables every other feature.
- [ ] **Reverse-chronological timeline** -- The defining UX pattern. Posts sorted newest-first on a single page.
- [ ] **Tweet card UI (header + body)** -- The visual container: avatar, username, mood emoji, relative time, rendered Markdown body.
- [ ] **Relative timestamps** -- Human-readable time display in card headers. Critical for the "timeline" feel.
- [ ] **Profile section (avatar + bio)** -- Author identity. Required for the page to feel like a real profile.
- [ ] **Blurred Bing daily background** -- Visual differentiator. Low implementation cost, high visual impact.
- [ ] **Dark/light mode (system preference)** -- Must be designed from day one with CSS variables. Zero JS.
- [ ] **Responsive layout (desktop + mobile)** -- Must work on phones. Single-column on mobile.
- [ ] **Year/month directory structure** -- Content organization. Established before any real posts are written.
- [ ] **Vercel deployment pipeline** -- The delivery mechanism. Write -> push -> live.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Script-based post creation** -- Trigger: writing 5+ posts manually reveals the boilerplate pain. Automate when friction is felt.
- [ ] **SEO polish (meta tags, Open Graph)** -- Trigger: site is live and being shared. Link previews matter once the URL is public.
- [ ] **RSS/Atom feed** -- Trigger: someone asks "how do I subscribe?" Zero readers at launch means this is premature optimization.
- [ ] **Syntax highlighting for code blocks** -- Trigger: first technical post with code. Not needed for text-only posts.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Tag/category pages** -- Defer: mood emojis provide lightweight categorization. Build only if post volume makes filtering necessary.
- [ ] **Static search (pagefind)** -- Defer: Ctrl+F works for a single-user timeline with dozens of posts. Build when posts exceed ~100.
- [ ] **Pagination or infinite scroll** -- Defer: a single page with all posts works until post count causes performance issues (~200+ posts).
- [ ] **Image optimization pipeline** -- Defer: external URLs and manual image references work for v1. Build when local images become common.
- [ ] **Post permalink pages (one page per post)** -- Defer: single-page timeline is simpler for a personal archive. Build when individual post sharing is needed.
- [ ] **WebMention / IndieWeb support** -- Defer: requires a backend endpoint to receive mentions. Build only if federated interaction is desired.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Markdown-to-HTML rendering (GFM) | HIGH | LOW | P1 |
| YAML frontmatter parsing | HIGH | LOW | P1 |
| Reverse-chronological timeline | HIGH | LOW | P1 |
| Tweet card UI (header + body) | HIGH | MEDIUM | P1 |
| Relative timestamps | HIGH | MEDIUM | P1 |
| Profile section (avatar + bio) | HIGH | LOW | P1 |
| Blurred Bing daily background | MEDIUM | LOW | P1 |
| Dark/light mode (system preference) | MEDIUM | LOW | P1 |
| Responsive layout | HIGH | MEDIUM | P1 |
| Year/month directory structure | MEDIUM | LOW | P1 |
| Vercel deployment pipeline | HIGH | LOW | P1 |
| Script-based post creation | MEDIUM | MEDIUM | P2 |
| SEO basics (meta, OG) | MEDIUM | LOW | P2 |
| Mood emoji in card header | MEDIUM | LOW | P2 |
| RSS/Atom feed | LOW | MEDIUM | P3 |
| Syntax highlighting (code blocks) | LOW | MEDIUM | P3 |
| Tag/category pages | LOW | MEDIUM | P3 |
| Static search | LOW | HIGH | P3 |
| Pagination | LOW | MEDIUM | P3 |
| Post permalink pages | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (v1)
- P2: Should have, add when possible (v1.x, after validation)
- P3: Nice to have, future consideration (v2+)

## Competitor Feature Analysis

Competitors analyzed: personal static microblogs (microblog.pub, Timelino), Twitter-clone static generators (Nitter, Tweetic, static-timeline-generator), and modern blog table stakes (swyx's analysis).

| Feature | Typical Microblog | Twitter Clone (Nitter/Tweetic) | Our Approach (ViteX) |
|---------|-------------------|-------------------------------|----------------------|
| Content format | Markdown or HTML | API-sourced tweets | Markdown + YAML frontmatter |
| Timeline order | Reverse-chronological | Reverse-chronological | Reverse-chronological (same) |
| Post metadata | Title, date, tags, categories | Username, handle, timestamp, retweet/like counts | Username, date, mood emoji (simpler, emotional context) |
| Relative timestamps | Some have it (Hugo, Eleventy) | Yes (Twitter standard) | Yes (`Intl.RelativeTimeFormat`) |
| Mood/emoji tagging | Rare; some use `type` frontmatter with emoji indicators (Eleventy) | N/A (Twitter has no mood field) | First-class `mood` frontmatter field with interactive selector |
| Dark mode | Common (CSS `prefers-color-scheme`) | Common | Pure CSS, system preference only, no toggle |
| Content creation | `hugo new`, `jekyll post` script, or manual | N/A (reads API) | Custom script with mood selector + auto-timestamp + year/month dirs |
| Profile section | Standard (avatar, bio, links) | Standard (avatar, bio, stats) | Avatar + bio + blurred Bing daily background (differentiator) |
| Comments | WebMention, email links, or none | N/A | None (anti-feature) |
| Multi-user | Single-user (microblog.pub) or multi-user (Timelino) | Multi-user (reads Twitter) | Single-user only (core constraint) |
| Architecture | Static (Hugo, Zola, Eleventy) or self-hosted server (microblog.pub) | Server-rendered (Nitter) or static HTML (Tweetic) | Pure static via Vite, no server |
| Deployment | Git-push to Netlify/Vercel, or self-hosted | Self-hosted | Git-push to Vercel |
| Content organization | Flat with date filenames (Jekyll) or year/month folders (Astro) | N/A | Year/month folder structure |
| Search | Usually absent; some use pagefind or lunr.js | Built-in (Twitter search) | Deferred; Ctrl+F for v1 |

## Sources

- swyxio, "The Surprisingly High Table Stakes of Modern Blogs," GitHub Issue #443, 2022. https://github.com/swyxio/swyxdotio/issues/443 -- MEDIUM confidence (community consensus on blog table stakes)
- molly/static-timeline-generator, GitHub. https://github.com/molly/static-timeline-generator -- MEDIUM confidence (dedicated static timeline tool, 447 stars)
- zernonia/timelino, GitHub. https://github.com/zernonia/timelino -- MEDIUM confidence (Vue+Vite timeline platform, no comments by design)
- zedeus/nitter, DeepWiki. https://deepwiki.com/zedeus/nitter/3.2-timeline-and-profile-rendering -- MEDIUM confidence (open-source Twitter frontend rendering patterns)
- microblog.pub, sourcehut. https://sr.ht/~tsileo/microblog.pub/ -- MEDIUM confidence (single-user ActivityPub microblog, Markdown authoring)
- @github/relative-time-element, npm. https://www.npmjs.com/package/@github/relative-time-element -- HIGH confidence (GitHub's Web Component for static sites)
- MDN, `Intl.RelativeTimeFormat`. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat -- HIGH confidence (official web standard)
- MDN, `prefers-color-scheme`. https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme -- HIGH confidence (official web standard)
- gray-matter, npm. https://www.npmjs.com/package/gray-matter -- HIGH confidence (standard JS frontmatter parser)
- Stubble CLI, codeberg. https://codeberg.org/mysteryhouse/stubble -- MEDIUM confidence (dedicated post creation CLI for static sites)
- Jekyll post creation patterns. https://dev.to/codegaze/create-a-new-jekyll-post-with-a-simple-shell-command-4921 -- MEDIUM confidence (community patterns for script-based post creation)
- daylio-to-markdown, GitHub. https://github.com/Geronimoes/daylio-to-markdown -- MEDIUM confidence (mood-to-frontmatter conversion pattern)
- localghost.dev, "Building post types and category RSS feeds in Eleventy." https://localghost.dev/blog/building-post-types-and-category-rss-feeds-in-eleventy/ -- MEDIUM confidence (emoji-as-post-type-indicator pattern)
- Tyler Sticka, "My Own Little New Post CLI." https://tylersticka.com/journal/new-post-cli/ -- MEDIUM confidence (custom Node.js post creation script pattern)
- Astro-Paper, directory structure optimization. https://blog.gitcode.com/00102db8e5b7bee7bb0b08e200ac5361.html -- LOW confidence (year/month folder pattern for Astro)

---
*Feature research for: Personal Twitter-style timeline (Markdown-driven, single-user, static site)*
*Researched: 2026-05-02*

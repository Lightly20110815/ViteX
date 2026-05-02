# Pitfalls Research

**Domain:** Markdown-driven static personal timeline (Vite + Vercel)
**Researched:** 2026-05-02
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Bad Frontmatter Silently Breaks the Entire Build

**What goes wrong:**
A single malformed YAML frontmatter block in any Markdown tweet file causes the Vite build to fail with an opaque error. On Vercel, this means the entire site refuses to deploy — not just the broken tweet, but the whole timeline. The user has no CMS preview; they discover the failure only after `git push` when the Vercel deployment fails.

**Why it happens:**
There is no validation layer between writing a Markdown file and the build step. YAML is fragile — unquoted colons, trailing whitespace on `---` delimiters, or ambiguous boolean values (`mood: no` becomes `false`) silently corrupt frontmatter. The `gray-matter` parser throws a generic error that provides no filepath context unless explicitly wrapped.

**How to avoid:**
- Validate frontmatter in a pre-commit hook (simple Node script that parses each `.md` file with `gray-matter` and checks required fields exist with correct types).
- Wrap the build-time Markdown loader in try/catch per-file so one broken file does not abort the entire collection. Log the filepath and continue.
- The tweet creation script (TW-03) should validate its own output immediately after writing.
- Add a `npm run validate` script that runs before `npm run build` and in CI.

**Warning signs:**
- Build fails on Vercel with `YAMLException` and no filepath in the error message.
- Frontmatter values that should be strings come through as booleans (e.g., `false` instead of `"no"`).
- Tweets render with `undefined` for title/mood fields — indicates frontmatter key mismatch.

**Phase to address:**
Phase 1 (core tweet rendering). Validation must exist before any real content is written.

---

### Pitfall 2: Relative Time Hydration Mismatch on Every Tweet

**What goes wrong:**
Static generation bakes `"3 hours ago"` into the HTML at build time. When a visitor loads the page hours later, the server-rendered HTML says `"3 hours ago"` but the client-side JavaScript computes `"5 hours ago"`. React 18+ treats this as a hard hydration error (error #418), causing the timeline to re-render entirely on the client. The user sees a flash of old content followed by a jarring update.

**Why it happens:**
`Date.now()` at build time differs from `Date.now()` at page-load time. Static generation captures a snapshot; time is inherently dynamic. Every tweet card displays relative time, so the mismatch multiplies across the entire timeline.

**How to avoid:**
- **Store ISO 8601 timestamps in frontmatter** (e.g., `date: "2026-05-02T14:30:00+08:00"`). Never call `Date.now()` during rendering.
- **Compute relative time only on the client** using a `<RelativeTime>` component that renders a static ISO string on the server and swaps to computed relative time after mount via `useEffect`.
- Use the `<ClientOnly>` wrapper pattern with an ISO-date fallback that matches server output exactly.
- Alternatively, use `suppressHydrationWarning` on the `<time>` element as a deliberate escape hatch.
- The difference between build time and page load is universal for static sites; do not try to "solve" it — design around it by accepting that relative time is a client-only concern.

**Warning signs:**
- React 18 console error: `"Text content did not match. Server: '3 hours ago' Client: '5 hours ago'"`.
- Timeline "flickers" with old timestamps on first load.
- Every tweet on the page triggers a hydration warning.

**Phase to address:**
Phase 1 (TW-01, TW-02). Relative time rendering is part of the core tweet card component.

---

### Pitfall 3: Dark/Light Mode Flash of Inappropriate Theme (FOIT)

**What goes wrong:**
The static HTML is built with a default theme (typically light). When a user with `prefers-color-scheme: dark` loads the page, they see a blinding white flash before JavaScript executes, reads the system preference, and switches to dark mode. This is especially jarring for a personal site that the user visits frequently.

**Why it happens:**
Static generation has no access to the visitor's `prefers-color-scheme` media query or `localStorage`. The HTML is pre-built with one theme. The theme-switching JavaScript runs only after the page paints. The gap between first paint and theme application — even 50-100ms — is visibly jarring.

**How to avoid:**
- **Inject a blocking inline `<script>` in `<head>`** (before any CSS or body content) that reads `prefers-color-scheme` and sets a `data-theme` attribute on `<html>` synchronously, before first paint:
  ```html
  <script>
    (function() {
      var t = localStorage.getItem('theme');
      var isDark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    })();
  </script>
  ```
- Define all colors as CSS custom properties scoped to `[data-theme]` selectors. The blocking script runs before CSS is applied, so the correct variables are active from the very first paint.
- Since this project uses "system preference only" (no toggle), the localStorage check is optional but harmless. The `matchMedia` fallback handles the system preference case.
- Place this script in `index.html` directly (not in a JS bundle) so it executes before any module loading.

**Warning signs:**
- White flash on dark-mode systems during first load or hard refresh.
- "Flashbang effect" — entire page renders light, then instantly switches to dark.
- Lighthouse or PageSpeed reports CLS (Cumulative Layout Shift) from post-load style changes.

**Phase to address:**
Phase 1 (TW-06). Must be set up before the visual design is locked in.

---

### Pitfall 4: External Image Dependencies Break Silently

**What goes wrong:**
The avatar (`https://api.ddnsy.fun/avatar.webp`) and background (`https://bing.img.run/rand.php`) are external URLs with no uptime guarantee. Either can return 404, 500, timeout, or be blocked by CORS. When they fail: the avatar shows a broken image icon, the blurred background becomes a blank white/gray area, and there is no error reporting because the site is purely static.

Additionally, applying `filter: blur()` via CSS to the full-resolution Bing daily image (likely 1920x1080 or larger) forces the browser to decode a large image, scale it, then perform Gaussian blur on the full pixel area. On mobile (especially low-end Android), this can cause multi-second paint delays, white flashes, or the blur filter being silently disabled by the browser.

**Why it happens:**
No server-side proxy or image processing exists (pure frontend constraint). External URLs are trusted implicitly. CSS `filter: blur()` is applied to an unoptimized image at full resolution. No fallback strategy exists for image loading failures.

**How to avoid:**
- **Background image:** Pre-process to a smaller resolution (e.g., 800px wide) at build time or use a CDN transform parameter if available. Consider using a CSS `background-color` fallback that matches the average color of the expected image. Use the `::before` pseudo-element pattern to apply `filter: blur()` on a separate compositing layer:
  ```css
  .profile-bg::before {
    content: "";
    position: absolute;
    inset: -10px;
    background-image: url("https://bing.img.run/rand.php");
    background-size: cover;
    filter: blur(8px);
    z-index: -1;
    transform: translateZ(0); /* GPU layer */
  }
  ```
- **Avatar:** Add `onerror` handler to replace broken images with a fallback (initials, placeholder SVG, or a static fallback URL). Set explicit `width`/`height` on the `<img>` to prevent CLS when the image fails.
- **Both:** Add `loading="lazy"` for below-fold images. Include `decoding="async"` to avoid blocking the main thread during paint.
- **At build time:** Prefer downloading and bundling the avatar as a static asset. The Bing background must remain external (it changes daily), but use a cached fallback and a solid background color for when it fails.

**Warning signs:**
- Page layout shifts when the avatar fails to load and the `<img>` collapses to 0x0 (no explicit dimensions).
- Background appears as solid white/gray (external URL returned 404/500).
- Mobile page takes 3+ seconds to first paint (CSS blur on large image blocking render).
- Safari/Chrome silently disables `backdrop-filter` or `filter: blur()` on certain DOM structures.

**Phase to address:**
Phase 1 (TW-05). Profile section with avatar and background is a visual centerpiece; image robustness must be built in from the start.

---

### Pitfall 5: Git-Driven Content Workflow With Zero Validation

**What goes wrong:**
The only path to production is `git push`. There is no staging environment, no preview deploy, and no content validation before push. A bad Markdown file pushed to the repository triggers a Vercel build that fails. The user discovers this after pushing — the site is either broken (showing the previous successful deploy) or fails to deploy entirely. With no CMS preview, every content mistake is a production mistake.

**Why it happens:**
The workflow is intentionally minimal (write file, push, deploy), but "minimal" does not need to mean "no validation." The absence of pre-commit hooks or CI checks means structural errors (malformed YAML, missing required fields, broken relative links) are not caught until the build fails on Vercel.

**How to avoid:**
- **Pre-commit hook (simple):** A shell script or Node script in `.git/hooks/pre-commit` that runs `gray-matter` on all staged `.md` files and exits non-zero if any fail to parse. Provide a clear error message with the filename and line.
- **CI check (optional but recommended):** A GitHub Action (or Vercel's own build step) that runs `npm run validate` before `npm run build`. This catches issues earlier than the build step.
- **Tweet creation script (TW-03) as validation gate:** The script that generates new tweet files should validate the output immediately. If the generated frontmatter is invalid, it should not write the file.
- **Per-file error handling at build time:** The Vite plugin that loads Markdown files should wrap each file's parsing in try/catch, log errors with filenames, and skip broken files rather than aborting the entire build. A "partial deploy" with one tweet missing is far better than a failed deploy with zero tweets.

**Warning signs:**
- Vercel deploy fails with no indication of which file caused the problem.
- New tweet file written by the creation script has unexpected frontmatter values (e.g., boolean instead of string).
- User habitually types `git push --force` to retry after fixing content errors (sign of build-failure-by-content pattern).

**Phase to address:**
Phase 1 (TW-03). The tweet creation script is the natural validation choke point because all content passes through it.

---

### Pitfall 6: Growing Content Collection Degrades Build Performance

**What goes wrong:**
At 10 tweets, the Vite build takes 3 seconds. At 500 tweets, it takes 30+ seconds. At 2000 tweets, it hits Vercel's build timeout or causes OOM (out-of-memory) errors during static generation. The Markdown-to-HTML pipeline has O(n) complexity, and since every tweet is processed at every build, build time scales linearly with content volume. Vercel's hobby plan has a 45-minute build timeout, but the practical limit for good DX is under 2 minutes.

**Why it happens:**
Static generation re-processes every Markdown file on every build — even files that have not changed. There is no incremental build or caching of previously rendered HTML. Memory consumption grows as all posts are held in memory simultaneously during collection.

**How to avoid:**
- **This is not a Phase 1 concern** — the user is a single person and will not reach 500+ tweets before this is addressed.
- **Phase for addressing:** When tweets exceed ~200, introduce caching: hash each Markdown file's content and store the rendered HTML. On rebuild, skip files whose hash has not changed (incremental static generation pattern).
- Consider **paginating** the timeline (e.g., 50 tweets per page) rather than rendering all tweets on a single page. This reduces both build memory and client bundle size.
- For the Vite plugin: avoid `glob` + `readFileSync` in a loop on every build. Cache file metadata (timestamps) and only re-read changed files.
- Vercel-specific: ensure `node_modules` caching is enabled in `vercel.json`:
  ```json
  { "buildCommand": "npm run build", "installCommand": "npm install" }
  ```

**Warning signs:**
- Build time increases visibly with every ~50 new tweets.
- `FATAL ERROR: JavaScript heap out of memory` during Vite build on Vercel.
- Dev server HMR takes >2 seconds to reflect a single Markdown file change.

**Phase to address:**
Phase 3+ (optimization). Not urgent until content volume grows.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding tweet count in the UI ("Showing N tweets") | No need to compute from collection | Manually updating a constant; drifts from reality | Never — derive from the collection dynamically |
| Using `new Date().toISOString()` in frontmatter script with no timezone offset | "It works on my machine" | All timestamps are in local time without offset; ambiguous across machines/timezones | Never — always include timezone offset (`+08:00`) |
| Skipping `width`/`height` on `<img>` tags | Faster to write markup | Cumulative Layout Shift on every image; bad Core Web Vitals; ugly load experience | Never — use explicit dimensions or `aspect-ratio` |
| Importing all Markdown files into a single monolithic virtual module | Simple implementation, one `import` to rule them all | HMR degrades to full page reload; dev experience becomes unusable at ~100+ files | Only for initial prototype (Phase 1); refactor before content exceeds ~50 tweets |
| `display: none` for dark-mode content | Quick way to hide light-mode elements in dark mode | Content invisible to screen readers and SEO crawlers; violates accessibility | Never — use CSS custom properties to control colors, not visibility |
| Relative paths for Vite `base` config (`base: './'`) | Works in local dev and some hosts | Breaks asset loading on Vercel for nested routes; causes MIME type errors | Never for Vercel — use `base: '/'` |
| Writing frontmatter by hand without a schema | No tooling overhead initially | Frontmatter field names drift (`mood` vs `mood_emoji` vs `emotion`); rendering code breaks silently | Never after Phase 1 — define a Zod schema and validate |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Vercel static deployment** | Relying on Vite's dev proxy (`server.proxy`) for API requests in production | Vite's proxy only works in dev. For static sites with no backend, there is no proxy needed. If future phases add API calls, use `vercel.json` rewrites. |
| **Vercel Auto Minify** | Leaving it enabled (default) for SSG builds | Vercel's Auto Minify can alter HTML in ways that break SSG hydration. Disable it in Vercel project settings under Speed > Auto Minify. |
| **Vite `import.meta.glob`** | Using `as: 'raw'` and manually parsing frontmatter in a loop at import time | Use `gray-matter` inside each file's loader, not at the aggregation layer. Let Vite's built-in glob import do the heavy lifting of lazy loading. |
| **Bing daily image API** | Directly using the redirect URL as a CSS `background-image` without considering CORS or content-type headers | The image may be served with incorrect headers or redirect chains. Test with `curl -I` on the resolved URL first. Use a `<img>` tag with `crossorigin="anonymous"` if CORS is needed for canvas manipulation. |
| **Vercel build environment** | Expecting Node.js built-in modules or filesystem access at runtime in a pure static build | There is no runtime. Everything happens at build time. All data must be inlined into static assets. The `fs` module is only available in Vite plugin code, not in browser code. |
| **`gray-matter` + Vite** | Using `gray-matter` in client-side code (it depends on `fs`) | `gray-matter` is build-time only. The client receives parsed frontmatter as static JSON/props. Never import it in a component file. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering all tweets on one page | Scroll performance degrades; initial HTML payload grows to megabytes; Vercel bandwidth costs increase | Paginate or use virtual scrolling; render 50 tweets per page max | ~200-300 tweets |
| CSS `filter: blur(20px)` on 1920px Bing image | First paint delayed 2-5 seconds on mobile; Safari/Chrome may silently disable the filter | Reduce blur radius to 8px max; pre-scale the served image; use the `::before` pseudo-element pattern with `transform: translateZ(0)` | Mobile devices, low-end Android, iOS with Reduce Transparency enabled |
| Loading all tweet data at page load (single JSON bundle) | JSON file grows linearly with tweet count; parse time blocks the main thread | Split tweets by year/month into separate JSON files; load only the visible page's data | ~500 tweets / 200KB JSON payload |
| `import.meta.glob` with `eager: true` for all Markdown files | Every tweet is loaded into memory at build time and bundled; memory spikes; Vercel build OOM | Use `eager: false` for lazy evaluation; only load what's needed for the current page at build time | ~1000+ tweet files |
| No Vercel build cache configuration | `node_modules` re-installed from scratch on every deploy; adds 30-60 seconds to every build | Ensure `installCommand` is set and Vercel caches `node_modules` by default; use `vercel.json` for explicit cache control | Every deploy after initial setup |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering raw Markdown HTML without sanitization | XSS via `<script>` tags embedded in tweet Markdown body | Use `rehype-sanitize` in the Markdown processing pipeline. Even though the content is self-authored, a compromised or accidentally pasted payload could execute in the browser. |
| Exposing frontmatter values in HTML data attributes | Leaking metadata that should remain private (future: draft status, sensitive notes) | Be intentional about which frontmatter fields are rendered client-side. Filter frontmatter at build time before injecting into HTML. |
| Blindly trusting external image URLs | The Bing background URL could be hijacked or redirected to malicious content; the user's browser loads it directly | Validate the resolved image URL at build time (check Content-Type header); consider proxying through a CDN or image optimization service. |
| No CSP (Content Security Policy) headers | Since there is no backend to set HTTP headers, the static site has no CSP | Set CSP via `<meta http-equiv="Content-Security-Policy">` in `index.html`. Since this is a display-only site with no user input forms, a strict CSP is easy to define. |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Tweets with no visible timestamp | Reader has no context for when content was posted; timeline loses its "journal" quality | Always show relative time; show absolute time on hover/tap (title attribute or tooltip) |
| Monospace/stale typography for tweet body | Feels like reading documentation, not a personal feed | Use a readable sans-serif or serif font for tweet body; reserve monospace for code blocks only |
| No loading state for images | Avatar or background pops in after load; layout jumps | Provide a solid color placeholder matching the expected image; use `aspect-ratio` for the avatar container |
| No "empty state" for new installations | Bare timeline with zero tweets looks like a broken page | Show a friendly "No tweets yet — write your first one!" message with a link to the creation script |
| Timestamps that say "0 seconds ago" | Looks buggy or cheap | Round up to "just now" for anything under 30 seconds |
| No hover/focus states on tweet cards | Timeline feels like static text, not an interactive feed | Add subtle hover elevation or highlight; ensures keyboard users can see which card has focus |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Relative time display:** Often missing — the timestamp shows absolute ISO date because the client-side formatting never runs. Verify the component mounts and updates after hydration.
- [ ] **Dark mode:** Often missing — implemented as a CSS class toggle that only works after page load, causing a visible flash. Verify the blocking inline `<script>` in `<head>` fires before first paint.
- [ ] **Markdown rendering:** Often missing — frontmatter parses but the body renders as raw Markdown text (bold asterisks visible, links not clickable). Verify a Markdown-to-HTML library is in the pipeline.
- [ ] **Responsive layout:** Often missing — timeline cards are full-width on mobile but the font size, padding, and avatar size are not adjusted. Verify with actual mobile viewport testing.
- [ ] **Build-time validation:** Often missing — the site builds and deploys successfully with zero tweets, but adding a single malformed tweet breaks everything. Verify by intentionally creating a tweet with bad YAML and confirming the build handles it gracefully.
- [ ] **Vercel rewrites:** Often missing — the site works on `localhost` but navigating to a subpage on Vercel returns 404. Verify `vercel.json` exists with SPA rewrite rules.
- [ ] **`<meta>` tags and social preview:** Often missing — tweeting a link to the site shows no preview card (no og:image, no og:title). Verify Open Graph tags are present in `index.html`.
- [ ] **Favicon:** Often missing — the browser tab shows the default Vite or Vercel favicon. Verify a custom favicon is in `/public/`.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Bad frontmatter breaks build | LOW | Find the offending file via local `npm run validate`; fix the YAML; push. Build succeeds on next deploy. |
| Hydration mismatch on timestamps | LOW | Wrap relative time in `<ClientOnly>` or add `suppressHydrationWarning`. Deploy fix. No data migration needed. |
| Dark mode flash | LOW | Add blocking inline script to `index.html`. Deploy. Immediate fix on next page load. |
| External image 404/500 | MEDIUM | The broken image is cached in visitors' browsers. After fixing: add a cache-busting query param to the URL; add `onerror` fallback; deploy. Visitors may need a hard refresh. |
| Growing content slows builds | MEDIUM | Paginate timeline (50 tweets per page); add file-content hashing for incremental builds. This is a feature change, not a quick fix. |
| React 18 hydration hard error on entire timeline | HIGH | If `suppressHydrationWarning` is applied to every tweet card, the entire page re-renders from scratch on the client. This effectively turns the static site into a client-rendered SPA, losing all SSG benefits. Must redesign the time display approach. |
| Vercel build timeout from too many tweets | HIGH | Requires architectural change: split build into multiple pages; add caching; or move to incremental static generation pattern. May need to split the project into multiple Vercel projects or use a different hosting strategy. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Bad frontmatter breaks build | Phase 1 | Run `npm run validate` on a known-bad Markdown file; confirm script exits non-zero with filename in error |
| Relative time hydration mismatch | Phase 1 | Load the site; check browser console for zero hydration errors; verify timestamp shows "just now" or relative time |
| Dark/light mode flash | Phase 1 | Open Chrome DevTools; set `prefers-color-scheme: dark` in Rendering tab; hard-refresh; confirm no white flash appears |
| External image reliability | Phase 1 | Disconnect network in DevTools; reload; confirm avatar shows fallback and background shows solid color |
| Git-driven workflow without validation | Phase 1 | Commit and push a deliberately broken Markdown file; confirm pre-commit hook blocks the commit with a clear error |
| Growing content degrades build | Phase 3 | Monitor build time trend; trigger refactor when build exceeds 60 seconds |
| No CSP headers | Phase 2 | Check Response Headers in DevTools for `Content-Security-Policy` meta tag |
| Vite HMR full-reload on Markdown change | Phase 1 | Edit a single tweet Markdown file; confirm the browser updates only that tweet card, not the entire page |

## Sources

- Vite + Vercel deployment pitfalls: StackOverflow discussions on base path, MIME type errors, SPA rewrites, and build directory mismatches — [vercel/vite tag](https://stackoverflow.com/questions/tagged/vercel+vite)
- Vercel community: Static build skipped issues, Auto Minify causing hydration mismatches, environment variable build-time behavior — [Vercel Community](https://community.vercel.com/)
- Markdown frontmatter YAML pitfalls: University of Cambridge DNS site on YAML/Markdown type coercion (the "Norway Problem"); gray-matter vs front-matter npm comparison; YAML trailing whitespace delimiter bugs
- Dark mode FOUT solutions: Material UI Joy UI `getInitColorSchemeScript()`; blocking inline script patterns; `prefers-color-scheme` with CSS custom properties
- Relative time hydration: Next.js GitHub discussion #37877 on client/server date mismatches; Builder.io "Fast and Light Relative Time Strings in JS"; React 18 hydration error #418
- Image handling: CSS `backdrop-filter` vs `filter: blur()` performance on MDN; Cloudinary/imgix static site image optimization guides; LQIP blur placeholder techniques
- Git-driven content validation: GitHub Docs custom markdownlint rules (50+ rules); `git diff --exit-code` as CI gate; pre-commit hook patterns for YAML validation
- Vite virtual module HMR: Vite GitHub discussion #15504 on targeted invalidation; `addWatchFile` / `handleHotUpdate` API patterns; Astro PR #9956 fixing HMR with content collections

---
*Pitfalls research for: Markdown-driven static personal timeline (Vite + Vercel)*
*Researched: 2026-05-02*

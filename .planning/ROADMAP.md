# Roadmap: ViteX

## Overview

ViteX ships in two phases. Phase 1 delivers the core product: a single-page Twitter-style personal timeline that renders Markdown tweets into a beautiful, responsive feed with profile section, dark/light mode, and relative timestamps -- all built at deploy time, zero runtime dependencies beyond the formatted output. Phase 2 adds the creation workflow and ships to production: an interactive CLI script for authoring new tweets with frontmatter validation, plus automated Vercel deployment on git push with SEO-ready meta tags. After Phase 2, the author writes Markdown, pushes to git, and the timeline is live.

## Phases

- [ ] **Phase 1: Core Timeline** -- Tweets render on screen: build pipeline, tweet cards, profile, dark mode, responsive layout
- [ ] **Phase 2: Creation and Deployment** -- Interactive tweet creation script, Vercel deployment on git push, SEO meta tags

## Phase Details

### Phase 1: Core Timeline
**Goal**: A single-page static site renders all Markdown tweets from `content/tweets/` in reverse-chronological order, with tweet cards displaying username/mood/relative-time headers and formatted Markdown bodies, a profile section with avatar/bio/blurred-Bing-background, system-respecting dark/light mode with no flash, and responsive layout.

**Depends on**: Nothing (first phase)

**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, TIME-01, TIME-02, TIME-03, TIME-04, PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06

**Success Criteria** (what must be TRUE):
  1. The built site renders all Markdown tweets from `content/tweets/` in reverse-chronological order.
  2. Each tweet card displays the username "Sy," the post's mood emoji, and a Chinese-locale relative timestamp (e.g., "3小时前") in the top bar, with the Markdown body rendered as formatted HTML below.
  3. The profile section shows the avatar image (with a visible fallback when the network is unavailable), displays the bio text with emoji rendering, and presents a blurred Bing daily image as the background, with a solid color visible before the image loads or if it fails.
  4. The page renders correctly whether the system is in light or dark mode, with no visible flash of wrong theme on first paint, and the layout adapts to both desktop and mobile viewports.
  5. A tweet file with intentionally malformed YAML frontmatter does not crash the build -- the site still deploys, with the broken file skipped and a warning logged.

**Plans**: 4 plans in 3 waves

Plans:
- [ ] 01-01-PLAN.md -- Project scaffold, TypeScript types, profile data, sample tweet (wave 1)
- [ ] 01-02-PLAN.md -- CSS design system (glassmorphism, dark/light mode, responsive) + Profile component (wave 2)
- [ ] 01-03-PLAN.md -- Vite build pipeline (custom plugin, gray-matter, marked, highlight.js) (wave 2)
- [ ] 01-04-PLAN.md -- Timeline rendering (glob loader, TweetCard, Timeline, main entry point) (wave 3)

**UI hint**: yes

### Phase 2: Creation and Deployment
**Goal**: The author can create new tweets via an interactive CLI script that generates properly structured Markdown files, and the site automatically deploys to Vercel on git push with rich link previews when shared on social platforms.

**Depends on**: Phase 1

**Requirements**: CREA-01, CREA-02, CREA-03, DEPL-01, DEPL-02, DEPL-03

**Success Criteria** (what must be TRUE):
  1. Running the tweet creation script interactively prompts the user to select a mood emoji (with common options and custom input) and generates a new Markdown file at `content/tweets/YYYY/MM/` with an auto-generated ISO timestamp in the YAML frontmatter.
  2. Pushing a commit to the main branch triggers an automatic Vercel build that deploys the site to a live URL without manual intervention.
  3. The deployed site's HTML source includes title, description, and Open Graph image meta tags, producing a rich link preview when the URL is shared on social or messaging platforms.

**Plans**: 4 plans in 3 waves

Plans:
- [ ] 01-01-PLAN.md -- Project scaffold, TypeScript types, profile data, sample tweet (wave 1)
- [ ] 01-02-PLAN.md -- CSS design system (glassmorphism, dark/light mode, responsive) + Profile component (wave 2)
- [ ] 01-03-PLAN.md -- Vite build pipeline (custom plugin, gray-matter, marked, highlight.js) (wave 2)
- [ ] 01-04-PLAN.md -- Timeline rendering (glob loader, TweetCard, Timeline, main entry point) (wave 3)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Timeline | 0/TBD | Not started | - |
| 2. Creation and Deployment | 0/TBD | Not started | - |

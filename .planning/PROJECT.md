# ViteX

## What This Is

A pure frontend, single-user Twitter-style personal timeline. Posts are written locally as Markdown files with frontmatter metadata, versioned with git, and auto-deployed to Vercel as a static site. Write → push → live, no backend.

**Target user:** Sy (personal use)

## Core Value

Write posts in Markdown and see them rendered in a beautiful Twitter-style timeline with zero friction — create file, git push, live on Vercel.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **TW-01**: Tweet cards display username (Sy), mood emoji, and relative time in a top bar
- [ ] **TW-02**: Tweet body renders Markdown content (text, bold, links, etc.)
- [ ] **TW-03**: Script generates new tweet Markdown files with auto-timestamp and interactive mood emoji selector
- [ ] **TW-04**: Tweets organized in year/month directory structure
- [ ] **TW-05**: Profile section with avatar, bio, and blurred Bing daily background image
- [ ] **TW-06**: UI follows system light/dark mode preference
- [ ] **TW-07**: Static site builds and deploys to Vercel on git push
- [ ] **TW-08**: Responsive layout for desktop and mobile

### Out of Scope

- Multi-user support — single user only
- Comments, likes, retweets — display-only timeline
- Backend/database — pure static generation
- OAuth/login — no authentication needed
- Real-time updates — git push triggers redeploy

## Context

- **Stack:** Vite (per project name "ViteX"), pure frontend static site
- **Content format:** Markdown files with YAML frontmatter for metadata
- **Deployment:** Vercel (git-push-driven)
- **Content workflow:** Open VSCode → script creates new tweet file → write/edit → git push → live
- **Time format:** Relative timestamps (within a week shows "X days ago", within a day shows "X hours/minutes ago")

## Profile

- **Username:** Sy
- **Bio:** 🏳️‍⚧️「重构时间线，再次重逢」 | 是夕妍？ | INFP | MtFtX | oler转oder | 🎂08.15 | Vite | Cpp | HRT 25.08.11~25.11.30 26.04.17~
- **Avatar:** https://api.ddnsy.fun/avatar.webp
- **Cover:** None
- **Background:** https://bing.img.run/rand.php (CSS blur applied)

## Constraints

- **Pure frontend:** No backend, no database, no API routes
- **Static generation:** All pages pre-built at deploy time; Markdown → HTML at build time
- **Single user:** No auth, no multi-tenant, no user management
- **Git-driven:** Content changes only via git push; no CMS or admin panel
- **Vercel hosting:** Must work within Vercel's static site constraints

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite as build tool | Project name "ViteX", fast static builds, Markdown via vite plugin | — Pending |
| Year/month folder structure for tweets | Keep files organized as tweet count grows | — Pending |
| Frontmatter for tweet metadata | Clean separation of metadata (mood, time) from Markdown body | — Pending |
| Script-based tweet creation | Automates timestamp + mood selection, consistent frontmatter | — Pending |
| System preference for dark/light mode | No toggle needed, respects user's OS setting | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-02 after initialization*

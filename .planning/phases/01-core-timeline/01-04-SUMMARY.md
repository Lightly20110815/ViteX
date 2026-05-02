# 01-04 SUMMARY: Timeline Rendering & Entry Point

**Plan:** 01-core-timeline/01-04
**Tasks:** 3/3 complete
**Status:** Done

## Deliverables

| File | Purpose |
|------|---------|
| `src/data/tweets.ts` | import.meta.glob loader, reverse-chronological sort |
| `src/utils/time.ts` | dayjs relative time with zh-cn locale |
| `src/components/TweetCard.ts` | Single tweet card DOM factory |
| `src/components/Timeline.ts` | Timeline container with empty state |
| `src/main.ts` | Application entry point |

## Key Decisions Implemented
- TIME-01: Tweet card renders username "Sy", mood emoji, relative time in top bar
- TIME-02: Body renders pre-rendered Markdown HTML via innerHTML on sanitized content
- TIME-03: Reverse-chronological sort (newest first) via Date().getTime()
- TIME-04: Chinese relative time: "刚刚" for <30s, dayjs.fromNow() for older

## Self-Check: PASSED
- TypeScript compiles clean
- Vite build produces working index.html + bundled JS/CSS
- dayjs included in client bundle (7KB gzip)
- Build-time libraries excluded (gray-matter, marked, highlight.js)
- Empty state renders "还没有推文。" when no tweets exist
- Footer shows "Powered by ViteX · 2026"
- Username and mood use textContent (XSS safe)

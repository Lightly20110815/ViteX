# ViteX

Personal Twitter-style timeline. Markdown-driven pure frontend static site, Vite + Vercel.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run deploy` — Build and push to Vercel

## Architecture

Static site with build-time Markdown processing:
- `content/tweets/YYYY/MM/*.md` — Tweet content (YAML frontmatter + Markdown body)
- Custom Vite plugin discovers and pre-renders all tweets at build time
- No framework — vanilla TypeScript with DOM factory functions
- Pico.css for styling with system dark/light mode

## Planning

See `.planning/` for GSD project context, requirements, and roadmap.

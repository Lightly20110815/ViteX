# ViteX — 8 UI Design Variants Comparison

**Created:** 2026-05-03 00:22–00:34
**Method:** Each variant researched via ui-ux-pro-max, designed with unique layout, typography, and visual language

---

## Quick Comparison

| # | Name | Layout | Fonts | Colors | Dark Mode | Best For |
|---|------|--------|-------|--------|-----------|----------|
| 1 | Neon Noir | Single column centered | Space Grotesk + Noto Sans SC | Deep navy + purple/cyan neon | Dark-only | Tech-forward personal brand |
| 2 | Swiss Grid | 2-col sidebar + content | Inter | Zinc monochrome + blue | ✓ Light+Dark | Clean professional portfolio |
| 3 | Wabi-Sabi | Single column organic | Lora + Raleway + Serif JP | Warm cream + sage green + gold | ✓ Light+Dark | Artistic, warm personal blog |
| 4 | Bento Gallery | CSS Grid modular tiles | Inter | Multi-color accents per card | ✓ Light+Dark | Feature-rich personal dashboard |
| 5 | Brutalist Bold | Full-width raw grid | Space Mono | Pure B&W | ✓ Light+Dark | Dev portfolio, anti-design statement |
| 6 | Film Memory | Timeline rail (journal) | Abril Fatface + Merriweather | Sepia + amber + burgundy | ✓ Light+Dark | Nostalgic journal, photography |
| 7 | Liquid Glass | Single col glass layers | Varela Round + Nunito | Pink/gold gradient + glass | ✓ Light+Dark | Premium creative, luxury brand |
| 8 | Ink Studio | 2-col editorial (sticky rail) | Space Grotesk + Archivo | Warm paper + gold accent | ✓ Light+Dark | Editorial, writing-focused |

## Detailed Analysis

### 1. Neon Noir (暗夜霓虹) ★★★★
- **Mood:** Futuristic, confident, tech-native
- **Strengths:** Strong visual identity, memorable neon accents, dynamic background gradients
- **Weaknesses:** May fatigue readers over time, not suitable for long-form content
- **Unique feature:** Floating gradient orbs + CSS grid overlay + animated purple/cyan gradients
- **Best match for Sy:** High — tech identity (Vite, Cpp) aligns with futuristic aesthetic

### 2. Swiss Grid (瑞士网格) ★★★
- **Mood:** Clean, rational, professional
- **Strengths:** Excellent readability, timeless, accessible by default
- **Weaknesses:** Can feel cold/impersonal, lacks emotional warmth
- **Unique feature:** Asymmetrical two-column grid layout with border-based visual hierarchy
- **Best match for Sy:** Medium — professional but may feel too corporate

### 3. Wabi-Sabi (侘寂和紙) ★★★★★
- **Mood:** Warm, organic, handcrafted, serene
- **Strengths:** Unique personality, emotionally resonant, beautiful typography
- **Weaknesses:** More complex CSS (texture overlays, organic shapes)
- **Unique feature:** CSS noise texture, alternating card border-radius, kintsugi gold lines
- **Best match for Sy:** Very High — INFP personality, MtFtX journey, personal timeline feels right here

### 4. Bento Gallery (本顿画廊) ★★★
- **Mood:** Playful, modern, dashboard-like
- **Strengths:** Information-rich, visually engaging, Apple-style polish
- **Weaknesses:** Better for dashboards than timelines, may overwhelm with structure
- **Unique feature:** Multi-size CSS grid cards with color-coded accent borders

### 5. Brutalist Bold (粗野宣言) ★★★
- **Mood:** Raw, unapologetic, bold
- **Strengths:** Memorable, distinctive, loads instantly
- **Weaknesses:** Can be hard to read, polarizing aesthetic
- **Unique feature:** 4px solid borders, monospace everything, grayscale images, hover inversion

### 6. Film Memory (胶片记忆) ★★★★
- **Mood:** Nostalgic, romantic, artistic
- **Strengths:** Beautiful atmosphere, polaroid image treatment, timeline rail
- **Weaknesses:** Heavier fonts, grain overlay impacts performance slightly
- **Unique feature:** Drop cap first letters, CSS film grain, polaroid-style images with rotation, numbered timeline

### 7. Liquid Glass (流光玻璃) ★★★★
- **Mood:** Premium, ethereal, dreamy
- **Strengths:** Stunning visual effects, iridescent borders, modern luxury feel
- **Weaknesses:** backdrop-blur performance, complex gradient backgrounds
- **Unique feature:** Floating gradient orbs, depth-layered glass cards, iridescent hover borders

### 8. Ink Studio (墨色工作室) ★★★★
- **Mood:** Editorial, sophisticated, writer-focused
- **Strengths:** Excellent for text-heavy content, beautiful date numerals, sticky navigation
- **Weaknesses:** Two-column layout loses some intimacy
- **Unique feature:** Oversized date numerals (48px), sticky left rail with navigation, editorial grid

## Recommended Picks for Sy

**Top 3 matches** (considering Sy's profile: INFP, MtFtX, coder, personal timeline):

1. **Wabi-Sabi** — The organic warmth and Japanese aesthetic perfectly match the personal, introspective nature of a personal timeline
2. **Neon Noir** — The tech identity (Vite, Cpp) expressed through futuristic design
3. **Film Memory** — The journal-like timeline with dated entries feels right for a personal archive

**Runner-up:** Ink Studio — if writing quality and typography are the priority

## Implementation Status

| Variant | CSS | HTML | Runnable |
|---------|-----|------|----------|
| 1 Neon Noir | ✓ | ✓ | ✓ |
| 2 Swiss Grid | ✓ | ✓ | ✓ |
| 3 Wabi-Sabi | ✓ | ✓ | ✓ |
| 4 Bento Gallery | ✓ | ✓ | ✓ |
| 5 Brutalist | ✓ | — | — |
| 6 Film Memory | ✓ | — | — |
| 7 Liquid Glass | ✓ | — | — |
| 8 Ink Studio | ✓ | — | — |

## How to Apply

Each variant in `.planning/design-variants/` has its own `styles.css`. To apply:
1. Copy the variant's `styles.css` → `src/styles.css`
2. Copy the variant's `index.html` → project root (if layout differs)
3. Adjust `src/main.ts` if DOM structure changed
4. Run `npx vite build` to verify

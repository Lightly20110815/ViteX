# ViteX UI Design Variants — Complete Research

**Started:** 2026-05-03 00:23
**Goal:** 8 complete design systems, each with full CSS implementation
**Method:** Each variant receives 20+ minutes of focused design work

---

## Variant Matrix

| # | Name | Mood | Light/Dark | Typography | Accent | Complexity |
|---|------|------|-----------|------------|--------|------------|
| 1 | Neon Noir | Cyberpunk-minimal | Dark-only | Space Grotesk + Noto Sans SC | Neon Purple #7C3AED | High |
| 2 | Swiss Minimal | Clean, professional | Light-first | Inter + Noto Sans SC | Blue #2563EB | Low |
| 3 | Wabi-Sabi | Organic, warm | Light-first | Lora + Raleway | Green #15803D | Medium |
| 4 | Bento Gallery | Playful, modular | Light-first | Inter | Orange #F97316 | High |
| 5 | Brutalist Bold | Raw, bold | Dark-only | Space Mono | None (B&W) | Medium |
| 6 | Film Memory | Nostalgic, warm | Light-first | Abril Fatface + Merriweather | Amber #D97706 | High |
| 7 | Liquid Glass | Premium, ethereal | Light-first | Varela Round + Nunito | Pink #DB2777 + Gold #CA8A04 | High |
| 8 | Ink Studio | Editorial, stark | Dark-first | Archivo + Space Grotesk | Minimal gold #D4AF37 | Medium |

## Research Notes Per Direction

### 1. Neon Noir (暗夜霓虹)
- **Source:** Retro-Futurism style search
- **Background:** #0F0F23 deep navy-black + subtle gradient
- **Cards:** Semi-transparent dark glass with neon border glow
- **Typography:** Space Grotesk headings (geometric, futuristic), Noto Sans SC body
- **Accent:** Purple (#7C3AED) + Cyan (#06B6D4) dual accent
- **Effects:** Subtle text-shadow glow on headings, card border hover glow
- **Reference:** synthwave aesthetic, but toned down for readability
- **Key rule:** Never overwhelm — neon is accent, not background

### 2. Swiss Minimal (瑞士极简)
- **Source:** Minimal Swiss typography search
- **Background:** #FAFAFA light, #0A0A0A dark
- **Cards:** Subtle white cards with 1px border, no shadow (flat)
- **Typography:** Inter exclusively — weight hierarchy drives all visual interest
- **Accent:** Single blue #2563EB, used only for links
- **Effects:** No decorative effects — pure typography and spacing
- **Reference:** Swiss International Style, Helvetica-era posters
- **Key rule:** Everything must have a functional purpose

### 3. Wabi-Sabi (侘寂和纸)
- **Source:** Organic Biophilic + Japanese typography searches
- **Background:** Warm cream #FEFCF5, textured (CSS pattern)
- **Cards:** Rounded 16-24px, subtle warm shadows, natural feel
- **Typography:** Lora (serif) headings, Raleway body, Noto Serif JP for decorative
- **Accent:** Sage green #15803D + soft pink #EC4899
- **Effects:** CSS-generated paper texture, organic border-radius variations
- **Reference:** Japanese tea houses, washi paper, kintsugi gold
- **Key rule:** Imperfection is beauty — avoid perfect symmetry

### 4. Bento Gallery (本顿画廊)
- **Source:** Bento Box Grid style search
- **Background:** #F5F5F7 Apple-gray light, #1C1C1E dark
- **Layout:** CSS Grid with varied card spans (2x2, 1x2, 2x1)
- **Cards:** Rounded-xl 16px, subtle shadow, hover scale(1.02)
- **Typography:** Inter medium headings, regular body
- **Accent:** Multiple soft colors — blue, orange, green, purple — one per card type
- **Effects:** Staggered reveal animation, hover lift with shadow
- **Reference:** Apple.com product pages, dashboard card layouts
- **Key rule:** Information density through layout, not text density

### 5. Brutalist Bold (粗野宣言)
- **Source:** Brutalist style + Space Mono typography
- **Background:** Pure black #000000, or pure white #FFFFFF
- **Cards:** Raw borders (2-3px solid), no radius, no shadow
- **Typography:** Space Mono — monospace, raw, unapologetic
- **Accent:** No accent color. Pure B&W with maybe one highlight color
- **Effects:** Oversized headings, raw HTML aesthetic, visible grid lines
- **Reference:** Brutalist websites, 1990s web aesthetic refined
- **Key rule:** Function over form. Raw is intentional.

### 6. Film Memory (胶片记忆)
- **Source:** Vintage Analog / Retro Film style
- **Background:** Warm cream with CSS film grain overlay
- **Cards:** Slightly tilted (rotate 0.2deg), polaroid-style
- **Typography:** Abril Fatface dramatic headings, Merriweather body
- **Accent:** Amber #D97706, like aged film tones
- **Effects:** Film grain (CSS noise), vignette, warm color overlay
- **Reference:** 35mm film photography, polaroid, vintage darkroom
- **Key rule:** Warm imperfection — every element feels hand-processed

### 7. Liquid Glass (流光玻璃)
- **Source:** Liquid Glass style + Soft Rounded typography
- **Background:** Soft gradient with animated color shifts
- **Cards:** Heavy glassmorphism, iridescent borders, morphing shapes
- **Typography:** Varela Round headings, Nunito body — soft, friendly
- **Accent:** Pink #DB2777 + Gold #CA8A04, gradient accent
- **Effects:** backdrop-blur(24px), animated gradient borders, flowing transitions
- **Reference:** Apple Vision Pro glass, premium SaaS, luxury branding
- **Key rule:** Glass is the star — content must have strong contrast

### 8. Ink Studio (墨色工作室)
- **Source:** Exaggerated Minimalism + Portfolio Grid
- **Background:** Near-black with subtle warm undertone
- **Cards:** No visible cards — content flows in sections divided by thin lines
- **Typography:** Archivo + Space Grotesk — designer feel
- **Accent:** Single gold #D4AF37, used sparingly for dates and links
- **Effects:** Massive negative space, oversized numerals for dates
- **Reference:** High-end photography books, editorial design, art gallery labels
- **Key rule:** Space is the most important element

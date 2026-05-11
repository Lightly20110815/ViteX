import {
  getShareTheme,
  type ShareTheme,
  CARD_WIDTH,
  CARD_X,
  CARD_Y,
  CARD_W,
  CARD_RADIUS,
  CONTENT_X,
  CONTENT_W,
} from './theme';
import { loadImage, roundedRect, wrapText } from './utils';

const BODY_FONT = '600 31px "Quicksand", "Noto Sans SC", system-ui, sans-serif';
const BODY_LINE_HEIGHT = 47;

export interface ShareContent {
  author: string;
  mood: string;
  time: string;
  text: string;
  tags: string[];
  imageUrl?: string;
  slug: string;
  source: string;
}

export interface TextBlockOptions {
  x: number;
  y: number;
  maxWidth: number;
  lineHeight: number;
  font: string;
  color: string;
}

export interface ShareLayout {
  height: number;
  cardHeight: number;
  imageY: number;
  imageHeight: number;
  textY: number;
  lines: string[];
  tagsY: number;
  footerY: number;
}

export async function renderShareImage(canvas: HTMLCanvasElement, content: ShareContent): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context is unavailable');

  await document.fonts?.ready;

  const theme = getShareTheme();
  const image = content.imageUrl ? await loadImage(content.imageUrl) : null;
  const layout = measureShareLayout(ctx, content, image);

  canvas.width = CARD_WIDTH;
  canvas.height = layout.height;

  ctx.clearRect(0, 0, CARD_WIDTH, layout.height);
  drawBackdrop(ctx, theme, layout.height);
  drawGlassCard(ctx, theme, layout.height);
  drawHeader(ctx, content, theme);

  if (image) {
    drawImageFrame(ctx, image, CONTENT_X, layout.imageY, CONTENT_W, layout.imageHeight, 34, theme);
  }

  drawTextBlock(ctx, layout.lines, {
    x: CONTENT_X,
    y: layout.textY,
    maxWidth: CONTENT_W,
    lineHeight: BODY_LINE_HEIGHT,
    font: BODY_FONT,
    color: theme.textPrimary,
  });

  drawTags(ctx, content.tags, layout.tagsY, theme);
  drawFooter(ctx, content, layout.footerY, theme);
}

export function measureShareLayout(
  ctx: CanvasRenderingContext2D,
  content: ShareContent,
  image: HTMLImageElement | null,
): ShareLayout {
  ctx.font = BODY_FONT;

  const imageY = CARD_Y + 238;
  const imageHeight = image ? (content.text.length > 420 ? 300 : 380) : 0;
  const textY = image ? imageY + imageHeight + 48 : imageY;
  const lines = wrapParagraphs(ctx, content.text, CONTENT_W);
  const textHeight = Math.max(BODY_LINE_HEIGHT, lines.length * BODY_LINE_HEIGHT);
  const tagsHeight = measureTagsHeight(ctx, content.tags);
  const tagsY = textY + textHeight + (content.tags.length ? 58 : 20);
  const footerY = tagsY + tagsHeight + 82;
  const minCardHeight = 1350 - CARD_Y * 2;
  const cardHeight = Math.max(minCardHeight, footerY - CARD_Y + 92);
  const height = cardHeight + CARD_Y * 2;

  return { height, cardHeight, imageY, imageHeight, textY, lines, tagsY, footerY };
}

function wrapParagraphs(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [''];

  return paragraphs.flatMap((paragraph, index) => {
    const wrapped = wrapText(ctx, paragraph, maxWidth);
    return index === 0 ? wrapped : ['', ...wrapped];
  });
}

function measureTagsHeight(ctx: CanvasRenderingContext2D, tags: string[]): number {
  if (tags.length === 0) return 0;

  ctx.font = '600 23px "Quicksand", "Noto Sans SC", system-ui, sans-serif';

  let cursorX = CONTENT_X;
  let rows = 1;
  const maxX = CONTENT_X + CONTENT_W;

  for (const tag of tags.slice(0, 8)) {
    const text = `#${tag}`;
    const width = Math.ceil(ctx.measureText(text).width) + 34;

    if (cursorX + width > maxX) {
      cursorX = CONTENT_X;
      rows += 1;
    }

    cursorX += width + 12;
  }

  return rows * 46;
}

function drawBackdrop(ctx: CanvasRenderingContext2D, theme: ShareTheme, height: number): void {
  ctx.fillStyle = theme.pageBg;
  ctx.fillRect(0, 0, CARD_WIDTH, height);

  const topGlow = ctx.createRadialGradient(160, 120, 0, 160, 120, 760);
  topGlow.addColorStop(0, theme.glow);
  topGlow.addColorStop(0.46, 'rgba(255, 255, 255, 0.08)');
  topGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, CARD_WIDTH, height);

  const bottomGlow = ctx.createRadialGradient(884, height - 200, 0, 884, height - 200, 620);
  bottomGlow.addColorStop(0, 'rgba(255, 255, 255, 0.26)');
  bottomGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, 0, CARD_WIDTH, height);

  drawOrbit(ctx, 846, 250, 432, -0.4, theme.rail);
  drawOrbit(ctx, 180, height - 266, 520, 0.32, theme.rail);
  drawNoiseDots(ctx, theme, height);
}

function drawGlassCard(ctx: CanvasRenderingContext2D, theme: ShareTheme, height: number): void {
  const cardHeight = height - CARD_Y * 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 72;
  ctx.shadowOffsetY = 28;
  ctx.fillStyle = theme.cardBg;
  roundedRect(ctx, CARD_X, CARD_Y, CARD_W, cardHeight, CARD_RADIUS);
  ctx.fill();
  ctx.restore();

  const sheen = ctx.createLinearGradient(CARD_X, CARD_Y, CARD_X + CARD_W, CARD_Y + cardHeight);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
  sheen.addColorStop(0.34, 'rgba(255, 255, 255, 0.06)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  roundedRect(ctx, CARD_X, CARD_Y, CARD_W, cardHeight, CARD_RADIUS);
  ctx.fill();

  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 2;
  roundedRect(ctx, CARD_X, CARD_Y, CARD_W, cardHeight, CARD_RADIUS);
  ctx.stroke();
}

function drawHeader(ctx: CanvasRenderingContext2D, content: ShareContent, theme: ShareTheme): void {
  const headerY = CARD_Y + 96;

  ctx.fillStyle = theme.textTertiary;
  ctx.font = '700 20px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.letterSpacing = '0.18em';
  ctx.fillText('MISSION LOG', CONTENT_X, headerY - 28);
  ctx.letterSpacing = '0';

  ctx.fillStyle = theme.textPrimary;
  ctx.font = '700 64px "Caveat", cursive';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(content.author, CONTENT_X, headerY + 34);

  drawPill(
    ctx,
    content.mood,
    CONTENT_X + 108,
    headerY - 26,
    78,
    56,
    theme.accentSoft,
    theme.accent,
    '34px system-ui, sans-serif',
  );

  ctx.fillStyle = theme.textSecondary;
  ctx.font = '700 26px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(content.time, CARD_X + CARD_W - 72, headerY + 14);
  ctx.textAlign = 'left';

  ctx.strokeStyle = theme.rail;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CONTENT_X, CARD_Y + 176);
  ctx.lineTo(CARD_X + CARD_W - 72, CARD_Y + 176);
  ctx.stroke();
}

function drawTextBlock(ctx: CanvasRenderingContext2D, lines: string[], options: TextBlockOptions): void {
  ctx.fillStyle = options.color;
  ctx.font = options.font;
  ctx.textBaseline = 'top';

  lines.forEach((line, index) => {
    ctx.fillText(line, options.x, options.y + index * options.lineHeight);
  });

  ctx.textBaseline = 'alphabetic';
}

function drawTags(ctx: CanvasRenderingContext2D, tags: string[], y: number, theme: ShareTheme): void {
  if (tags.length === 0) return;

  const maxX = CONTENT_X + CONTENT_W;
  let cursorX = CONTENT_X;
  let cursorY = y;

  ctx.font = '600 23px "Quicksand", "Noto Sans SC", system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  for (const tag of tags.slice(0, 8)) {
    const text = `#${tag}`;
    const width = Math.ceil(ctx.measureText(text).width) + 34;

    if (cursorX + width > maxX) {
      cursorX = CONTENT_X;
      cursorY += 46;
    }

    drawPill(ctx, text, cursorX, cursorY - 18, width, 36, theme.accentSoft, theme.accent, ctx.font);
    cursorX += width + 12;
  }

  ctx.textBaseline = 'alphabetic';
}

function drawFooter(ctx: CanvasRenderingContext2D, content: ShareContent, y: number, theme: ShareTheme): void {
  ctx.strokeStyle = theme.rail;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CONTENT_X, y - 56);
  ctx.lineTo(CONTENT_X + CONTENT_W, y - 56);
  ctx.stroke();

  ctx.fillStyle = theme.textSecondary;
  ctx.font = '700 26px "Caveat", cursive';
  ctx.fillText('Sy · ViteX', CONTENT_X, y);

  ctx.fillStyle = theme.textTertiary;
  ctx.font = '600 21px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(content.source, CONTENT_X + CONTENT_W, y - 2);
  ctx.textAlign = 'left';
}

function drawImageFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  theme: ShareTheme,
): void {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  drawCroppedImage(ctx, image, x, y, width, height, radius);
  ctx.restore();

  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function drawCroppedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }

  ctx.save();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  ctx.restore();
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  bg: string,
  color: string,
  font: string,
): void {
  ctx.fillStyle = bg;
  roundedRect(ctx, x, y, width, height, height / 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawOrbit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, size / 2, size / 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawNoiseDots(ctx: CanvasRenderingContext2D, theme: ShareTheme, height: number): void {
  ctx.fillStyle = theme.rail;

  for (let index = 0; index < 64; index += 1) {
    const x = (index * 241) % CARD_WIDTH;
    const y = (index * 389) % height;
    const size = index % 5 === 0 ? 2.4 : 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

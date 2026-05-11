import type { TweetData } from '../types/TweetData';
import { formatRelativeTime } from '../utils/time';

type ShareTheme = {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSoft: string;
  glow: string;
  rail: string;
};

type ShareContent = {
  author: string;
  mood: string;
  time: string;
  text: string;
  tags: string[];
  imageUrl?: string;
  slug: string;
  source: string;
};

type TextBlockOptions = {
  x: number;
  y: number;
  maxWidth: number;
  lineHeight: number;
  font: string;
  color: string;
};

const CARD_WIDTH = 1080;
const MIN_CARD_HEIGHT = 1350;
const CARD_RADIUS = 56;
const CARD_X = 92;
const CARD_Y = 92;
const CARD_W = CARD_WIDTH - CARD_X * 2;
const CONTENT_X = CARD_X + 72;
const CONTENT_W = CARD_W - 144;
const BODY_FONT = '600 31px "Quicksand", "Noto Sans SC", system-ui, sans-serif';
const BODY_LINE_HEIGHT = 47;
const MIME_TYPE = 'image/png';

export function openShareCard(tweet: TweetData): void {
  document.querySelector('.sharecard-overlay')?.remove();
  new ShareCardDialog(tweet).open();
}

class ShareCardDialog {
  private readonly overlay = document.createElement('div');
  private readonly canvas = document.createElement('canvas');
  private readonly status = document.createElement('p');
  private readonly downloadBtn = document.createElement('button');
  private readonly nativeShareBtn = document.createElement('button');
  private readonly closeBtn = document.createElement('button');
  private blob: Blob | null = null;

  constructor(private readonly tweet: TweetData) {}

  open(): void {
    this.buildDialog();
    document.body.appendChild(this.overlay);
    document.addEventListener('keydown', this.handleKeydown);
    void this.render();
  }

  private buildDialog(): void {
    this.overlay.className = 'sharecard-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', '分享图片预览');

    const panel = document.createElement('section');
    panel.className = 'sharecard-panel';

    const header = document.createElement('header');
    header.className = 'sharecard-header';

    const heading = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = '分享图片';
    this.status.className = 'sharecard-status';
    this.status.textContent = '正在生成高清卡片…';
    heading.appendChild(title);
    heading.appendChild(this.status);

    this.closeBtn.className = 'sharecard-icon-btn';
    this.closeBtn.type = 'button';
    this.closeBtn.setAttribute('aria-label', '关闭分享图片');
    this.closeBtn.textContent = '×';

    const preview = document.createElement('div');
    preview.className = 'sharecard-preview';
    this.canvas.className = 'sharecard-canvas';
    this.canvas.width = CARD_WIDTH;
    this.canvas.height = MIN_CARD_HEIGHT;
    preview.appendChild(this.canvas);

    const actions = document.createElement('footer');
    actions.className = 'sharecard-actions';

    this.nativeShareBtn.className = 'sharecard-btn';
    this.nativeShareBtn.type = 'button';
    this.nativeShareBtn.textContent = '系统分享';
    this.nativeShareBtn.disabled = true;
    this.nativeShareBtn.hidden = true;

    this.downloadBtn.className = 'sharecard-btn sharecard-btn-primary';
    this.downloadBtn.type = 'button';
    this.downloadBtn.textContent = '生成中';
    this.downloadBtn.disabled = true;

    header.appendChild(heading);
    header.appendChild(this.closeBtn);
    actions.appendChild(this.nativeShareBtn);
    actions.appendChild(this.downloadBtn);
    panel.appendChild(header);
    panel.appendChild(preview);
    panel.appendChild(actions);
    this.overlay.appendChild(panel);

    this.overlay.addEventListener('click', this.handleBackdropClick);
    this.closeBtn.addEventListener('click', this.close);
    this.downloadBtn.addEventListener('click', () => void this.download());
    this.nativeShareBtn.addEventListener('click', () => void this.share());
  }

  private async render(): Promise<void> {
    try {
      await renderShareImage(this.canvas, createShareContent(this.tweet));
      this.blob = await canvasToBlob(this.canvas);
      this.status.textContent = `已生成 1080 × ${this.canvas.height} 长图，可直接下载或分享。`;
      this.downloadBtn.disabled = false;
      this.downloadBtn.textContent = '下载 PNG';
      this.enableNativeShareIfAvailable();
    } catch (error) {
      this.status.textContent = '生成失败，请稍后重试。';
      this.downloadBtn.textContent = '生成失败';
      console.error('生成分享图片失败：', error);
    }
  }

  private enableNativeShareIfAvailable(): void {
    if (!this.blob || !('share' in navigator) || !('canShare' in navigator)) return;

    const file = this.createImageFile();
    if (navigator.canShare?.({ files: [file] })) {
      this.nativeShareBtn.hidden = false;
      this.nativeShareBtn.disabled = false;
    }
  }

  private async download(): Promise<void> {
    if (!this.blob) return;

    this.downloadBtn.disabled = true;
    this.downloadBtn.textContent = '下载中';

    try {
      downloadBlob(this.blob, this.filename);
      this.downloadBtn.textContent = '下载 PNG';
    } catch (error) {
      this.downloadBtn.textContent = '下载失败';
      console.error('下载分享图片失败：', error);
    } finally {
      this.downloadBtn.disabled = false;
    }
  }

  private async share(): Promise<void> {
    if (!this.blob) return;

    const file = this.createImageFile();
    this.nativeShareBtn.disabled = true;

    try {
      await navigator.share({ files: [file], title: 'ViteX 分享图片' });
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') console.error('系统分享失败：', error);
    } finally {
      this.nativeShareBtn.disabled = false;
    }
  }

  private createImageFile(): File {
    return new File([this.blob as Blob], this.filename, { type: MIME_TYPE });
  }

  private get filename(): string {
    return `vitex-${sanitizeFilename(this.tweet.slug)}.png`;
  }

  private readonly close = (): void => {
    document.removeEventListener('keydown', this.handleKeydown);
    this.overlay.remove();
  };

  private readonly handleBackdropClick = (event: MouseEvent): void => {
    if (event.target === this.overlay) this.close();
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.close();
  };
}

function createShareContent(tweet: TweetData): ShareContent {
  return {
    author: 'Sy',
    mood: tweet.meta.mood,
    time: formatRelativeTime(tweet.meta.created),
    text: extractText(tweet.html),
    tags: tweet.meta.tags ?? [],
    imageUrl: tweet.meta.images?.[0],
    slug: tweet.slug,
    source: getShareSource(tweet.slug),
  };
}

async function renderShareImage(canvas: HTMLCanvasElement, content: ShareContent): Promise<void> {
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

type ShareLayout = {
  height: number;
  cardHeight: number;
  imageY: number;
  imageHeight: number;
  textY: number;
  lines: string[];
  tagsY: number;
  footerY: number;
};

function measureShareLayout(
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
  const cardHeight = Math.max(MIN_CARD_HEIGHT - CARD_Y * 2, footerY - CARD_Y + 92);
  const height = cardHeight + CARD_Y * 2;

  return {
    height,
    cardHeight,
    imageY,
    imageHeight,
    textY,
    lines,
    tagsY,
    footerY,
  };
}

function getShareTheme(): ShareTheme {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return isDark
    ? {
        pageBg: '#05070d',
        cardBg: 'rgba(17, 20, 30, 0.86)',
        cardBorder: 'rgba(255, 255, 255, 0.18)',
        textPrimary: '#f7f7fb',
        textSecondary: '#c8ccd8',
        textTertiary: '#8d96aa',
        accent: '#58a6ff',
        accentSoft: 'rgba(88, 166, 255, 0.16)',
        glow: 'rgba(41, 151, 255, 0.34)',
        rail: 'rgba(255, 255, 255, 0.12)',
      }
    : {
        pageBg: '#f5f7fb',
        cardBg: 'rgba(255, 255, 255, 0.82)',
        cardBorder: 'rgba(255, 255, 255, 0.78)',
        textPrimary: '#15171d',
        textSecondary: '#4d5566',
        textTertiary: '#8a91a2',
        accent: '#0066cc',
        accentSoft: 'rgba(0, 102, 204, 0.12)',
        glow: 'rgba(0, 102, 204, 0.2)',
        rail: 'rgba(21, 23, 29, 0.1)',
      };
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';

  for (const token of tokenizeText(text)) {
    const candidate = line + token;

    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line.trimEnd());
      line = '';
    }

    if (ctx.measureText(token).width <= maxWidth) {
      line = token.trimStart();
      continue;
    }

    const broken = breakLongToken(ctx, token.trim(), maxWidth);
    lines.push(...broken.slice(0, -1));
    line = broken.at(-1) ?? '';
  }

  if (line) lines.push(line.trimEnd());
  return lines.length ? lines : [''];
}

function breakLongToken(ctx: CanvasRenderingContext2D, token: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';

  for (const char of Array.from(token)) {
    const candidate = line + char;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function tokenizeText(text: string): string[] {
  return Array.from(
    text.matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|\S+\s*/gu),
    (match) => match[0],
  );
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  div.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  div.querySelectorAll('p, li, blockquote, pre, h1, h2, h3, h4').forEach((node) => {
    node.appendChild(document.createTextNode('\n\n'));
  });

  return (div.textContent ?? '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getShareSource(slug: string): string {
  const path = `${location.pathname.replace(/\/$/, '')}/#tweet-${slug}`;
  return `${location.host}${path}`;
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('Canvas export returned an empty blob'));
    }, MIME_TYPE);
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'share';
}

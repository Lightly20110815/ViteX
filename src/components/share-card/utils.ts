export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

export function breakLongToken(ctx: CanvasRenderingContext2D, token: string, maxWidth: number): string[] {
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

export function tokenizeText(text: string): string[] {
  return Array.from(
    text.matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|\S+\s*/gu),
    (match) => match[0],
  );
}

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function extractText(html: string): string {
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

export function getShareSource(slug: string): string {
  const path = `${location.pathname.replace(/\/$/, '')}/#tweet-${slug}`;
  return `${location.host}${path}`;
}

const MIME_TYPE = 'image/png';

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('Canvas export returned an empty blob'));
    }, MIME_TYPE);
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
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

export function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'share';
}

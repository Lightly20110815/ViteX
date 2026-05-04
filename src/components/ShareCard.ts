import type { TweetData } from '../types/TweetData';
import { formatRelativeTime } from '../utils/time';

export function openShareCard(tweet: TweetData): void {
  const existing = document.querySelector('.sharecard-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'sharecard-overlay';

  const container = document.createElement('div');
  container.className = 'sharecard-container';

  // Preview
  const preview = document.createElement('div');
  preview.className = 'sharecard-preview';
  preview.id = 'sharecard-preview';

  // Build the card HTML
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  preview.innerHTML = `
    <div class="sharecard-inner" style="background:${isDark ? 'rgba(15,15,15,0.9)' : 'rgba(255,255,255,0.85)'};border:1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)'};">
      <div class="sharecard-header">
        <span class="sharecard-avatar">Sy</span>
        <span class="sharecard-mood">${tweet.meta.mood}</span>
        <span class="sharecard-time">${formatRelativeTime(tweet.meta.created)}</span>
      </div>
      <div class="sharecard-body">${truncateHtml(tweet.html, 200)}</div>
      ${tweet.meta.images && tweet.meta.images.length > 0 ? `<div class="sharecard-img"><img src="${tweet.meta.images[0]}" alt=""></div>` : ''}
      ${tweet.meta.tags && tweet.meta.tags.length > 0 ? `<div class="sharecard-tags">${tweet.meta.tags.map(t => `<span>#${t}</span>`).join(' ')}</div>` : ''}
      <div class="sharecard-footer">Sy · ViteX</div>
    </div>
  `;

  // Actions
  const actions = document.createElement('div');
  actions.className = 'sharecard-actions';

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'sharecard-btn sharecard-btn-primary';
  downloadBtn.textContent = '下载图片';
  downloadBtn.addEventListener('click', () => downloadAsImage(tweet, preview));

  const closeBtn = document.createElement('button');
  closeBtn.className = 'sharecard-btn';
  closeBtn.textContent = '关闭';
  closeBtn.addEventListener('click', () => overlay.remove());

  actions.appendChild(downloadBtn);
  actions.appendChild(closeBtn);

  container.appendChild(preview);
  container.appendChild(actions);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.addEventListener('keydown', function handler(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handler);
    }
  });
}

function truncateHtml(html: string, maxLen: number): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || '';
  if (text.length <= maxLen) return html;
  // Simple truncation: just use text
  return `<p>${text.substring(0, maxLen)}…</p>`;
}

async function downloadAsImage(tweet: TweetData, previewEl: HTMLElement): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 800;
  const H = 600;
  const dpr = 2;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bg = isDark ? '#0a0a0a' : '#f5f5f7';
  const cardBg = isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.9)';
  const textPrimary = isDark ? '#f5f5f7' : '#1d1d1f';
  const textSecondary = isDark ? '#a1a1a6' : '#86868b';
  const accent = isDark ? '#2997ff' : '#0066cc';

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Card
  const cardX = 60, cardY = 60, cardW = W - 120, cardH = H - 140;
  ctx.fillStyle = cardBg;
  roundRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.fill();

  // Header
  ctx.fillStyle = textPrimary;
  ctx.font = 'bold 28px Caveat, cursive';
  ctx.fillText('Sy', cardX + 32, cardY + 52);

  ctx.font = '22px sans-serif';
  ctx.fillText(tweet.meta.mood, cardX + 90, cardY + 52);

  ctx.fillStyle = textSecondary;
  ctx.font = '14px Quicksand, sans-serif';
  ctx.fillText(formatRelativeTime(tweet.meta.created), cardX + cardW - 160, cardY + 52);

  // Body text
  const div = document.createElement('div');
  div.innerHTML = tweet.html;
  const text = (div.textContent || '').trim();
  ctx.fillStyle = textPrimary;
  ctx.font = '16px Quicksand, "Noto Sans SC", sans-serif';
  wrapText(ctx, text.substring(0, 300), cardX + 32, cardY + 90, cardW - 64, 26);

  // Tags
  if (tweet.meta.tags && tweet.meta.tags.length > 0) {
    const tagY = cardY + cardH - 70;
    ctx.fillStyle = accent;
    ctx.font = '13px Quicksand, sans-serif';
    const tagsText = tweet.meta.tags.map(t => `#${t}`).join('  ');
    ctx.fillText(tagsText, cardX + 32, tagY);
  }

  // Footer
  ctx.fillStyle = textSecondary;
  ctx.font = '14px Caveat, cursive';
  ctx.fillText('Sy · ViteX', cardX + 32, cardY + cardH - 20);

  // Download
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `vitex-${tweet.slug}.png`;
  a.click();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split('');
  let line = '';
  let curY = y;
  let lines = 0;
  const maxLines = 10;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, curY);
      line = words[i];
      curY += lineHeight;
      lines++;
      if (lines >= maxLines) {
        ctx.fillText(line + '…', x, curY);
        return curY;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
  return curY;
}

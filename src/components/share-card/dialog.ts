import type { TweetData } from '../../types/TweetData';
import { formatRelativeTime } from '../../utils/time';
import { renderShareImage, type ShareContent } from './renderer';
import { extractText, getShareSource, canvasToBlob, downloadBlob, sanitizeFilename } from './utils';
import { CARD_WIDTH } from './theme';

const MIME_TYPE = 'image/png';
const MIN_CARD_HEIGHT = 1350;

export class ShareCardDialog {
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

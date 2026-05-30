import { musicConfig } from '../data/music-config';
import { getMetingList, type MetingSong } from '../utils/meting';

type Track = Pick<MetingSong, 'name' | 'artist' | 'url' | 'cover'>;
type StatusAction = 'reload-playlist' | 'retry-play' | null;
type StatusTone = 'info' | 'error';

const STORAGE_VISIBLE = 'vitex:music-player:visible';
const COVER_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><rect fill="%23ccc" width="30" height="30"/><text x="15" y="20" text-anchor="middle" fill="%23999" font-size="14">♪</text></svg>',
  );

let player: MusicPlayerController | null = null;

export function renderMusicPlayer(): void {
  if (!musicConfig.enable || player) return;

  player = new MusicPlayerController();
  player.mount();
}

class MusicPlayerController {
  private readonly root = document.createElement('section');
  private readonly body = document.createElement('div');
  private readonly toggleBtn = document.createElement('button');
  private readonly coverEl = document.createElement('img');
  private readonly infoEl = document.createElement('div');
  private readonly trackEl = document.createElement('div');
  private readonly artistEl = document.createElement('div');
  private readonly controlsEl = document.createElement('div');
  private readonly prevBtn = document.createElement('button');
  private readonly playBtn = document.createElement('button');
  private readonly nextBtn = document.createElement('button');
  private readonly statusEl = document.createElement('button');
  private readonly audio = document.createElement('audio');

  private tracks: Track[] | null = null;
  private currentIndex = 0;
  private isPlaying = false;
  private statusAction: StatusAction = null;

  constructor() {
    this.root.className = 'music-player is-collapsed';
    this.root.setAttribute('aria-label', '音乐播放器');

    this.toggleBtn.className = 'music-player-toggle';
    this.toggleBtn.type = 'button';
    this.toggleBtn.setAttribute('aria-label', '展开或收起音乐播放器');
    this.toggleBtn.textContent = '♪';

    this.body.className = 'music-player-body';

    this.coverEl.className = 'music-player-cover';
    this.coverEl.alt = '';
    this.coverEl.src = COVER_PLACEHOLDER;

    this.infoEl.className = 'music-player-info';

    this.trackEl.className = 'music-player-track';
    this.artistEl.className = 'music-player-artist';
    this.renderTrack(null);

    this.controlsEl.className = 'music-player-controls';

    this.prevBtn.className = 'music-player-btn';
    this.prevBtn.type = 'button';
    this.prevBtn.setAttribute('aria-label', '上一首');
    this.prevBtn.innerHTML = '&#9664;&#9664;';

    this.playBtn.className = 'music-player-btn music-player-btn-play';
    this.playBtn.type = 'button';

    this.nextBtn.className = 'music-player-btn';
    this.nextBtn.type = 'button';
    this.nextBtn.setAttribute('aria-label', '下一首');
    this.nextBtn.innerHTML = '&#9654;&#9654;';

    this.statusEl.className = 'music-player-status';
    this.statusEl.type = 'button';
    this.statusEl.hidden = true;

    this.audio.className = 'music-player-audio';
    this.audio.hidden = true;
    this.audio.preload = 'metadata';
    this.audio.crossOrigin = 'anonymous';
    this.audio.setAttribute('playsinline', '');

    this.infoEl.append(this.trackEl, this.artistEl);
    this.controlsEl.append(this.prevBtn, this.playBtn, this.nextBtn);
    this.body.append(this.coverEl, this.infoEl, this.controlsEl);
    this.root.append(this.toggleBtn, this.body, this.statusEl, this.audio);

    this.bindDomEvents();
    this.bindAudioEvents();
    this.renderPlaybackState();
    this.setControlsDisabled(true);
  }

  mount(): void {
    document.body.appendChild(this.root);
    this.setVisible(readStoredVisible());
    void this.loadPlaylist();
  }

  private bindDomEvents(): void {
    this.toggleBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.setVisible(this.root.classList.contains('is-collapsed'));
    });

    this.infoEl.addEventListener('click', () => {
      void this.togglePlayback();
    });

    this.prevBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.selectRelativeTrack(-1);
    });

    this.playBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      void this.togglePlayback();
    });

    this.nextBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this.selectRelativeTrack(1);
    });

    this.statusEl.addEventListener('click', () => {
      if (this.statusAction === 'reload-playlist') {
        void this.loadPlaylist();
      }

      if (this.statusAction === 'retry-play') {
        void this.playCurrentTrack();
      }
    });
  }

  private bindAudioEvents(): void {
    this.audio.addEventListener('playing', () => {
      this.hideStatus();
      this.isPlaying = true;
      this.renderPlaybackState();
      this.updateMediaSession();
    });

    this.audio.addEventListener('pause', () => {
      if (!this.audio.ended) {
        this.isPlaying = false;
        this.renderPlaybackState();
      }
    });

    this.audio.addEventListener('ended', () => {
      this.selectRelativeTrack(1, true);
    });

    this.audio.addEventListener('error', () => {
      this.isPlaying = false;
      this.renderPlaybackState();
      this.showStatus('播放失败，点击重试', 'error', 'retry-play');
    });
  }

  private async loadPlaylist(): Promise<void> {
    this.showStatus('加载歌单中…');
    this.setControlsDisabled(true);

    try {
      const playlist = await getMetingList();
      if (playlist.length === 0) {
        throw new Error('empty playlist');
      }

      this.tracks = playlist.map(normalizeTrack);
      this.currentIndex = 0;
      this.setControlsDisabled(false);
      this.syncTrack();
      this.hideStatus();
    } catch (error) {
      console.error('Music player: failed to load playlist', error);
      this.tracks = null;
      this.currentIndex = 0;
      this.audio.removeAttribute('src');
      this.renderTrack(null);
      this.renderPlaybackState();
      this.showStatus('歌单加载失败，点击重试', 'error', 'reload-playlist');
    }
  }

  private async togglePlayback(): Promise<void> {
    if (!this.tracks || this.tracks.length === 0) {
      await this.loadPlaylist();
      return;
    }

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.renderPlaybackState();
      return;
    }

    await this.playCurrentTrack();
  }

  private async playCurrentTrack(): Promise<void> {
    const track = this.getCurrentTrack();
    if (!track) return;

    this.syncTrack();
    this.isPlaying = true;
    this.renderPlaybackState();

    try {
      await this.audio.play();
    } catch (error) {
      this.isPlaying = false;
      this.renderPlaybackState();
      this.showStatus('播放失败，点击重试', 'error', 'retry-play');
      console.error('Music player: playback failed', error);
    }
  }

  private selectRelativeTrack(offset: number, autoplay = this.isPlaying): void {
    if (!this.tracks || this.tracks.length === 0) return;

    this.currentIndex = modulo(this.currentIndex + offset, this.tracks.length);
    this.syncTrack();

    if (autoplay) {
      void this.playCurrentTrack();
      return;
    }

    this.audio.pause();
    this.isPlaying = false;
    this.renderPlaybackState();
  }

  private syncTrack(): void {
    const track = this.getCurrentTrack();
    if (!track) return;

    this.renderTrack(track);
    if (this.audio.src !== track.url) {
      this.audio.src = track.url;
    }
    this.updateMediaSession();
  }

  private renderTrack(track: Track | null): void {
    this.trackEl.textContent = track?.name || '--';
    this.artistEl.textContent = track?.artist || '--';
    this.coverEl.src = track?.cover || COVER_PLACEHOLDER;
  }

  private renderPlaybackState(): void {
    this.root.classList.toggle('is-playing', this.isPlaying);
    this.playBtn.innerHTML = this.isPlaying ? '&#10074;&#10074;' : '&#9654;';
    this.playBtn.setAttribute('aria-label', this.isPlaying ? '暂停' : '播放');
  }

  private setControlsDisabled(disabled: boolean): void {
    this.prevBtn.disabled = disabled;
    this.playBtn.disabled = disabled;
    this.nextBtn.disabled = disabled;
  }

  private setVisible(visible: boolean): void {
    this.root.classList.toggle('is-collapsed', !visible);
    writeStorage(STORAGE_VISIBLE, String(visible));
  }

  private showStatus(
    message: string,
    tone: StatusTone = 'info',
    action: StatusAction = null,
  ): void {
    this.statusAction = action;
    this.statusEl.hidden = false;
    this.statusEl.disabled = action === null;
    this.statusEl.textContent = message;
    this.statusEl.classList.toggle('is-error', tone === 'error');
    this.statusEl.classList.toggle('is-actionable', action !== null);
  }

  private hideStatus(): void {
    this.statusAction = null;
    this.statusEl.hidden = true;
    this.statusEl.disabled = true;
    this.statusEl.textContent = '';
    this.statusEl.classList.remove('is-error', 'is-actionable');
  }

  private getCurrentTrack(): Track | null {
    return this.tracks?.[this.currentIndex] ?? null;
  }

  private updateMediaSession(): void {
    const track = this.getCurrentTrack();
    if (!track || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.artist,
      artwork: track.cover ? [{ src: track.cover }] : undefined,
    });

    setMediaActionHandler('play', () => {
      void this.playCurrentTrack();
    });
    setMediaActionHandler('pause', () => {
      this.audio.pause();
      this.isPlaying = false;
      this.renderPlaybackState();
    });
    setMediaActionHandler('previoustrack', () => {
      this.selectRelativeTrack(-1);
    });
    setMediaActionHandler('nexttrack', () => {
      this.selectRelativeTrack(1);
    });
  }
}

function normalizeTrack(track: MetingSong): Track {
  return {
    name: track.name.trim(),
    artist: track.artist.trim(),
    url: track.url.trim(),
    cover: track.cover.trim(),
  };
}

function setMediaActionHandler(
  action: MediaSessionAction,
  handler: MediaSessionActionHandler,
): void {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    // Ignore unsupported actions in partial Media Session implementations.
  }
}

function modulo(value: number, size: number): number {
  return ((value % size) + size) % size;
}

function readStoredVisible(): boolean {
  return readStorage(STORAGE_VISIBLE) !== 'false';
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in private mode or restricted contexts.
  }
}

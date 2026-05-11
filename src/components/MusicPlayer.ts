import { musicConfig } from '../data/music-config';

type MusicServer = 'netease' | 'tencent' | 'kugou';
type MusicType = 'playlist' | 'album' | 'song';

type MetingSong = {
  name?: string;
  artist?: string;
  url?: string;
  pic?: string;
  cover?: string;
  lrc?: string;
  theme?: string;
  [key: string]: unknown;
};

type APlayerAudio = MetingSong & { cover?: string };

type APlayerInstance = {
  audio?: HTMLAudioElement;
  list?: { audios?: APlayerAudio[]; index?: number };
  on(event: string, handler: () => void): void;
  destroy(): void;
  toggle(): void;
  play(): void;
  pause(): void;
  skipBack(): void;
  skipForward(): void;
  volume(value: number, nostorage?: boolean): void;
};

type APlayerConstructor = new (options: {
  container: HTMLElement;
  volume: number;
  lrcType: number;
  listFolded: boolean;
  order: string;
  audio: APlayerAudio[];
}) => APlayerInstance;

const storageKeys = {
  visible: 'vitex:music-player:visible',
  volume: 'vitex:music-player:volume',
};

let player: APlayerInstance | null = null;
let playerEl: HTMLElement | null = null;
let contentEl: HTMLElement | null = null;
let statusEl: HTMLElement | null = null;
let volume = readStoredVolume();
let isLoaded = false;

export function renderMusicPlayer(): void {
  if (!musicConfig.enable || playerEl) return;

  playerEl = document.createElement('section');
  playerEl.className = 'music-player';
  playerEl.setAttribute('aria-label', '音乐播放器');

  const shell = document.createElement('div');
  shell.className = 'music-player-shell';

  const toggleButton = document.createElement('button');
  toggleButton.className = 'music-player-toggle';
  toggleButton.type = 'button';
  toggleButton.setAttribute('aria-label', '显示或隐藏音乐播放器');
  toggleButton.textContent = '♪';

  contentEl = document.createElement('div');
  contentEl.className = 'music-player-content';

  statusEl = document.createElement('div');
  statusEl.className = 'music-player-status';
  statusEl.textContent = '加载音乐中';
  contentEl.appendChild(statusEl);

  shell.appendChild(toggleButton);
  shell.appendChild(contentEl);
  playerEl.appendChild(shell);
  document.body.appendChild(playerEl);

  const storedVisible = localStorage.getItem(storageKeys.visible);
  const isVisible = storedVisible !== 'false';
  setPlayerVisible(isVisible);

  toggleButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const nextVisible = playerEl?.classList.contains('is-collapsed') ?? false;
    setPlayerVisible(nextVisible);
    if (nextVisible) void ensurePlayerLoaded();
  });

  contentEl.addEventListener('click', async () => {
    await ensurePlayerLoaded();
    player?.toggle();
  });

  if (isVisible) {
    void ensurePlayerLoaded();
  }
}

async function ensurePlayerLoaded(): Promise<void> {
  if (isLoaded || !contentEl || !statusEl) return;
  isLoaded = true;

  try {
    const playlist = await getMusicList();
    if (playlist.length === 0) {
      statusEl.textContent = '暂无音乐';
      return;
    }
    await initAPlayer(playlist);
  } catch (error) {
    isLoaded = false;
    statusEl.textContent = '音乐加载失败';
    console.error('获取播放列表失败：', error);
  }
}

async function getMusicList(): Promise<APlayerAudio[]> {
  const endpoint = new URL(musicConfig.url);
  endpoint.searchParams.set('server', musicConfig.server);
  endpoint.searchParams.set('type', musicConfig.type);
  endpoint.searchParams.set('id', musicConfig.id);

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Meting API returned ${response.status}`);

  const list = (await response.json()) as MetingSong[];
  return list.map(({ pic, ...song }) => ({
    ...song,
    cover: song.cover ?? pic,
  }));
}

async function initAPlayer(playlist: APlayerAudio[]): Promise<void> {
  if (!contentEl || !statusEl) return;

  statusEl.remove();
  player?.destroy();

  const module = (await import('aplayer')) as { default: APlayerConstructor };
  const APlayer = module.default;

  player = new APlayer({
    container: contentEl,
    volume,
    lrcType: 0,
    listFolded: true,
    order: 'random',
    audio: playlist,
  });

  player.on('canplay', updateMediaSession);
  player.on('listswitch', updateMediaSession);
  player.on('volumechange', () => {
    const nextVolume = player?.audio?.volume;
    if (typeof nextVolume === 'number') {
      volume = nextVolume;
      localStorage.setItem(storageKeys.volume, String(nextVolume));
    }
  });

  updateMediaSession();
}

function updateMediaSession(): void {
  if (!player || !('mediaSession' in navigator)) return;

  const currentAudio = player.list?.audios?.[player.list.index ?? 0];
  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentAudio?.name ?? '未知曲目',
    artist: currentAudio?.artist ?? '未知艺术家',
    artwork: currentAudio?.cover ? [{ src: currentAudio.cover }] : undefined,
  });

  navigator.mediaSession.setActionHandler('play', () => player?.play());
  navigator.mediaSession.setActionHandler('pause', () => player?.pause());
  navigator.mediaSession.setActionHandler('previoustrack', () => player?.skipBack());
  navigator.mediaSession.setActionHandler('nexttrack', () => player?.skipForward());
}

function setPlayerVisible(isVisible: boolean): void {
  if (!playerEl) return;
  playerEl.classList.toggle('is-collapsed', !isVisible);
  localStorage.setItem(storageKeys.visible, String(isVisible));
  if (!isVisible) player?.pause();
}

function readStoredVolume(): number {
  const stored = Number(localStorage.getItem(storageKeys.volume));
  if (!Number.isFinite(stored)) return 0.7;
  return Math.min(1, Math.max(0, stored));
}

import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';

interface MusicConfig {
  enable: boolean;
  url: string;
  id: string;
  server: string;
  type: string;
}

interface Song {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc?: string;
  pic?: string;
}

let player: any = null;

async function fetchMusicList(cfg: MusicConfig): Promise<Song[]> {
  const res = await fetch(
    `${cfg.url}?server=${cfg.server}&type=${cfg.type}&id=${cfg.id}`,
  );
  const list = await res.json();
  return list.map((song: Song) => {
    const { pic, ...rest } = song;
    return { ...rest, cover: pic };
  });
}

export function renderMusicPlayer(cfg: MusicConfig): void {
  if (!cfg.enable) return;

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'music-player';

  const container = document.createElement('div');
  container.className = 'music-player-inner';
  wrapper.appendChild(container);

  sidebar.appendChild(wrapper);

  fetchMusicList(cfg)
    .then((list) => {
      if (!list.length) return;
      player = new APlayer({
        container,
        volume: 0.6,
        lrcType: 0,
        listFolded: true,
        order: 'random',
        audio: list,
      });
      window.$player = player;
    })
    .catch(() => {
      wrapper.remove();
    });
}

export function destroyMusicPlayer(): void {
  player?.destroy();
  player = null;
  window.$player = undefined;
}

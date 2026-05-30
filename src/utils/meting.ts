/**
 * Meting music list helper — same pattern as vitepress-theme-curve/.vitepress/theme/api/index.js
 */

import { musicConfig } from '../data/music-config';

export interface MetingSong {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc: string;
}

export async function getMetingList(): Promise<MetingSong[]> {
  const url = new URL(musicConfig.url);
  url.searchParams.set('server', musicConfig.server);
  url.searchParams.set('type', musicConfig.type);
  url.searchParams.set('id', musicConfig.id);

  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`Meting API ${res.status}`);
  const list = (await res.json()) as Record<string, string>[];
  return list
    .map((item) => ({
      name: (item.title ?? item.name ?? '').trim(),
      artist: (item.author ?? item.artist ?? '').trim(),
      url: (item.url ?? '').trim(),
      cover: (item.cover ?? item.pic ?? '').trim(),
      lrc: (item.lrc ?? '').trim(),
    }))
    .filter((item) => item.name.length > 0 && item.artist.length > 0 && item.url.length > 0);
}

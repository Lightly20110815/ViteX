/**
 * Meting music list helper — same pattern as vitepress-theme-curve/.vitepress/theme/api/index.js
 */

import { musicConfig } from '../data/music-config';

export interface MetingSong {
  name: string;
  artist: string;
  url: string;
  cover?: string;
  pic?: string;
  lrc?: string;
  [k: string]: unknown;
}

export async function getMetingList(): Promise<MetingSong[]> {
  const url = new URL(musicConfig.url);
  url.searchParams.set('server', musicConfig.server);
  url.searchParams.set('type', musicConfig.type);
  url.searchParams.set('id', musicConfig.id);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Meting API ${res.status}`);
  const list = (await res.json()) as MetingSong[];
  return list.map(({ pic, ...song }) => ({
    ...song,
    cover: song.cover ?? pic,
  }));
}

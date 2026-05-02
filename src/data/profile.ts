import type { TweetMeta } from '../types/TweetData';

export interface ProfileData {
  username: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
}

export const profile: ProfileData = {
  username: 'Sy',
  bio: '🏳️‍⚧️「重构时间线，再次重逢」 | 是夕妍？ | INFP | MtFtX | oler转oder | 🎂08.15 | Vite | Cpp | HRT 25.08.11~25.11.30 26.04.17~',
  avatarUrl: 'https://api.ddnsy.fun/avatar.webp',
  backgroundUrl: 'https://bing.img.run/rand.php',
};

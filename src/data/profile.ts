import type { TweetMeta } from '../types/TweetData';
import type { HRTPhase } from '../components/HRTTimeline';

export interface ProfileData {
  username: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  hrtPhases?: HRTPhase[];
}

export const profile: ProfileData = {
  username: 'Sy',
  bio: '🏳️‍⚧️「重构时间线，再次重逢」 | 是夕妍？ | INFP | MtFtX | oler转oder | 🎂08.15 | Vite | Cpp | HRT 25.08.11~25.11.30 26.04.17~',
  avatarUrl: 'https://api.ddnsy.fun/avatar.webp',
  backgroundUrl: 'https://bing.img.run/rand.php',
  hrtPhases: [
    { label: 'Phase 1', start: '2025-08-11', end: '2025-11-30' },
    { label: 'Phase 2', start: '2026-04-17' },
  ],
};

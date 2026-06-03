import { type ProfileData } from '../data/profile';
import { createTagFilter } from './TagFilter';
import { createWeatherCard } from './WeatherCard';
import type { TweetData } from '../types/TweetData';

export function renderProfile(data: ProfileData, tweets?: TweetData[]): void {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  // Preload Bing background
  if (!document.querySelector('.bg-blur.loaded')) {
    const layers = Array.from(document.querySelectorAll<HTMLElement>('.bg-blur, .bg-clear, .bg-lens'));
    const bgBlur = document.querySelector<HTMLDivElement>('.bg-blur');
    if (bgBlur) {
      const preloader = new Image();
      preloader.src = data.backgroundUrl;
      preloader.onload = () => {
        document.documentElement.style.setProperty('--bg-image', `url(${preloader.src})`);
        for (const layer of layers) layer.classList.add('loaded');
      };
      preloader.onerror = () => {
        for (const layer of layers) layer.classList.add('loaded');
      };
    }
  }

  // Avatar with fallback
  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'sidebar-avatar-container';

  const avatar = document.createElement('img');
  avatar.src = data.avatarUrl;
  avatar.alt = `${data.username}'s avatar`;
  avatar.className = 'sidebar-avatar';
  avatar.width = 96;
  avatar.height = 96;
  avatar.loading = 'eager';
  avatar.decoding = 'async';

  avatar.onerror = () => {
    const fallback = document.createElement('div');
    fallback.className = 'sidebar-avatar-fallback';
    fallback.textContent = data.username.substring(0, 2);
    fallback.setAttribute('aria-label', `${data.username}'s avatar fallback`);
    avatar.replaceWith(fallback);
  };

  avatarContainer.appendChild(avatar);

  // Username
  const username = document.createElement('h1');
  username.className = 'sidebar-username';
  username.textContent = data.username;

  // Bio with tag support
  const bioContainer = document.createElement('div');
  bioContainer.className = 'sidebar-bio-container';

  const bioParts = data.bio
    .split(' | ')
    .map((part) => part.trim())
    .filter(Boolean);
  const [intro] = bioParts;

  if (intro) {
    const statusCard = document.createElement('section');
    statusCard.className = 'sidebar-bio-card';
    statusCard.setAttribute('aria-label', 'Profile status');

    const eyebrow = document.createElement('span');
    eyebrow.className = 'sidebar-bio-eyebrow';
    eyebrow.textContent = 'SIGNAL';

    const lede = document.createElement('p');
    lede.className = 'sidebar-bio-lede';
    lede.textContent = intro;

    statusCard.appendChild(eyebrow);
    statusCard.appendChild(lede);
    bioContainer.appendChild(statusCard);
  }

  sidebar.appendChild(avatarContainer);
  sidebar.appendChild(username);
  sidebar.appendChild(bioContainer);
  sidebar.appendChild(createWeatherCard());

  // Tag Filter
  if (tweets && tweets.length > 0) {
    const tagEl = createTagFilter(tweets);
    if (tagEl) sidebar.appendChild(tagEl);
  }
}

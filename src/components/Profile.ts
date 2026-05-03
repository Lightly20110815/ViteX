import { type ProfileData } from '../data/profile';

export function renderProfile(data: ProfileData): void {
  const profileEl = document.getElementById('profile');
  if (!profileEl) return;
  profileEl.innerHTML = '';

  // Preload Bing background and reveal it
  const bgLayer = document.querySelector<HTMLDivElement>('.bg-layer');
  if (bgLayer) {
    const preloader = new Image();
    preloader.src = data.backgroundUrl;
    preloader.onload = () => bgLayer.classList.add('loaded');
    preloader.onerror = () => bgLayer.classList.add('loaded'); // Show even on error
  }

  // Avatar with fallback
  const avatarWrap = document.createElement('div');
  avatarWrap.className = 'hero-avatar-wrap';

  const avatar = document.createElement('img');
  avatar.src = data.avatarUrl;
  avatar.alt = "Sy's avatar";
  avatar.className = 'hero-avatar';
  avatar.width = 96;
  avatar.height = 96;
  avatar.loading = 'eager';
  avatar.decoding = 'async';

  avatar.onerror = () => {
    const fallback = document.createElement('div');
    fallback.className = 'hero-avatar-fallback';
    fallback.textContent = 'Sy';
    fallback.setAttribute('aria-label', "Sy's avatar (initial)");
    avatar.replaceWith(fallback);
  };

  avatarWrap.appendChild(avatar);

  // Username
  const username = document.createElement('h1');
  username.className = 'hero-username';
  username.textContent = data.username;

  // Bio
  const bio = document.createElement('p');
  bio.className = 'hero-bio';
  bio.textContent = data.bio;

  profileEl.appendChild(avatarWrap);
  profileEl.appendChild(username);
  profileEl.appendChild(bio);
}

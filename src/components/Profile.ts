import { type ProfileData } from '../data/profile';

export function renderProfile(data: ProfileData): void {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  // Preload Bing background
  if (!document.querySelector('.bg-layer.loaded')) {
    const bgLayer = document.querySelector<HTMLDivElement>('.bg-layer');
    if (bgLayer) {
      const preloader = new Image();
      preloader.src = data.backgroundUrl;
      preloader.onload = () => bgLayer.classList.add('loaded');
      preloader.onerror = () => bgLayer.classList.add('loaded');
    }
  }

  // Avatar with fallback
  const avatar = document.createElement('img');
  avatar.src = data.avatarUrl;
  avatar.alt = "Sy's avatar";
  avatar.className = 'sidebar-avatar';
  avatar.width = 88;
  avatar.height = 88;
  avatar.loading = 'eager';
  avatar.decoding = 'async';

  avatar.onerror = () => {
    const fallback = document.createElement('div');
    fallback.className = 'sidebar-avatar-fallback';
    fallback.textContent = 'Sy';
    fallback.setAttribute('aria-label', "Sy's avatar (initial)");
    avatar.replaceWith(fallback);
  };

  // Username
  const username = document.createElement('h1');
  username.className = 'sidebar-username';
  username.textContent = data.username;

  // Bio
  const bio = document.createElement('p');
  bio.className = 'sidebar-bio';
  bio.textContent = data.bio;

  sidebar.appendChild(avatar);
  sidebar.appendChild(username);
  sidebar.appendChild(bio);
}

import { type ProfileData } from '../data/profile';

export function renderProfile(data: ProfileData): void {
  const profileEl = document.getElementById('profile');
  if (!profileEl) return;

  const bgEl = document.createElement('div');
  bgEl.className = 'page-bg';
  bgEl.setAttribute('aria-hidden', 'true');
  document.body.prepend(bgEl);

  const preloader = new Image();
  preloader.src = data.backgroundUrl;
  preloader.onload = () => {
    bgEl.classList.add('loaded');
  };
  preloader.onerror = () => {};

  const avatar = document.createElement('img');
  avatar.src = data.avatarUrl;
  avatar.alt = "Sy's avatar";
  avatar.className = 'profile-avatar';
  avatar.width = 96;
  avatar.height = 96;
  avatar.loading = 'lazy';
  avatar.decoding = 'async';

  avatar.onerror = () => {
    const fallback = document.createElement('div');
    fallback.className = 'profile-avatar-fallback';
    fallback.textContent = 'Sy';
    fallback.setAttribute('aria-label', "Sy's avatar (fallback)");
    avatar.replaceWith(fallback);
  };

  const username = document.createElement('h1');
  username.className = 'profile-username';
  username.textContent = data.username;

  const bio = document.createElement('p');
  bio.className = 'profile-bio';
  bio.textContent = data.bio;

  profileEl.appendChild(avatar);
  profileEl.appendChild(username);
  profileEl.appendChild(bio);
}

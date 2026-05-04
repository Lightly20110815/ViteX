import { type ProfileData } from '../data/profile';

export function renderProfile(data: ProfileData): void {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  // Preload Bing background
  if (!document.querySelector('.bg-blur.loaded')) {
    const bgBlur = document.querySelector<HTMLDivElement>('.bg-blur');
    if (bgBlur) {
      const preloader = new Image();
      preloader.src = data.backgroundUrl;
      preloader.onload = () => {
        document.documentElement.style.setProperty('--bg-image', `url(${preloader.src})`);
        bgBlur.classList.add('loaded');
      };
      preloader.onerror = () => bgBlur.classList.add('loaded');
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
  
  const bioParts = data.bio.split(' | ');
  bioParts.forEach(part => {
    const p = document.createElement('p');
    p.className = 'sidebar-bio-part';
    
    // Check if it's a tag-like part (short, no spaces)
    if (part.length < 15 && !part.includes(' ')) {
      p.classList.add('sidebar-bio-tag');
    }
    
    p.textContent = part;
    bioContainer.appendChild(p);
  });

  sidebar.appendChild(avatarContainer);
  sidebar.appendChild(username);
  sidebar.appendChild(bioContainer);
}

import './styles.css';

import { tweets } from './data/tweets';
import { profile } from './data/profile';
import { renderProfile } from './components/Profile';
import { renderTimeline } from './components/Timeline';
import { renderCanvasParticles } from './components/CanvasParticles';

function main(): void {
  renderCanvasParticles();
  renderProfile(profile);
  renderTimeline(tweets);
  renderFooter();

  requestAnimationFrame(() => {
    const appEl = document.querySelector('.app');
    if (appEl) {
      appEl.classList.add('app-ready');
    }
  });

  initPointerTrack();
  initCardPerspective();
}

function initPointerTrack(): void {
  let mr = 120;
  const clearBg = document.querySelector<HTMLElement>('.bg-clear');
  if (!clearBg) return;

  function updateMask(x: number, y: number, r: number): void {
    const val = `radial-gradient(circle ${r}px at ${x}px ${y}px, #000 0%, rgba(0,0,0,0.5) 60%, transparent 100%)`;
    clearBg!.style.webkitMask = val;
    clearBg!.style.mask = val;
  }

  document.addEventListener('mousemove', (e) => {
    updateMask(e.clientX, e.clientY, mr);
  });

  document.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      mr = Math.max(60, Math.min(350, mr - e.deltaY * 0.3));
    }
  }, { passive: true });
}

function initCardPerspective(): void {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.tweet-card'));
  if (cards.length === 0) return;

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let frame = 0;

  function updateCards(): void {
    frame = 0;

    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateY = clamp(((pointerX - centerX) / window.innerWidth) * 18, -10, 10);
      const rotateX = clamp(((centerY - pointerY) / window.innerHeight) * 14, -8, 8);
      const glowX = clamp(((pointerX - rect.left) / rect.width) * 100, -20, 120);
      const glowY = clamp(((pointerY - rect.top) / rect.height) * 100, -20, 120);

      card.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`);
      card.style.setProperty('--card-glow-x', `${glowX.toFixed(2)}%`);
      card.style.setProperty('--card-glow-y', `${glowY.toFixed(2)}%`);
    }
  }

  function scheduleUpdate(): void {
    if (frame === 0) {
      frame = requestAnimationFrame(updateCards);
    }
  }

  document.addEventListener('pointermove', (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    scheduleUpdate();
  }, { passive: true });
  document.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });

  updateCards();
}

function renderFooter(): void {
  const el = document.getElementById('footer');
  if (!el) return;
  const year = new Date().getFullYear();
  el.innerHTML = `&copy; ${year} Sy &middot; Powered by <a href="https://github.com" style="color: inherit; text-decoration: none; border-bottom: 1px dashed var(--text-tertiary);">ViteX</a>`;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

import './styles.css';

import { tweets } from './data/tweets';
import { profile } from './data/profile';
import { renderProfile } from './components/Profile';
import { renderTimeline } from './components/Timeline';
import { renderCanvasParticles } from './components/CanvasParticles';
import { renderCursor } from './components/Cursor';
import { renderTrailingCursor } from './components/TrailingCursor';
import { createHRTTimeline } from './components/HRTTimeline';
import { createMoodStats } from './components/MoodStats';
import { renderMusicPlayer } from './components/MusicPlayer';

function main(): void {
  renderCanvasParticles();
  renderCursor();
  renderTrailingCursor();
  renderProfile(profile, tweets);
  renderInsights();
  renderTimeline(tweets);
  if (profile.music) renderMusicPlayer(profile.music);
  renderFooter();

  requestAnimationFrame(() => {
    const appEl = document.querySelector('.app');
    if (appEl) {
      appEl.classList.add('app-ready');
    }
  });

  initPointerTrack();
  initCardPerspective();
  initScrollExperience();
}

function renderInsights(): void {
  const el = document.getElementById('insights');
  if (!el) return;
  el.innerHTML = '';

  if (profile.hrtPhases && profile.hrtPhases.length > 0) {
    el.appendChild(createHRTTimeline(profile.hrtPhases));
  }

  const moodEl = createMoodStats(tweets);
  if (moodEl) {
    el.appendChild(moodEl);
  }
}
function initPointerTrack(): void {
  const clearBg = document.querySelector<HTMLElement>('.bg-clear');
  const lens = document.querySelector<HTMLElement>('.bg-lens');
  if (!clearBg && !lens) return;

  document.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;

    if (clearBg) {
      clearBg.style.setProperty('--portal-dx', `${nx * 28}px`);
      clearBg.style.setProperty('--portal-dy', `${ny * 22}px`);
      clearBg.style.setProperty('--portal-rot', `${-4 + nx * 5}deg`);
      clearBg.style.setProperty('--portal-glint', `${nx * 42}px`);
    }

    if (lens) {
      lens.style.setProperty('--lens-dx', `${nx * -34}px`);
      lens.style.setProperty('--lens-dy', `${ny * -24}px`);
    }
  });
}

function initCardPerspective(): void {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let frame = 0;

  function getTargets(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.tweet-card, .sidebar'));
  }

  function updateCards(): void {
    frame = 0;
    const targets = getTargets();

    for (const card of targets) {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateY = clamp(((pointerX - centerX) / window.innerWidth) * 14, -7, 7);
      const rotateX = clamp(((centerY - pointerY) / window.innerHeight) * 10, -5, 5);

      card.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`);
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

  // Re-apply to new cards after DOM changes (e.g. tag filter)
  const observer = new MutationObserver(() => scheduleUpdate());
  observer.observe(document.getElementById('timeline')!, { childList: true });

  updateCards();
}


function initScrollExperience(): void {
  const root = document.documentElement;
  const progress = document.querySelector<HTMLElement>('.scroll-progress');
  const missionValue = document.querySelector<HTMLElement>('.mission-console-value');
  const clearBg = document.querySelector<HTMLElement>('.bg-clear');
  const lens = document.querySelector<HTMLElement>('.bg-lens');
  let currentCard: Element | null = null;

  function updateCurrentCard(): void {
    let nextCard: Element | null = null;
    let minDistance = Number.POSITIVE_INFINITY;
    const targetY = window.innerHeight * 0.46;

    document.querySelectorAll('.tweet-card').forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const distance = Math.abs(rect.top + rect.height / 2 - targetY);
      if (distance < minDistance) {
        minDistance = distance;
        nextCard = card;
      }
    });

    if (nextCard !== currentCard) {
      if (currentCard) currentCard.classList.remove('is-current');
      if (nextCard) (nextCard as Element).classList.add('is-current');
      currentCard = nextCard;
    }
  }

  function updateProgress(): void {
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / max));
    root.style.setProperty('--scroll-progress', ratio.toFixed(4));
    if (progress) progress.style.setProperty('--scroll-progress', ratio.toFixed(4));
    if (missionValue) missionValue.textContent = `${Math.round(ratio * 100).toString().padStart(2, '0')}%`;
    if (clearBg) clearBg.style.setProperty('--scroll-drift', `${ratio * 34}px`);
    if (lens) lens.style.setProperty('--scroll-drift', `${ratio * -28}px`);
    updateCurrentCard();
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    }
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  function trackReveal(el: Element): void {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  }

  document.querySelectorAll('.tweet-card, .insight-panel, .sidebar').forEach(trackReveal);

  const timeline = document.getElementById('timeline');
  if (timeline) {
    new MutationObserver(() => {
      timeline.querySelectorAll('.tweet-card:not(.reveal-on-scroll)').forEach(trackReveal);
      updateCurrentCard();
    }).observe(timeline, { childList: true });
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
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

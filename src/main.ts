import './styles.css';

import { tweets } from './data/tweets';
import { profile } from './data/profile';
import { renderProfile } from './components/Profile';
import { renderTimeline } from './components/Timeline';

function main(): void {
  renderProfile(profile);
  renderTimeline(tweets);
  renderFooter();
}

function renderFooter(): void {
  const footerEl = document.getElementById('footer');
  if (!footerEl) return;

  const text = document.createElement('p');
  text.className = 'footer-text';
  const year = new Date().getFullYear();
  text.textContent = `Powered by ViteX · ${year}`;
  footerEl.appendChild(text);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

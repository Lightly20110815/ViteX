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
  const el = document.getElementById('footer');
  if (!el) return;
  const year = new Date().getFullYear();
  el.textContent = `Powered by ViteX · ${year}`;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

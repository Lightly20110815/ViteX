import './mobile.css';

import { tweets } from './data/tweets';
import { profile } from './data/profile';
import { formatRelativeTime } from './utils/time';
import { getMetingList } from './utils/meting';
import { fetchLiveWeather } from './utils/weather';
import type { TweetData } from './types/TweetData';

function main(): void {
  renderHero();
  renderFeatured();
  renderFragments();
  renderDashboard();
  renderMusic();
  renderClose();
}

/* ============================================
   Section 1: Hero
   ============================================ */
function renderHero(): void {
  const el = document.getElementById('m-hero');
  if (!el) return;

  const todayCount = tweets.filter((t) => {
    const d = new Date(t.meta.created);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  el.innerHTML = `
    <p class="m-eyebrow">Personal Timeline</p>
    <h1 class="m-display-xxl mt-16">${escapeHtml(profile.username)}</h1>
    <p class="m-body-l mt-14" style="max-width:300px">
      ${escapeHtml(profile.bio)}
    </p>
    <a href="#m-fragments" class="m-text-link mt-20">
      ${todayCount} fragments today &rarr;
    </a>
  `;
}

/* ============================================
   Section 2: Featured project
   ============================================ */
function renderFeatured(): void {
  const el = document.getElementById('m-featured');
  if (!el) return;

  el.innerHTML = `
    <p class="m-eyebrow">Featured</p>
    <div class="m-fcard m-fcard-border mt-16">
      <div class="m-fc-icon">&sub;</div>
      <div class="m-fc-title">vitex</div>
      <div class="m-fc-desc">
        Personal timeline static site &middot; Vite + Vercel.<br>
        Markdown-driven, vanilla TypeScript, no framework.
      </div>
      <div class="m-flex-between mt-16">
        <span class="m-code" style="color:var(--m-muted)">feda9db fix(post-tool)</span>
        <span class="m-code" style="color:var(--m-success)">+3 / &minus;1</span>
      </div>
      <a href="https://github.com/Lightly20110815/vitex" class="m-fc-link">View repository &rarr;</a>
    </div>
  `;
}

/* ============================================
   Section 3: Latest fragments (tweet stream)
   ============================================ */
function renderFragments(): void {
  const el = document.getElementById('m-fragments');
  if (!el) return;

  const recent = tweets.slice(0, 10);
  const rows = recent
    .map(
      (t) => `
    <article class="m-story">
      <div class="m-story-date">${formatRelativeTime(t.meta.created)}</div>
      <div class="m-story-title">${pickTitle(t)}</div>
      <div class="m-story-desc">${truncateText(stripHtml(t.html), 120)}</div>
      <div class="mt-12" style="display:flex;gap:6px;flex-wrap:wrap">
        ${renderBadges(t)}
      </div>
    </article>
  `,
    )
    .join('');

  el.innerHTML = `
    <p class="m-eyebrow">Latest Fragments</p>
    <h2 class="m-display-l mt-8 mb-16">Recent thoughts</h2>
    ${rows}
  `;
}

function pickTitle(t: TweetData): string {
  const text = stripHtml(t.html).trim();
  const firstLine = text.split('\n')[0];
  return firstLine.slice(0, 40) || 'Untitled';
}

function truncateText(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function renderBadges(t: TweetData): string {
  const tags = t.meta.tags || [];
  return tags
    .map((tag, i) => {
      const cls = i === 0 ? 'm-badge-coral' : 'm-badge';
      return `<span class="${cls}">#${escapeHtml(tag.toUpperCase())}</span>`;
    })
    .join('');
}

/* ============================================
   Section 4: Dashboard cards
   ============================================ */
function renderDashboard(): void {
  const el = document.getElementById('m-dashboard');
  if (!el) return;

  const todayCount = tweets.filter((t) => {
    const d = new Date(t.meta.created);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const totalCount = tweets.length;

  el.innerHTML = `
    <p class="m-eyebrow">Dashboard</p>
    <h2 class="m-display-m mt-8 mb-4">Right now</h2>
    <div class="m-col-2 mt-20">
      <div class="m-fcard">
        <div class="m-fc-icon" id="m-weather-icon">--</div>
        <div class="m-fc-title" id="m-weather-city">--</div>
        <div class="m-fc-desc" id="m-weather-detail">loading…</div>
      </div>
      <div class="m-fcard">
        <div class="m-fc-icon">&star;</div>
        <div class="m-fc-title">${escapeHtml(profile.username)}</div>
        <div class="m-fc-desc">online &middot; with you, through all.</div>
      </div>
      <div class="m-fcard m-text-center">
        <div class="m-stat-num">${todayCount}</div>
        <div class="m-stat-lbl mt-8">Fragments today</div>
      </div>
      <div class="m-fcard m-text-center">
        <div class="m-stat-num">${totalCount}</div>
        <div class="m-stat-lbl mt-8">Total</div>
      </div>
    </div>
  `;

  fetchWeather();
}

async function fetchWeather(): Promise<void> {
  try {
    const data = await fetchLiveWeather();
    if (!data) throw new Error('no weather data');
    const icon = getWeatherIcon(data.weather);
    const iconEl = document.getElementById('m-weather-icon');
    const cityEl = document.getElementById('m-weather-city');
    const detailEl = document.getElementById('m-weather-detail');
    if (iconEl) iconEl.textContent = icon;
    if (cityEl) cityEl.textContent = data.city || '--';
    if (detailEl)
      detailEl.textContent = `${data.temperature}° · 湿度 ${data.humidity}% · ${data.windpower}`;
  } catch {
    const iconEl = document.getElementById('m-weather-icon');
    const cityEl = document.getElementById('m-weather-city');
    const detailEl = document.getElementById('m-weather-detail');
    if (iconEl) iconEl.textContent = '--';
    if (cityEl) cityEl.textContent = 'Unavailable';
    if (detailEl) detailEl.textContent = 'weather data offline';
  }
}

function getWeatherIcon(weather: string): string {
  if (weather.includes('晴')) return '☀️';
  if (weather.includes('云')) return '⛅';
  if (weather.includes('雨')) return '🌧️';
  if (weather.includes('雪')) return '🌨️';
  if (weather.includes('雾') || weather.includes('霉')) return '🌫️';
  if (weather.includes('阴')) return '☁️';
  return '🌤️';
}

/* ============================================
   Section 5: Now Playing (dark)
   ============================================ */
let musicAudio: HTMLAudioElement | null = null;

function renderMusic(): void {
  const el = document.getElementById('m-music');
  if (!el) return;

  el.innerHTML = `
    <div class="m-music-row">
      <div class="m-music-art" id="m-music-cover">&sung;</div>
      <div style="min-width:0">
        <div class="m-music-title" id="m-music-track">loading…</div>
        <div class="m-music-artist" id="m-music-artist">connecting…</div>
      </div>
      <button id="m-music-play" class="m-music-play" aria-label="play" style="display:none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
    <div class="m-progress mt-24">
      <div class="m-progress-fill" id="m-music-bar" style="width:0%"></div>
    </div>
    <div class="m-flex-between mt-8">
      <span class="m-code" style="color:var(--m-on-dark-soft)" id="m-music-current">--:--</span>
      <span class="m-code" style="color:var(--m-on-dark-soft)" id="m-music-duration">--:--</span>
    </div>
  `;

  loadMusic();
}

async function loadMusic(): Promise<void> {
  try {
    const list = await getMetingList();
    if (list.length === 0) throw new Error('empty playlist');

    const song = list[Math.floor(Math.random() * list.length)];
    const trackEl = document.getElementById('m-music-track');
    const artistEl = document.getElementById('m-music-artist');
    const coverEl = document.getElementById('m-music-cover');
    if (trackEl) trackEl.textContent = (song as Record<string,string>).title || song.name || 'Untitled';
    if (artistEl) artistEl.textContent = (song as Record<string,string>).author || song.artist || 'Unknown';

    if (song.url) {
      musicAudio = new Audio(song.url);
      musicAudio.addEventListener('loadedmetadata', () => {
        const durEl = document.getElementById('m-music-duration');
        if (durEl && musicAudio) durEl.textContent = formatTime(musicAudio.duration);
      });
      musicAudio.addEventListener('timeupdate', () => {
        const curEl = document.getElementById('m-music-current');
        const barEl = document.getElementById('m-music-bar');
        if (curEl && musicAudio) curEl.textContent = formatTime(musicAudio.currentTime);
        if (barEl && musicAudio && musicAudio.duration) {
          barEl.style.width = `${(musicAudio.currentTime / musicAudio.duration) * 100}%`;
        }
      });

      const playBtn = document.getElementById('m-music-play');
      if (playBtn) {
        playBtn.style.display = '';
        playBtn.addEventListener('click', () => {
          if (!musicAudio) return;
          if (musicAudio.paused) {
            musicAudio.play();
            playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
          } else {
            musicAudio.pause();
            playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
          }
        });
      }
    }

    if (coverEl && song.cover) {
      coverEl.innerHTML = `<img src="${escapeAttr(song.cover)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px" />`;
    }
  } catch {
    const trackEl = document.getElementById('m-music-track');
    const artistEl = document.getElementById('m-music-artist');
    if (trackEl) trackEl.textContent = 'signal lost';
    if (artistEl) artistEl.textContent = 'music unavailable';
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ============================================
   Section 6: Close
   ============================================ */
function renderClose(): void {
  const el = document.getElementById('m-close');
  if (!el) return;

  el.innerHTML = `
    <h2 class="m-close-motto m-text-center">
      No errors.<br>Only unresolved feelings.
    </h2>
    <p class="m-close-sub m-text-center mt-14">
      ViteX &middot; Personal Timeline
    </p>
    <div class="m-close-links mt-28">
      <a href="/rss.xml" class="m-close-link">RSS</a>
      <a href="https://github.com/Lightly20110815/vitex" class="m-close-link accent">GitHub</a>
    </div>
    <p class="m-close-copy m-text-center mt-24">
      &copy; ${new Date().getFullYear()} ${escapeHtml(profile.username)}
    </p>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

main();

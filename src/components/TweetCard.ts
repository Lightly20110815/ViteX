import type { TweetData } from '../types/TweetData';
import { formatRelativeTime } from '../utils/time';
import { openLightbox } from './Lightbox';
import { openShareCard } from './ShareCard';

export function createTweetCard(tweet: TweetData): HTMLElement {
  const article = document.createElement('article');
  article.className = 'tweet-card';
  article.id = `tweet-${tweet.slug}`;
  article.dataset.tags = (tweet.meta.tags || []).join(',');

  const header = document.createElement('header');
  header.className = 'tweet-header';

  const username = document.createElement('span');
  username.className = 'tweet-username';
  username.textContent = 'Sy';

  const mood = document.createElement('span');
  mood.className = 'tweet-mood';
  mood.textContent = tweet.meta.mood;
  mood.setAttribute('aria-label', `Mood: ${tweet.meta.mood}`);

  const time = document.createElement('time');
  time.className = 'tweet-time';
  time.setAttribute('datetime', tweet.meta.created);
  time.textContent = formatRelativeTime(tweet.meta.created);

  const shareBtn = document.createElement('button');
  shareBtn.className = 'tweet-share-btn';
  shareBtn.setAttribute('aria-label', '生成分享卡片');
  shareBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`;
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openShareCard(tweet);
  });

  header.appendChild(username);
  header.appendChild(mood);
  header.appendChild(time);
  header.appendChild(shareBtn);

  const body = document.createElement('div');
  body.className = 'tweet-body';
  body.innerHTML = tweet.html;

  article.appendChild(header);
  article.appendChild(body);

  // Tags
  if (tweet.meta.tags && tweet.meta.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'tweet-tags';
    for (const tag of tweet.meta.tags) {
      const tagEl = document.createElement('span');
      tagEl.className = 'tweet-tag';
      tagEl.textContent = `#${tag}`;
      tagEl.addEventListener('click', () => {
        dispatchTagFilterEvent(tag);
      });
      tagsContainer.appendChild(tagEl);
    }
    article.appendChild(tagsContainer);
  }

  // Images
  if (tweet.meta.images && tweet.meta.images.length > 0) {
    const imagesContainer = document.createElement('div');
    imagesContainer.className = `tweet-images ${tweet.meta.images.length === 1 ? 'single' : 'multiple'}`;
    for (const url of tweet.meta.images) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Tweet image';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('click', () => openLightbox(url));
      imagesContainer.appendChild(img);
    }
    article.appendChild(imagesContainer);
  }

  return article;
}

function dispatchTagFilterEvent(tag: string): void {
  window.dispatchEvent(new CustomEvent('vitex:filter-tag', { detail: tag }));
}

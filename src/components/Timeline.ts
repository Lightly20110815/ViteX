import type { TweetData } from '../types/TweetData';
import { createTweetCard } from './TweetCard';

let allTweets: TweetData[] = [];

export function renderTimeline(tweets: TweetData[]): void {
  allTweets = tweets;
  renderFiltered(null);

  window.addEventListener('vitex:filter-tag' as never, ((e: CustomEvent<string | null>) => {
    renderFiltered(e.detail);
  }) as EventListener);
}

function renderFiltered(tag: string | null): void {
  const timelineEl = document.getElementById('timeline');
  if (!timelineEl) return;

  timelineEl.innerHTML = '';

  const filtered = tag
    ? allTweets.filter(t => t.meta.tags?.includes(tag))
    : allTweets;

  if (filtered.length === 0) {
    const emptyCard = document.createElement('article');
    emptyCard.className = 'tweet-card tweet-card-empty';

    const heading = document.createElement('h2');
    heading.textContent = tag ? `没有 #${tag} 的推文。` : '还没有推文。';

    const body = document.createElement('p');
    body.textContent = tag
      ? '试试其他标签吧。'
      : '在 content/tweets/ 目录下创建你的第一篇 Markdown 推文吧。';

    emptyCard.appendChild(heading);
    emptyCard.appendChild(body);
    timelineEl.appendChild(emptyCard);
    return;
  }

  for (const tweet of filtered) {
    timelineEl.appendChild(createTweetCard(tweet));
  }
}

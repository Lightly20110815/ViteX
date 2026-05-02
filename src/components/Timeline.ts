import type { TweetData } from '../types/TweetData';
import { createTweetCard } from './TweetCard';

export function renderTimeline(tweets: TweetData[]): void {
  const timelineEl = document.getElementById('timeline');
  if (!timelineEl) return;

  timelineEl.innerHTML = '';

  if (tweets.length === 0) {
    const emptyCard = document.createElement('article');
    emptyCard.className = 'tweet-card';

    const heading = document.createElement('h2');
    heading.textContent = '还没有推文。';
    heading.style.cssText = 'font-size:18px;font-weight:600;margin-bottom:8px;color:var(--text-primary)';

    const body = document.createElement('p');
    body.textContent = '在 content/tweets/ 目录下创建你的第一篇 Markdown 推文吧。';
    body.style.cssText = 'font-size:16px;color:var(--text-secondary);margin:0';

    emptyCard.appendChild(heading);
    emptyCard.appendChild(body);
    timelineEl.appendChild(emptyCard);
    return;
  }

  for (const tweet of tweets) {
    const card = createTweetCard(tweet);
    timelineEl.appendChild(card);
  }
}

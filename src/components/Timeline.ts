import type { TweetData } from '../types/TweetData';
import { createTweetCard } from './TweetCard';

export function renderTimeline(tweets: TweetData[]): void {
  const timelineEl = document.getElementById('timeline');
  if (!timelineEl) return;

  timelineEl.innerHTML = '';

  if (tweets.length === 0) {
    const emptyCard = document.createElement('article');
    emptyCard.className = 'tweet-card tweet-card-empty';

    const heading = document.createElement('h2');
    heading.textContent = '还没有推文。';

    const body = document.createElement('p');
    body.textContent = '在 content/tweets/ 目录下创建你的第一篇 Markdown 推文吧。';

    emptyCard.appendChild(heading);
    emptyCard.appendChild(body);
    timelineEl.appendChild(emptyCard);
    return;
  }

  for (const tweet of tweets) {
    timelineEl.appendChild(createTweetCard(tweet));
  }
}

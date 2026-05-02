import type { TweetData } from '../types/TweetData';
import { formatRelativeTime } from '../utils/time';

export function createTweetCard(tweet: TweetData): HTMLElement {
  const article = document.createElement('article');
  article.className = 'tweet-card';
  article.id = `tweet-${tweet.slug}`;

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

  header.appendChild(username);
  header.appendChild(mood);
  header.appendChild(time);

  const body = document.createElement('div');
  body.className = 'tweet-body';
  body.innerHTML = tweet.html;

  article.appendChild(header);
  article.appendChild(body);

  return article;
}

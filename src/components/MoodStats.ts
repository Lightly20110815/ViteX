import type { TweetData } from '../types/TweetData';

export function createMoodStats(tweets: TweetData[]): HTMLElement | null {
  const moodCounts: Record<string, number> = {};
  for (const tweet of tweets) {
    const mood = tweet.meta.mood;
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  }

  const entries = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const [topMood, topCount] = entries[0];
  const topPercent = Math.round((topCount / total) * 100);
  const visibleMoods = entries;

  const container = document.createElement('section');
  container.className = 'mood-stats insight-panel insight-panel-mood';
  container.setAttribute('aria-labelledby', 'mood-stats-title');

  const header = document.createElement('div');
  header.className = 'mood-stats-header';

  const title = document.createElement('h2');
  title.id = 'mood-stats-title';
  title.className = 'mood-stats-title';
  title.textContent = 'Moodboard';

  const subtitle = document.createElement('p');
  subtitle.className = 'mood-stats-subtitle';
  subtitle.textContent = `${total} 条记录 · ${entries.length} 种情绪`;

  header.appendChild(title);
  header.appendChild(subtitle);

  const spotlight = document.createElement('div');
  spotlight.className = 'mood-spotlight';
  spotlight.setAttribute('aria-label', `主导情绪 ${topMood}，占 ${topPercent}%`);

  const spotlightMood = document.createElement('span');
  spotlightMood.className = 'mood-spotlight-emoji';
  spotlightMood.textContent = topMood;
  spotlightMood.setAttribute('aria-hidden', 'true');

  const spotlightCopy = document.createElement('div');
  spotlightCopy.className = 'mood-spotlight-copy';

  const spotlightLabel = document.createElement('span');
  spotlightLabel.className = 'mood-spotlight-label';
  spotlightLabel.textContent = '主导情绪';

  const spotlightValue = document.createElement('strong');
  spotlightValue.className = 'mood-spotlight-value';
  spotlightValue.textContent = `${topPercent}%`;

  spotlightCopy.appendChild(spotlightLabel);
  spotlightCopy.appendChild(spotlightValue);
  spotlight.appendChild(spotlightMood);
  spotlight.appendChild(spotlightCopy);

  const strip = document.createElement('div');
  strip.className = 'mood-strip';
  strip.setAttribute('aria-label', `Mood 分布，共 ${total} 条记录`);

  for (const [mood, count] of visibleMoods) {
    const percent = Math.round((count / total) * 100);

    const item = document.createElement('div');
    item.className = 'mood-strip-segment';
    item.style.flexGrow = String(count);
    item.title = `${mood} ${count} 条，占 ${percent}%`;
    item.setAttribute('aria-label', `${mood} ${count} 条，占 ${percent}%`);

    strip.appendChild(item);
  }

  const list = document.createElement('div');
  list.className = 'mood-list';

  for (const [mood, count] of visibleMoods) {
    const percent = Math.round((count / total) * 100);

    const item = document.createElement('div');
    item.className = 'mood-stat-row';
    item.setAttribute('aria-label', `${mood} ${count} 条，占 ${percent}%`);

    const icon = document.createElement('span');
    icon.className = 'mood-stat-emoji';
    icon.textContent = mood;
    icon.setAttribute('aria-hidden', 'true');

    const value = document.createElement('span');
    value.className = 'mood-stat-value';
    value.textContent = `${percent}%`;

    const countEl = document.createElement('span');
    countEl.className = 'mood-stat-count';
    countEl.textContent = `${count} 条`;

    item.appendChild(icon);
    item.appendChild(value);
    item.appendChild(countEl);
    list.appendChild(item);
  }

  container.appendChild(header);
  container.appendChild(spotlight);
  container.appendChild(strip);
  container.appendChild(list);

  return container;
}

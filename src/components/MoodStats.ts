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

  const container = document.createElement('section');
  container.className = 'mood-stats insight-panel insight-panel-mood';
  container.setAttribute('aria-labelledby', 'mood-stats-title');

  const eyebrow = document.createElement('p');
  eyebrow.className = 'insight-eyebrow';
  eyebrow.textContent = 'Moodboard';

  const title = document.createElement('h2');
  title.id = 'mood-stats-title';
  title.className = 'insight-title';
  title.textContent = '情绪分布';

  const strip = document.createElement('div');
  strip.className = 'mood-strip';
  strip.setAttribute('aria-label', `共 ${total} 条 mood 记录`);

  for (const [mood, count] of entries) {
    const percent = Math.round((count / total) * 100);

    const item = document.createElement('div');
    item.className = 'mood-stat-row';
    item.style.flexGrow = String(count);
    item.setAttribute('aria-label', `${mood} ${count} 条，占 ${percent}%`);

    const icon = document.createElement('span');
    icon.className = 'mood-stat-emoji';
    icon.textContent = mood;
    icon.setAttribute('aria-hidden', 'true');

    const value = document.createElement('span');
    value.className = 'mood-stat-value';
    value.textContent = `${percent}%`;

    item.appendChild(icon);
    item.appendChild(value);
    strip.appendChild(item);
  }

  const legend = document.createElement('div');
  legend.className = 'mood-legend';

  for (const [mood, count] of entries) {
    const item = document.createElement('span');
    item.className = 'mood-legend-item';
    item.textContent = `${mood} ${count}`;
    legend.appendChild(item);
  }

  container.appendChild(eyebrow);
  container.appendChild(title);
  container.appendChild(strip);
  container.appendChild(legend);
  return container;
}

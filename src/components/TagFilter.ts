import type { TweetData } from '../types/TweetData';

let activeTag: string | null = null;

export function createTagFilter(tweets: TweetData[]): HTMLElement | null {
  const tagCounts: Record<string, number> = {};
  for (const tweet of tweets) {
    for (const tag of tweet.meta.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const entries = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  const container = document.createElement('div');
  container.className = 'tag-filter';

  const title = document.createElement('h3');
  title.className = 'tag-filter-title';
  title.textContent = '标签';
  container.appendChild(title);

  const cloud = document.createElement('div');
  cloud.className = 'tag-cloud';

  // "全部" button
  const allBtn = document.createElement('button');
  allBtn.className = 'tag-cloud-item tag-cloud-active';
  allBtn.textContent = '全部';
  allBtn.addEventListener('click', () => {
    activeTag = null;
    updateActiveTag(cloud, null);
    dispatchTagFilterEvent(null);
  });
  cloud.appendChild(allBtn);

  for (const [tag, count] of entries) {
    const btn = document.createElement('button');
    btn.className = 'tag-cloud-item';
    btn.textContent = `${tag} (${count})`;
    btn.addEventListener('click', () => {
      activeTag = tag;
      updateActiveTag(cloud, tag);
      dispatchTagFilterEvent(tag);
    });
    cloud.appendChild(btn);
  }

  container.appendChild(cloud);
  return container;
}

function updateActiveTag(cloud: HTMLElement, active: string | null): void {
  const items = cloud.querySelectorAll('.tag-cloud-item');
  items.forEach((item, index) => {
    if (active === null && index === 0) {
      item.classList.add('tag-cloud-active');
    } else if (active !== null && item.textContent?.startsWith(active)) {
      item.classList.add('tag-cloud-active');
    } else {
      item.classList.remove('tag-cloud-active');
    }
  });
}

function dispatchTagFilterEvent(tag: string | null): void {
  window.dispatchEvent(new CustomEvent('vitex:filter-tag', { detail: tag }));
}

import type { TweetData } from '../types/TweetData';

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

  const header = document.createElement('div');
  header.className = 'tag-filter-header';

  const title = document.createElement('h3');
  title.className = 'tag-filter-title';
  title.textContent = '\u6807\u7b7e';

  const meta = document.createElement('span');
  meta.className = 'tag-filter-meta';
  meta.textContent = `${entries.length} TOPICS`;

  header.appendChild(title);
  header.appendChild(meta);
  container.appendChild(header);

  const cloud = document.createElement('div');
  cloud.className = 'tag-cloud';

  const allBtn = document.createElement('button');
  allBtn.className = 'tag-cloud-item tag-cloud-item-all tag-cloud-active';
  allBtn.type = 'button';
  allBtn.setAttribute('aria-pressed', 'true');
  appendTagButtonContent(allBtn, '\u5168\u90e8', tweets.length);
  allBtn.addEventListener('click', () => {
    updateActiveTag(cloud, null);
    dispatchTagFilterEvent(null);
  });
  cloud.appendChild(allBtn);

  for (const [tag, count] of entries) {
    const btn = document.createElement('button');
    btn.className = 'tag-cloud-item';
    btn.type = 'button';
    btn.dataset.tag = tag;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `${tag}, ${count} posts`);
    appendTagButtonContent(btn, tag, count);
    btn.addEventListener('click', () => {
      updateActiveTag(cloud, tag);
      dispatchTagFilterEvent(tag);
    });
    cloud.appendChild(btn);
  }

  container.appendChild(cloud);

  // Sync active state when tag filter is triggered externally (e.g. tweet tag click)
  window.addEventListener('vitex:filter-tag', ((e: CustomEvent<string | null>) => {
    updateActiveTag(cloud, e.detail);
  }) as EventListener);

  return container;
}

function appendTagButtonContent(button: HTMLButtonElement, label: string, count: number): void {
  const name = document.createElement('span');
  name.className = 'tag-cloud-name';
  name.textContent = label;

  const badge = document.createElement('span');
  badge.className = 'tag-cloud-count';
  badge.textContent = String(count);

  button.appendChild(name);
  button.appendChild(badge);
}

function updateActiveTag(cloud: HTMLElement, active: string | null): void {
  const items = cloud.querySelectorAll('.tag-cloud-item');
  items.forEach((item, index) => {
    const isActive = active === null ? index === 0 : (item as HTMLElement).dataset.tag === active;
    item.classList.toggle('tag-cloud-active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });
}

function dispatchTagFilterEvent(tag: string | null): void {
  window.dispatchEvent(new CustomEvent('vitex:filter-tag', { detail: tag }));
}

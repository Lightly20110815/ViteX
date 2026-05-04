import type { TweetData } from '../types/TweetData';

const modules = import.meta.glob('/content/tweets/**/*.md', { eager: true });

export const tweets: TweetData[] = Object.entries(modules)
  .map(([path, mod]) => {
    const m = mod as { meta: { mood: string; created: string; images?: string[]; tags?: string[] }; html: string };
    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    return {
      meta: {
        mood: m.meta.mood,
        created: m.meta.created,
        images: m.meta.images,
        tags: m.meta.tags,
      },
      html: m.html,
      slug,
    };
  })
  .sort((a, b) =>
    new Date(b.meta.created).getTime() - new Date(a.meta.created).getTime()
  );

import type { Plugin } from 'vite';
import grayMatter from '@11ty/gray-matter';
import { renderMarkdown } from '../utils/marked-config';

export function markdownPlugin(): Plugin {
  return {
    name: 'vitex-markdown',
    enforce: 'pre',

    transform(code: string, id: string) {
      if (!id.endsWith('.md')) return;

      try {
        const { data, content } = grayMatter(code);

        const meta = {
          mood: typeof data.mood === 'string' ? data.mood : '📝',
          created: normalizeDate(data.created),
          images: normalizeStringArray(data.images),
          tags: normalizeStringArray(data.tags),
        };

        const html = renderMarkdown(content.trim());

        return {
          code: [`export const meta = ${JSON.stringify(meta)};`, `export const html = ${JSON.stringify(html)};`].join(
            '\n',
          ),
          map: null,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[vitex-markdown] Skipping ${id}: ${message}`);

        return {
          code: [
            `export const meta = { mood: "⚠️", created: "${new Date(0).toISOString()}" };`,
            `export const html = "<p><em>This tweet could not be parsed.</em></p>";`,
          ].join('\n'),
          map: null,
        };
      }
    },

    handleHotUpdate({ file, server }) {
      if (file.endsWith('.md')) {
        console.log(`[vitex-markdown] Markdown file changed: ${file}`);
        server.ws.send({ type: 'full-reload' });
      }
    },
  };
}

function normalizeDate(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  return new Date(0).toISOString();
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return [value];
  return undefined;
}

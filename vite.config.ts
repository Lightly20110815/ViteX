import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import grayMatter from '@11ty/gray-matter';
import { renderMarkdown } from './src/utils/marked-config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEED_URL = 'https://vite-x.vercel.app';

function markdownPlugin(): Plugin {
  return {
    name: 'vitex-markdown',
    enforce: 'pre',

    transform(code: string, id: string) {
      if (!id.endsWith('.md')) return;

      try {
        const { data, content } = grayMatter(code);

        const meta = {
          mood: typeof data.mood === 'string' ? data.mood : '📝',
          created: (() => {
            const c = data.created;
            if (typeof c === 'string') return c;
            if (c instanceof Date) return c.toISOString();
            if (typeof c === 'number') return new Date(c).toISOString();
            return new Date(0).toISOString();
          })(),
          images: (() => {
            const img = data.images;
            if (Array.isArray(img)) return img.map(String);
            if (typeof img === 'string') return [img];
            return undefined;
          })(),
          tags: (() => {
            const t = data.tags;
            if (Array.isArray(t)) return t.map(String);
            if (typeof t === 'string') return [t];
            return undefined;
          })(),
        };

        const html = renderMarkdown(content.trim());

        return {
          code: [
            `export const meta = ${JSON.stringify(meta)};`,
            `export const html = ${JSON.stringify(html)};`,
          ].join('\n'),
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

function rssPlugin(): Plugin {
  return {
    name: 'vitex-rss',
    closeBundle() {
      const tweetsDir = resolve(__dirname, 'content', 'tweets');
      const items: Array<{ title: string; link: string; date: string; description: string; tags?: string[] }> = [];

      function walk(dir: string) {
        for (const entry of readdirSync(dir)) {
          const fullPath = resolve(dir, entry);
          const s = statSync(fullPath);
          if (s.isDirectory()) {
            walk(fullPath);
          } else if (entry.endsWith('.md')) {
            const raw = readFileSync(fullPath, 'utf-8');
            const { data, content } = grayMatter(raw);
            const slug = entry.replace(/\.md$/, '');
            const date = data.created
              ? (typeof data.created === 'string' ? data.created : new Date(data.created).toISOString())
              : new Date(0).toISOString();
            const text = content.trim().split('\n').find(line => line.trim() && !line.startsWith('#')) || '';
            items.push({
              title: `${data.mood || '📝'} ${text.slice(0, 60)}`,
              link: `${FEED_URL}/#tweet-${slug}`,
              date,
              description: renderMarkdown(content.trim()),
              tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? [data.tags] : undefined),
            });
          }
        }
      }

      try {
        walk(tweetsDir);
      } catch {
        console.warn('[vitex-rss] No tweets directory found, skipping RSS generation.');
        return;
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const now = new Date().toISOString();
      const escape = escapeXml;
      const lines = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">`,
        `  <channel>`,
        `    <title>${escape('Sy — Timeline')}</title>`,
        `    <link>${FEED_URL}</link>`,
        `    <description>${escape('Personal Twitter-style timeline powered by ViteX')}</description>`,
        `    <language>zh-CN</language>`,
        `    <lastBuildDate>${now}</lastBuildDate>`,
        `    <atom:link href="${FEED_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
      ];

      for (const item of items) {
        lines.push(`    <item>`);
        lines.push(`      <title>${escape(item.title)}</title>`);
        lines.push(`      <link>${item.link}</link>`);
        lines.push(`      <guid isPermaLink="false">${item.link}</guid>`);
        lines.push(`      <pubDate>${item.date}</pubDate>`);
        lines.push(`      <content:encoded><![CDATA[${item.description}]]></content:encoded>`);
        for (const t of item.tags || []) {
          lines.push(`      <category>${escape(t)}</category>`);
        }
        lines.push(`    </item>`);
      }

      lines.push(`  </channel>`);
      lines.push(`</rss>`);

      const outFile = resolve(__dirname, 'dist', 'rss.xml');
      try {
        writeFileSync(outFile, lines.join('\n'), 'utf-8');
        console.log(`[vitex-rss] Generated rss.xml with ${items.length} items.`);
      } catch (err) {
        console.warn('[vitex-rss] Failed to write rss.xml:', err);
      }
    },
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/&lt;/g, '&amp;lt;')
    .replace(/&gt;/g, '&amp;gt;')
    .replace(/"/g, '&amp;quot;')
    .replace(/'/g, '&amp;#39;');
}

export default defineConfig({
  plugins: [markdownPlugin(), rssPlugin()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },

  server: {
    port: 3000,
    open: false,
  },
});

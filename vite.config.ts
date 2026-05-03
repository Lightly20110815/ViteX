import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import grayMatter from '@11ty/gray-matter';
import { renderMarkdown } from './src/utils/marked-config';

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

export default defineConfig({
  plugins: [markdownPlugin()],

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

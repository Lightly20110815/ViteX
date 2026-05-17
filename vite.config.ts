import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { markdownPlugin } from './src/build/markdown-plugin';
import { rssPlugin } from './src/build/rss-plugin';
import { deepseekDevPlugin } from './src/build/deepseek-dev-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [markdownPlugin(), rssPlugin(), deepseekDevPlugin()],

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
      input: {
        main: resolve(__dirname, 'index.html'),
        canary: resolve(__dirname, 'canary/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html'),
      },
    },
  },

  server: {
    port: 3000,
    open: false,
  },
});

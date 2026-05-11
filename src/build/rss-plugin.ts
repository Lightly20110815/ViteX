import type { Plugin } from 'vite';
import { resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import grayMatter from '@11ty/gray-matter';
import { renderMarkdown } from '../utils/marked-config';
import { siteConfig } from '../config/site';

export function rssPlugin(): Plugin {
  return {
    name: 'vitex-rss',
    closeBundle() {
      const tweetsDir = resolve(process.cwd(), 'content', 'tweets');
      const items = collectItems(tweetsDir);

      if (items.length === 0) {
        console.warn('[vitex-rss] No tweets found, skipping RSS generation.');
        return;
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const xml = buildRssXml(items);
      const outFile = resolve(process.cwd(), 'dist', 'rss.xml');

      try {
        writeFileSync(outFile, xml, 'utf-8');
        console.log(`[vitex-rss] Generated rss.xml with ${items.length} items.`);
      } catch (err) {
        console.warn('[vitex-rss] Failed to write rss.xml:', err);
      }
    },
  };
}

interface RssItem {
  title: string;
  link: string;
  date: string;
  description: string;
  tags?: string[];
}

function collectItems(dir: string): RssItem[] {
  const items: RssItem[] = [];

  function walk(currentDir: string, relativeDir: string) {
    let entries: string[];
    try {
      entries = readdirSync(currentDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = resolve(currentDir, entry);
      const s = statSync(fullPath);
      if (s.isDirectory()) {
        walk(fullPath, relativeDir ? `${relativeDir}/${entry}` : entry);
      } else if (entry.endsWith('.md')) {
        const raw = readFileSync(fullPath, 'utf-8');
        const { data, content } = grayMatter(raw);
        const filename = entry.replace(/\.md$/, '');
        const slug = relativeDir ? `${relativeDir}/${filename}` : filename;
        const date = data.created
          ? typeof data.created === 'string'
            ? data.created
            : new Date(data.created).toISOString()
          : new Date(0).toISOString();
        const text =
          content
            .trim()
            .split('\n')
            .find((line) => line.trim() && !line.startsWith('#')) || '';

        items.push({
          title: `${data.mood || '📝'} ${text.slice(0, 60)}`,
          link: `${siteConfig.url}/#tweet-${slug}`,
          date,
          description: renderMarkdown(content.trim()),
          tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === 'string' ? [data.tags] : undefined,
        });
      }
    }
  }

  walk(dir, '');
  return items;
}

function buildRssXml(items: RssItem[]): string {
  const now = new Date().toISOString();
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">`,
    `  <channel>`,
    `    <title>${escapeXml(siteConfig.title)}</title>`,
    `    <link>${siteConfig.url}</link>`,
    `    <description>${escapeXml(siteConfig.description)}</description>`,
    `    <language>${siteConfig.language}</language>`,
    `    <lastBuildDate>${now}</lastBuildDate>`,
    `    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />`,
  ];

  for (const item of items) {
    lines.push(`    <item>`);
    lines.push(`      <title>${escapeXml(item.title)}</title>`);
    lines.push(`      <link>${item.link}</link>`);
    lines.push(`      <guid isPermaLink="false">${item.link}</guid>`);
    lines.push(`      <pubDate>${item.date}</pubDate>`);
    lines.push(`      <content:encoded><![CDATA[${item.description}]]></content:encoded>`);
    for (const t of item.tags || []) {
      lines.push(`      <category>${escapeXml(t)}</category>`);
    }
    lines.push(`    </item>`);
  }

  lines.push(`  </channel>`);
  lines.push(`</rss>`);

  return lines.join('\n');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/&lt;/g, '&amp;lt;')
    .replace(/&gt;/g, '&amp;gt;')
    .replace(/"/g, '&amp;quot;')
    .replace(/'/g, '&amp;#39;');
}

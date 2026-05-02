import { marked, type Tokens } from 'marked';
import hljs from 'highlight.js';

marked.use({
  gfm: true,
  breaks: false,
});

const renderer = {
  code(token: Tokens.Code): string {
    const lang = token.lang || '';
    const code = token.text;

    let highlighted: string;
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlighted = hljs.highlight(code, { language: lang }).value;
      } catch {
        highlighted = escapeHtml(code);
      }
    } else {
      highlighted = escapeHtml(code);
    }

    const langAttr = lang ? ` data-lang="${escapeAttr(lang)}"` : '';
    return `<pre${langAttr}><code class="hljs${lang ? ` language-${lang}` : ''}">${highlighted}</code></pre>`;
  },
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  let html = marked.parse(content, { async: false });
  if (typeof html !== 'string') {
    throw new Error('marked.parse returned Promise unexpectedly');
  }
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  html = html.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(text: string): string {
  return text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

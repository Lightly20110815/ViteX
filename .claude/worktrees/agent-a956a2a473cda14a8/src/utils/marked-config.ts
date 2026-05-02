import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked for ViteX (PIPE-03: GFM with safe HTML)
marked.use({
  gfm: true,          // GitHub Flavored Markdown (tables, strikethrough, task lists)
  breaks: false,      // Do NOT convert single newlines to <br> (standard Markdown behavior)
});

// Custom renderer for fenced code blocks with syntax highlighting (D-21)
const renderer = {
  code(token: { lang?: string; text: string }): string {
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

/**
 * Render Markdown content to safe HTML.
 * This runs at build time inside the Vite plugin transform hook.
 * The returned HTML contains no <script>, <iframe>, or event handler attributes.
 */
export function renderMarkdown(content: string): string {
  let html = marked.parse(content, { async: false });
  if (typeof html !== 'string') {
    throw new Error('marked.parse returned Promise unexpectedly');
  }
  // Strip dangerous tags and attributes (defense in depth, CSP is primary defense)
  // T-03-02 mitigation: sanitize HTML output to prevent XSS via self-authored Markdown
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  html = html.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  return html;
}

// Helper: escape HTML special characters (for code content when highlight.js fails)
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper: escape attribute values
function escapeAttr(text: string): string {
  return text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

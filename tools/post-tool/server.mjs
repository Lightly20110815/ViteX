#!/usr/bin/env node
/**
 * ViteX 本地一键发帖工具
 * 零依赖 — 只用 Node 内置模块。
 *
 *   node tools/post-tool/server.mjs
 *
 * 启动后会：
 *   1. 在 http://localhost:5180/ 打开一个表单（自动开浏览器）
 *   2. 提交时把 markdown 写入 content/tweets/YYYY/MM/<slug>.md
 *   3. 可选：勾上 "git commit & push" 自动提交并推送
 *   4. 可选：上传图片 → 复制到 public/uploads/YYYY-MM/，前端用 /uploads/... 引用
 */
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TWEETS_DIR = path.join(PROJECT_ROOT, 'content', 'tweets');
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'public', 'uploads');
const PORT = Number(process.env.POST_TOOL_PORT || 5180);

// ---------- helpers ----------

function slugify(s) {
  const base = (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9一-龥\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (base) return base;
  return 'tweet-' + Date.now().toString(36);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function nowISOWithOffset() {
  // produce 2026-05-16T19:38:12+08:00 style based on local time
  const d = new Date();
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const abs = Math.abs(off);
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds()) +
    sign +
    pad(Math.floor(abs / 60)) +
    ':' +
    pad(abs % 60)
  );
}

function jsonRes(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function runCmd(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, shell: process.platform === 'win32' });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ out, err, code });
      else reject(new Error(`${cmd} ${args.join(' ')} → exit ${code}\n${err || out}`));
    });
  });
}

async function readBody(req, limitBytes = 30 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let received = 0;
    req.on('data', (c) => {
      received += c.length;
      if (received > limitBytes) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function buildMarkdown({ mood, created, images, tags, body }) {
  const lines = ['---'];
  lines.push(`mood: ${mood || '📝'}`);
  lines.push(`created: ${created}`);
  if (Array.isArray(tags) && tags.length > 0) {
    lines.push('tags:');
    for (const t of tags) lines.push(`  - ${t}`);
  }
  if (Array.isArray(images) && images.length > 0) {
    lines.push('images:');
    for (const u of images) lines.push(`  - ${u}`);
  }
  lines.push('---');
  lines.push('');
  lines.push((body || '').trim());
  lines.push('');
  return lines.join('\n');
}

// ---------- routes ----------

async function handleSavePost(req, res) {
  const raw = await readBody(req);
  let payload;
  try {
    payload = JSON.parse(raw.toString('utf-8'));
  } catch {
    return jsonRes(res, 400, { ok: false, error: 'invalid JSON' });
  }

  const { mood, body, tags = [], images = [], slug, gitPush } = payload || {};
  if (!body || !body.toString().trim()) {
    return jsonRes(res, 400, { ok: false, error: 'body required' });
  }

  const created = nowISOWithOffset();
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = pad(d.getMonth() + 1);
  const dirAbs = path.join(TWEETS_DIR, yyyy, mm);
  await fsp.mkdir(dirAbs, { recursive: true });

  const finalSlug = slugify(slug || body.slice(0, 30));
  let filename = `${finalSlug}.md`;
  let attempt = 1;
  while (fs.existsSync(path.join(dirAbs, filename))) {
    filename = `${finalSlug}-${attempt++}.md`;
  }
  const fileAbs = path.join(dirAbs, filename);
  const md = buildMarkdown({
    mood,
    created,
    tags: tags.filter(Boolean),
    images: images.filter(Boolean),
    body,
  });
  await fsp.writeFile(fileAbs, md, 'utf-8');

  const relPath = path.relative(PROJECT_ROOT, fileAbs).replace(/\\/g, '/');

  let gitInfo = null;
  if (gitPush) {
    try {
      const addArgs = ['add', relPath];
      if (fs.existsSync(UPLOADS_DIR)) addArgs.push('public/uploads');
      await runCmd('git', addArgs, PROJECT_ROOT);
      const subject = `post: ${(body || '').replace(/\s+/g, ' ').trim().slice(0, 60)}`;
      await runCmd('git', ['commit', '-m', subject], PROJECT_ROOT);
      const pushOut = await runCmd('git', ['push'], PROJECT_ROOT);
      gitInfo = { committed: true, pushed: true, log: (pushOut.out + pushOut.err).trim() };
    } catch (e) {
      gitInfo = { committed: false, pushed: false, error: String(e.message || e) };
    }
  }

  return jsonRes(res, 200, { ok: true, file: relPath, slug: finalSlug, git: gitInfo });
}

// minimal multipart/form-data parser (enough for our uploads).
function parseMultipart(buffer, boundary) {
  const result = { fields: {}, files: [] };
  const delim = Buffer.from('--' + boundary);
  let start = buffer.indexOf(delim);
  if (start < 0) return result;
  start += delim.length;
  while (start < buffer.length) {
    if (buffer[start] === 0x2d && buffer[start + 1] === 0x2d) break; // closing --
    // skip CRLF
    if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) start += 2;

    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), start);
    if (headerEnd < 0) break;
    const header = buffer.slice(start, headerEnd).toString('utf-8');
    const bodyStart = headerEnd + 4;
    const nextDelim = buffer.indexOf(delim, bodyStart);
    if (nextDelim < 0) break;
    let bodyEnd = nextDelim;
    if (buffer[bodyEnd - 2] === 0x0d && buffer[bodyEnd - 1] === 0x0a) bodyEnd -= 2;
    const body = buffer.slice(bodyStart, bodyEnd);

    const nameMatch = header.match(/name="([^"]+)"/);
    const fileMatch = header.match(/filename="([^"]*)"/);
    const ctMatch = header.match(/Content-Type:\s*([^\r\n]+)/i);
    const name = nameMatch ? nameMatch[1] : '';
    if (fileMatch && fileMatch[1]) {
      result.files.push({
        field: name,
        filename: fileMatch[1],
        contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream',
        data: body,
      });
    } else {
      result.fields[name] = body.toString('utf-8');
    }
    start = nextDelim + delim.length;
  }
  return result;
}

async function handleUpload(req, res) {
  const ct = req.headers['content-type'] || '';
  const m = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/);
  if (!m) return jsonRes(res, 400, { ok: false, error: 'missing multipart boundary' });
  const boundary = m[1] || m[2];

  const raw = await readBody(req);
  const parsed = parseMultipart(raw, boundary);

  const d = new Date();
  const folder = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const targetDir = path.join(UPLOADS_DIR, folder);
  await fsp.mkdir(targetDir, { recursive: true });

  const saved = [];
  for (const f of parsed.files) {
    const ext = (path.extname(f.filename) || guessExt(f.contentType) || '.bin').toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const abs = path.join(targetDir, safeName);
    await fsp.writeFile(abs, f.data);
    saved.push({
      url: `/uploads/${folder}/${safeName}`,
      filename: f.filename,
      size: f.data.length,
    });
  }
  return jsonRes(res, 200, { ok: true, files: saved });
}

function guessExt(ct) {
  const map = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
  };
  return map[ct] || null;
}

async function handleListPosts(_req, res) {
  const all = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) await walk(abs);
      else if (e.isFile() && e.name.endsWith('.md')) {
        const stat = await fsp.stat(abs);
        all.push({
          path: path.relative(PROJECT_ROOT, abs).replace(/\\/g, '/'),
          mtime: stat.mtime.toISOString(),
          size: stat.size,
        });
      }
    }
  }
  await walk(TWEETS_DIR);
  all.sort((a, b) => b.mtime.localeCompare(a.mtime));
  jsonRes(res, 200, { ok: true, posts: all.slice(0, 25) });
}

// ---------- static (the form) ----------

const FORM_HTML = fs.readFileSync(path.join(__dirname, 'form.html'), 'utf-8');

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && (u.pathname === '/' || u.pathname === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(FORM_HTML);
      return;
    }
    if (req.method === 'POST' && u.pathname === '/api/post') return handleSavePost(req, res);
    if (req.method === 'POST' && u.pathname === '/api/upload') return handleUpload(req, res);
    if (req.method === 'GET' && u.pathname === '/api/posts') return handleListPosts(req, res);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  } catch (e) {
    console.error(e);
    jsonRes(res, 500, { ok: false, error: String(e.message || e) });
  }
});

server.listen(PORT, () => {
  const target = `http://localhost:${PORT}/`;
  console.log(`\n  ViteX post tool ready → ${target}`);
  console.log(`  project root: ${PROJECT_ROOT}\n`);
  // try to open the browser
  const opener =
    process.platform === 'win32' ? ['cmd', ['/c', 'start', '', target]] :
    process.platform === 'darwin' ? ['open', [target]] :
    ['xdg-open', [target]];
  try {
    spawn(opener[0], opener[1], { stdio: 'ignore', detached: true }).unref();
  } catch {
    /* fall through — user can open manually */
  }
});

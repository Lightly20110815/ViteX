import './canary.css';

import { tweets } from './data/tweets';
import { profile } from './data/profile';
import { formatRelativeTime } from './utils/time';
import { openLightbox } from './components/Lightbox';
import { openShareCard } from './components/ShareCard';
import type { TweetData } from './types/TweetData';
import { fetchLiveWeather, type WeatherLive } from './utils/weather';
import { getMetingList, type MetingSong } from './utils/meting';
import { streamDeepSeek } from './utils/deepseek';

/* ============================================================
   sy.os — canary entry
   ============================================================ */

type FragmentType = 'memory' | 'log' | 'commit' | 'thought' | 'error';

const VISIT_KEY = 'sy.os:visits';
const STORAGE_OPEN_AT = 'sy.os:open-at';

const els = {
  boot: byId('os-boot'),
  bootLog: byId<HTMLPreElement>('os-boot-log'),
  bootCursor: byId('os-boot-cursor'),
  shell: byId('os-shell'),
  greeting: byId('os-greeting'),
  fragCount: byId('os-frag-count'),
  stream: byId('os-stream'),
  streamFilter: byId('os-stream-filter'),
  streamFootText: byId('os-stream-foot-text'),
  // titlebar
  tlClock: byId('os-tl-clock'),
  tlMode: byId('os-tl-mode'),
  tlGreeting: byId('os-tl-greeting'),
  tlPath: byId('os-tl-path-state'),
  // mental
  mentalState: byId('os-mental-state'),
  mentalFill: byId('os-mental-fill'),
  alive: byId('os-alive'),
  sleep: byId('os-sleep'),
  caffeine: byId('os-caffeine'),
  buffer: byId('os-buffer'),
  uptime: byId('os-mental-uptime'),
  idMeta: byId('os-id-meta'),
  // env
  weather: byId('os-weather'),
  outside: byId('os-outside'),
  local: byId('os-local'),
  envCoord: byId('os-env-coord'),
  windowState: byId('os-window-state'),
  temp: byId('os-temp'),
  humidity: byId('os-humidity'),
  wind: byId('os-wind'),
  // music
  now: byId<HTMLButtonElement>('os-now'),
  nowSource: byId('os-now-source'),
  nowTrack: byId('os-now-track'),
  nowArtist: byId('os-now-artist'),
  nowFill: byId('os-now-fill'),
  nowHost: byId('os-now-host'),
  nowPrev: byId<HTMLButtonElement>('os-now-prev'),
  nowNext: byId<HTMLButtonElement>('os-now-next'),
  nowToggle: byId<HTMLButtonElement>('os-now-toggle'),
  nowTime: byId('os-now-time'),
  // terminal
  term: byId<HTMLPreElement>('os-term'),
  // project
  projName: byId('os-proj-name'),
  projBranch: byId('os-proj-branch'),
  projCommit: byId('os-proj-commit'),
  projFiles: byId('os-proj-files'),
  projDiff: byId('os-proj-diff'),
  // device
  cpu: byId('os-cpu'),
  cpuBar: byId('os-cpu-bar'),
  ram: byId('os-ram'),
  ramBar: byId('os-ram-bar'),
  tabs: byId('os-tabs'),
  battery: byId('os-battery'),
  devHost: byId('os-dev-host'),
  // network
  netStatus: byId('os-net-status'),
  ipv6: byId('os-ipv6'),
  warp: byId('os-warp'),
  latency: byId('os-latency'),
  loss: byId('os-loss'),
  // misc
  whisper: byId('os-whisper'),
  footerMid: byId('os-footer-mid'),
};

let activeTag: string | null = null;
let renderedFrags = 0;
const sessionStart = Date.now();

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el as T;
}

/* ============================================================
   boot sequence
   ============================================================ */

const bootLines: { text: string; cls?: string; delay: number }[] = [
  { text: 'booting sy.os...', cls: 'b-dim', delay: 60 },
  { text: 'mounting /dev/heart ............ <span class="b-ok">ok</span>', cls: 'b-dim', delay: 220 },
  { text: 'checking memory ................ <span class="b-warn">partial</span>', cls: 'b-dim', delay: 260 },
  { text: 'recovering fragments ........... <span class="b-ok">ok</span>', cls: 'b-dim', delay: 240 },
  { text: 'loading personality.json ....... <span class="b-ok">ok</span>', cls: 'b-dim', delay: 220 },
  { text: 'human.exe ...................... <span class="b-warn">stopped responding</span>', cls: 'b-dim', delay: 320 },
  { text: 'fallback: dream-thread .......... <span class="b-ok">ok</span>', cls: 'b-dim', delay: 200 },
  { text: '', cls: '', delay: 80 },
  { text: '<span class="b-name">Sy Yann</span>', delay: 240 },
  { text: 'online', cls: 'b-ok', delay: 220 },
  { text: 'with you, through all.', cls: 'b-dim', delay: 480 },
];

function runBoot(): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (i >= bootLines.length) {
        setTimeout(() => {
          els.boot.setAttribute('hidden', 'true');
          els.shell.setAttribute('aria-hidden', 'false');
          resolve();
        }, 320);
        return;
      }
      const line = bootLines[i++];
      const span = document.createElement('span');
      if (line.cls) span.className = line.cls;
      span.innerHTML = line.text + '\n';
      els.bootLog.appendChild(span);
      setTimeout(tick, line.delay);
    };
    tick();
  });
}

/* ============================================================
   visit memory — hello stranger / you're back / welcome home
   ============================================================ */

function trackVisit(): number {
  try {
    const prev = Number(localStorage.getItem(VISIT_KEY) || '0') || 0;
    const next = prev + 1;
    localStorage.setItem(VISIT_KEY, String(next));
    localStorage.setItem(STORAGE_OPEN_AT, String(Date.now()));
    return next;
  } catch {
    return 1;
  }
}

function greetingFor(visits: number, hour: number): string {
  if (hour >= 2 && hour < 5) return 'still up?';
  if (visits <= 1) return 'hello stranger';
  if (visits <= 2) return 'oh, hi again.';
  if (visits < 10) return "you're back";
  return 'welcome home';
}

async function streamGreeting(visits: number, hour: number): Promise<void> {
  const isNight = hour >= 2 && hour < 5;
  const visitorBucket =
    visits <= 1 ? 'first-time stranger' : visits <= 3 ? 'returning visitor' : visits < 10 ? 'frequent visitor' : 'regular';

  const sys = `你是一个名为 sy.os 的"人格操作系统"的内核。
你正在向访客显示一句问候，作为屏幕上的大标题。

风格要求：
- 极简、克制、像终端命令的回应。最多 12 个字符。
- 全部小写英文，可以混入少量符号 (./_>)
- 像系统消息，又像悄悄话；不要正式问候。
- 不要标点符号结尾，不要引号，不要 emoji。
- 只输出问候本身，不要任何其他文字、解释或思考。

参考风格（仅供参考）：
- hello stranger
- you're back
- welcome home
- still up?
- so it's you again
- session resumed
- ok. you're here.
- traceback: you
- ./hi`;

  const userMsg = `当前访客类型：${visitorBucket} (这是第 ${visits} 次访问)。
当前时间：${isNight ? '凌晨 2-5 点之间，深夜模式' : `${hour} 点`}。
请生成一句新的问候，符合风格要求。`;

  let buf = '';
  els.greeting.textContent = '';

  try {
    await streamDeepSeek({
      model: 'deepseek-chat',
      temperature: 1.1,
      max_tokens: 32,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: userMsg },
      ],
      onDelta: (_d, full) => {
        buf = full;
        els.greeting.textContent = full.replace(/^["'`]+|["'`]+$/g, '').trim();
      },
    });
    const cleaned = buf.replace(/^["'`]+|["'`]+$/g, '').trim();
    if (cleaned) els.greeting.textContent = cleaned;
    else els.greeting.textContent = greetingFor(visits, hour);
  } catch (err) {
    console.warn('deepseek greeting failed:', err);
    els.greeting.textContent = greetingFor(visits, hour);
  }
}

/* ============================================================
   fragment classifier
   ============================================================ */

function classify(t: TweetData): FragmentType {
  const tags = (t.meta.tags || []).map((s) => s.toLowerCase());
  if (tags.some((tag) => /^(error|err|panic|crash|bug)$/.test(tag))) return 'error';
  if (tags.some((tag) => /^(commit|git|code|coding|dev|ship)$/.test(tag))) return 'commit';
  if (tags.some((tag) => /^(log|terminal|shell|cli)$/.test(tag))) return 'log';
  if (tags.some((tag) => /^(memory|past|dream|cache)$/.test(tag))) return 'memory';
  // mood-based fallback
  const m = t.meta.mood || '';
  if (/[\u{1F622}\u{1F62D}\u{1F61E}\u{1F614}\u{1F494}]/u.test(m)) return 'memory';
  if (/[\u{1F4BB}\u{2699}\u{1F527}\u{1F6E0}]/u.test(m)) return 'commit';
  if (/[\u{26A0}\u{1F534}\u{203C}]/u.test(m)) return 'error';
  return 'thought';
}

const TYPE_LABEL: Record<FragmentType, string> = {
  memory: 'mem.fragment',
  log: 'console.log',
  commit: 'git.commit',
  thought: 'stdout',
  error: 'panic',
};

const TYPE_CLASS: Record<FragmentType, string> = {
  memory: 't-mem',
  log: 't-info',
  commit: 't-info',
  thought: '',
  error: 't-error',
};

/* ============================================================
   stream rendering
   ============================================================ */

function renderFilterChips(): void {
  const counts: Record<string, number> = {};
  for (const t of tweets) for (const tag of t.meta.tags || []) counts[tag] = (counts[tag] || 0) + 1;
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  els.streamFilter.innerHTML = '';
  const all = chip('all', `${tweets.length}`);
  all.classList.add('is-active');
  all.addEventListener('click', () => setTag(null));
  els.streamFilter.appendChild(all);
  for (const [tag, n] of entries) {
    const c = chip(`#${tag}`, String(n));
    c.dataset.tag = tag;
    c.addEventListener('click', () => setTag(tag));
    els.streamFilter.appendChild(c);
  }
}

function chip(label: string, count: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = 'os-chip';
  b.type = 'button';
  b.innerHTML = `${label}<span style="opacity:.5;margin-left:6px">${count}</span>`;
  return b;
}

function setTag(tag: string | null): void {
  activeTag = tag;
  els.streamFilter.querySelectorAll('.os-chip').forEach((c) => {
    const t = (c as HTMLElement).dataset.tag || null;
    c.classList.toggle('is-active', t === tag);
  });
  renderStream();
  if (els.tlPath) els.tlPath.textContent = tag ? tag : 'main';
}

function renderStream(): void {
  els.stream.innerHTML = '';
  const list = activeTag ? tweets.filter((t) => t.meta.tags?.includes(activeTag!)) : tweets;
  renderedFrags = list.length;
  els.fragCount.textContent = String(renderedFrags);

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'os-empty';
    empty.innerHTML = `
      <div class="os-empty-h">// 404 — fragment not found</div>
      <div>没有 #${activeTag ?? '...'} 的记忆碎片。<br/>cached memories may be incomplete</div>
    `;
    els.stream.appendChild(empty);
    return;
  }

  list.forEach((t, i) => {
    const f = createFragment(t);
    f.style.animationDelay = `${Math.min(i, 10) * 30}ms`;
    els.stream.appendChild(f);
  });
}

function createFragment(t: TweetData): HTMLElement {
  const type = classify(t);
  const wrapper = document.createElement('article');
  wrapper.className = 'os-frag';
  wrapper.dataset.type = type;
  wrapper.dataset.slug = t.slug;

  const gutter = document.createElement('div');
  gutter.className = 'os-frag-gutter';
  const mood = document.createElement('div');
  mood.className = 'os-frag-mood';
  mood.textContent = t.meta.mood || '·';
  const idx = document.createElement('div');
  idx.textContent = '0x' + (t.slug.length * 13).toString(16).padStart(3, '0').slice(-3).toUpperCase();
  gutter.appendChild(mood);
  gutter.appendChild(idx);

  const head = document.createElement('div');
  head.className = 'os-frag-head';
  head.innerHTML = `
    <span class="os-frag-type ${TYPE_CLASS[type]}">${TYPE_LABEL[type]}</span>
    <span class="os-frag-slug">@${t.slug}</span>
    <time class="os-frag-time" datetime="${t.meta.created}">${formatRelativeTime(t.meta.created)}</time>
  `;
  const share = document.createElement('button');
  share.className = 'os-frag-share';
  share.type = 'button';
  share.textContent = '↗ export';
  share.setAttribute('aria-label', '生成分享卡片');
  share.addEventListener('click', (e) => {
    e.stopPropagation();
    openShareCard(t);
  });
  head.appendChild(share);

  const body = document.createElement('div');
  body.className = 'os-frag-body';
  body.innerHTML = t.html;

  wrapper.appendChild(gutter);
  wrapper.appendChild(head);
  wrapper.appendChild(body);

  if (t.meta.images && t.meta.images.length > 0) {
    const grid = document.createElement('div');
    grid.className = `os-frag-imgs n-${Math.min(t.meta.images.length, 4)}`;
    for (const url of t.meta.images) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('click', () => openLightbox(url));
      grid.appendChild(img);
    }
    wrapper.appendChild(grid);
  }

  if (t.meta.tags && t.meta.tags.length > 0) {
    const tags = document.createElement('div');
    tags.className = 'os-frag-tags';
    for (const tag of t.meta.tags) {
      const el = document.createElement('span');
      el.className = 'os-frag-tag';
      el.textContent = tag;
      el.addEventListener('click', () => setTag(tag));
      tags.appendChild(el);
    }
    wrapper.appendChild(tags);
  }

  return wrapper;
}

/* ============================================================
   left panel — persona telemetry
   ============================================================ */

const MENTAL_STATES = [
  { label: 'low voltage', cls: '', range: [10, 35] },
  { label: 'running on caffeine', cls: '', range: [60, 80] },
  { label: 'emotion buffer overflow', cls: 'is-warn', range: [85, 99] },
  { label: 'human.exe stopped responding', cls: 'is-err', range: [5, 20] },
  { label: 'idle / observing clouds', cls: '', range: [40, 60] },
  { label: 'compiling feelings…', cls: '', range: [55, 75] },
  { label: 'segfault — ignored', cls: 'is-err', range: [15, 30] },
  { label: 'backup running', cls: '', range: [50, 70] },
];

const CAFFEINE_LEVELS = ['none', 'tea', 'one cup', 'two cups', 'unsafe'];
const BUFFER_STATES = ['stable', 'warm', 'overflow', 'fragmented', 'ok'];
const WINDOW_STATES = ['open', 'half open', 'closed', 'cracked'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRand(seed: number): number {
  // simple LCG-ish for daily-stable values
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function renderPersona(): void {
  const seed = dailySeed();
  const aliveProb = Math.round(40 + seededRand(seed) * 55); // 40–95
  const sleepHours = +(seededRand(seed + 1) * 8).toFixed(1);

  const ms = MENTAL_STATES[Math.floor(seededRand(seed + 2) * MENTAL_STATES.length)];
  const fillPct = ms.range[0] + Math.random() * (ms.range[1] - ms.range[0]);

  els.mentalState.textContent = ms.label;
  els.mentalState.className = `os-mental-line ${ms.cls}`;
  (els.mentalFill as HTMLElement).style.width = `${fillPct}%`;
  els.alive.textContent = `${aliveProb}%`;
  els.sleep.textContent = `${sleepHours}h ago`;
  els.caffeine.textContent = pick(CAFFEINE_LEVELS);
  els.buffer.textContent = pick(BUFFER_STATES);

  // identity meta — keep profile bio readable
  els.idMeta.textContent = profile.bio;
}

function renderEnvironmentStatic(): void {
  els.windowState.textContent = pick(WINDOW_STATES);
}

async function loadWeather(): Promise<void> {
  try {
    const live: WeatherLive | null = await fetchLiveWeather();
    if (!live) {
      els.weather.textContent = 'unavailable';
      return;
    }
    els.weather.textContent = live.weather || '--';
    els.outside.textContent = `${live.province ? live.province + ' · ' : ''}${live.city || '--'}`;
    els.temp.textContent = `${live.temperature || '--'} °C`;
    els.humidity.textContent = `${live.humidity || '--'}%`;
    els.wind.textContent = `${live.winddirection || '--'} ${live.windpower || ''}`.trim();
    els.envCoord.textContent = `adcode ${live.adcode || '--'}`;
  } catch (err) {
    console.warn('weather fetch failed:', err);
    els.weather.textContent = 'offline';
    els.envCoord.textContent = 'amap unreachable';
  }
}

function startClocks(): void {
  function tick(): void {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    els.tlClock.textContent = `${hh}:${mm}:${ss}`;
    els.local.textContent = `${hh}:${mm}`;

    // uptime (since session start)
    const up = Math.floor((Date.now() - sessionStart) / 1000);
    const upMin = Math.floor(up / 60);
    const upSec = up % 60;
    els.uptime.textContent = `uptime ${upMin}m ${upSec}s`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   music — real Meting playlist + APlayer (lazy-mounted)
   ============================================================ */

interface APlayerAudio {
  name?: string;
  artist?: string;
  url?: string;
  cover?: string;
  lrc?: string;
}

interface APlayerInstance {
  audio?: HTMLAudioElement & { duration?: number; currentTime?: number };
  list?: { audios?: APlayerAudio[]; index?: number };
  on(event: string, handler: () => void): void;
  toggle(): void;
  play(): void;
  pause(): void;
  skipBack(): void;
  skipForward(): void;
  destroy(): void;
}

type APlayerCtor = new (opts: {
  container: HTMLElement;
  volume: number;
  lrcType: number;
  listFolded: boolean;
  order: string;
  audio: APlayerAudio[];
}) => APlayerInstance;

let apl: APlayerInstance | null = null;
let aplLoading = false;
let displayPlaylist: MetingSong[] = [];
let displayIndex = 0;
let displayPos = 0;

function setNowMeta(track: string, artist: string): void {
  els.nowTrack.textContent = track || '—';
  els.nowArtist.textContent = artist || '—';
}

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${ss}`;
}

function setControlsEnabled(enabled: boolean): void {
  els.nowPrev.disabled = !enabled;
  els.nowNext.disabled = !enabled;
  els.nowToggle.disabled = !enabled;
}

function startMusic(): void {
  setControlsEnabled(false);
  setNowMeta('booting playlist…', 'meting · netease');

  void getMetingList()
    .then((list) => {
      displayPlaylist = list.filter((s) => s && (s.name || s.url));
      if (displayPlaylist.length === 0) {
        setNowMeta('signal lost', 'empty playlist');
        return;
      }
      els.nowSource.textContent = `meting · ${displayPlaylist.length} tracks`;
      tickDisplayTrack(true);
      setControlsEnabled(true);
    })
    .catch((err) => {
      console.warn('meting fetch failed:', err);
      setNowMeta('signal lost', 'meting unreachable');
    });

  // visual progress + auto-advance when not actually playing via APlayer
  setInterval(() => {
    if (apl) return;
    if (displayPlaylist.length === 0) return;
    displayPos += 0.012;
    if (displayPos >= 1) {
      displayPos = 0;
      displayIndex = (displayIndex + 1) % displayPlaylist.length;
      tickDisplayTrack(false);
    } else {
      (els.nowFill as HTMLElement).style.width = `${displayPos * 100}%`;
    }
  }, 700);

  // hook real player progress when active
  setInterval(() => {
    const a = apl?.audio;
    if (!a || !a.duration || !isFinite(a.duration)) return;
    const cur = apl?.list?.audios?.[apl.list.index ?? 0];
    if (cur) setNowMeta(cur.name ?? '—', cur.artist ?? '—');
    const p = (a.currentTime || 0) / a.duration;
    (els.nowFill as HTMLElement).style.width = `${Math.max(0, Math.min(1, p)) * 100}%`;
    els.nowTime.textContent = `${fmtTime(a.currentTime || 0)} / ${fmtTime(a.duration)}`;
  }, 500);

  // click track row → play/pause
  els.now.addEventListener('click', () => void togglePlayer());

  // explicit controls
  els.nowToggle.addEventListener('click', () => void togglePlayer());
  els.nowPrev.addEventListener('click', () => void skipTrack(-1));
  els.nowNext.addEventListener('click', () => void skipTrack(+1));
}

function tickDisplayTrack(initial: boolean): void {
  const t = displayPlaylist[displayIndex];
  if (!t) return;
  setNowMeta(t.name || '—', t.artist || '—');
  if (initial) {
    (els.nowFill as HTMLElement).style.width = '0%';
    els.nowTime.textContent = '0:00 / —';
  }
}

async function ensurePlayer(): Promise<APlayerInstance | null> {
  if (apl) return apl;
  if (aplLoading) return null;
  if (displayPlaylist.length === 0) return null;
  aplLoading = true;
  try {
    await import('aplayer/dist/APlayer.min.css');
    const mod = (await import('aplayer')) as { default: APlayerCtor };
    els.nowHost.removeAttribute('hidden');
    apl = new mod.default({
      container: els.nowHost,
      volume: 0.7,
      lrcType: 0,
      listFolded: true,
      order: 'list',
      audio: displayPlaylist.slice(0, 50).map((s) => ({
        name: s.name,
        artist: s.artist,
        url: s.url,
        cover: s.cover,
      })),
    });
    apl.on('play', () => {
      els.now.classList.add('is-playing');
      els.nowToggle.textContent = '❚❚';
    });
    apl.on('pause', () => {
      els.now.classList.remove('is-playing');
      els.nowToggle.textContent = '▶';
    });
    apl.on('canplay', () => {
      const cur = apl?.list?.audios?.[apl.list.index ?? 0];
      if (cur) setNowMeta(cur.name ?? '—', cur.artist ?? '—');
    });
    apl.on('listswitch', () => {
      const cur = apl?.list?.audios?.[apl.list.index ?? 0];
      if (cur) setNowMeta(cur.name ?? '—', cur.artist ?? '—');
    });
    return apl;
  } catch (err) {
    console.warn('aplayer mount failed:', err);
    setNowMeta('playback unavailable', 'aplayer error');
    return null;
  } finally {
    aplLoading = false;
  }
}

async function togglePlayer(): Promise<void> {
  const p = await ensurePlayer();
  if (!p) return;
  p.toggle();
}

async function skipTrack(dir: 1 | -1): Promise<void> {
  if (displayPlaylist.length === 0) return;
  const p = await ensurePlayer();
  if (!p) {
    // fallback: rotate display only
    displayIndex = (displayIndex + dir + displayPlaylist.length) % displayPlaylist.length;
    displayPos = 0;
    tickDisplayTrack(true);
    return;
  }
  if (dir > 0) p.skipForward();
  else p.skipBack();
  // ensure something is audible after switching
  p.play();
}

/* ============================================================
   right panel — live terminal (DeepSeek-generated)
   ============================================================ */

interface TermLine {
  text: string;
  cls: string;
}

const FALLBACK_TERM_LINES: TermLine[] = [
  { text: 'pnpm dev', cls: 't-cmd' },
  { text: '  ➜ ready in 412ms', cls: 't-ok' },
  { text: 'git commit -m "try to fix myself"', cls: 't-cmd' },
  { text: '  rejected (non-fast-forward)', cls: 't-err' },
  { text: 'tail -f /var/log/feelings.log', cls: 't-cmd' },
  { text: '  panic: future not found', cls: 't-err' },
  { text: 'echo $MOOD', cls: 't-cmd' },
  { text: '  low voltage', cls: 't-dim' },
];

const termBuf: string[] = [];
let termGenerating = false;

function classifyLine(text: string): string {
  const t = text.trim();
  if (!t) return 't-dim';
  // command lines start with $ / git / pnpm / npm / sudo / ./ / cd / curl / vim / etc.
  if (/^(\$|git\b|pnpm\b|npm\b|sudo\b|cd\b|curl\b|vim\b|nvim\b|cat\b|echo\b|ls\b|rm\b|tail\b|ps\b|kill\b|systemctl\b|docker\b|node\b|python\b|\.\/)/i.test(t)) return 't-cmd';
  if (/(^|\s)(error|panic|fatal|rejected|denied|fail)/i.test(t)) return 't-err';
  if (/(^|\s)(warn|warning|deprecated|stale)/i.test(t)) return 't-warn';
  if (/(^|\s)(ok|done|ready|success|✓|✔)/i.test(t)) return 't-ok';
  return 't-dim';
}

function pushTermLine(line: TermLine): void {
  const isCmd = line.cls === 't-cmd';
  const prompt = isCmd ? '<span class="t-prompt">$</span> ' : '  ';
  const html = `${prompt}<span class="${line.cls}">${escapeHtml(line.text)}</span>`;
  termBuf.push(html);
  if (termBuf.length > 9) termBuf.shift();
  els.term.innerHTML = termBuf.join('\n');
}

async function generateTermBatch(): Promise<TermLine[]> {
  const sys = `你是一个名为 sy.os 的"人格操作系统"的终端日志生成器。
风格要求：
- 输出一个真实终端会话的片段，混合了真命令和"情绪 leaks"。
- 命令行混入 git、pnpm、curl、vim、tail、systemctl、cat、echo、./ 等。
- 输出可以是命令、命令的输出、错误、警告、stdout 涂鸦。
- 偶尔像 "panic: future not found" 这种把人类情绪伪装成系统错误。
- 全部小写英文，无 emoji。命令行与输出混杂，符合 shell 真实样子。
- 严格 4–6 行，每行一条。命令行不要前缀 $（我会自动加）。
- 命令的输出行用 2 个空格起始（保留前导空格），没有 $。
- 输出格式：纯文本每行一条，无编号、无说明、无 markdown。
- 不要重复，每次都生成新内容。

示例：
git push origin main
  rejected: non-fast-forward
tail -f /var/log/feelings.log
  warning: cache stale 4h21m
echo $MOOD
  low voltage`;

  const userMsg = `请生成新的 4–6 行 sy.os 终端日志。当前时间 ${new Date().toLocaleTimeString()}。`;

  const out = await streamDeepSeek({
    model: 'deepseek-chat',
    temperature: 1.15,
    max_tokens: 220,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: userMsg },
    ],
  });

  return out
    .split('\n')
    .map((l) => l.replace(/^[\s]*[-*]\s*/, '').trimEnd())
    .filter((l) => l.length > 0)
    .map((l) => {
      // preserve indentation: lines starting with 2+ spaces are output, others are commands
      const isOutput = /^\s{2,}/.test(l);
      const trimmed = l.replace(/^\s+/, '');
      return {
        text: isOutput ? '  ' + trimmed : trimmed,
        cls: isOutput ? classifyLine(trimmed) : 't-cmd',
      };
    });
}

async function runTermBatch(): Promise<void> {
  if (termGenerating) return;
  termGenerating = true;
  try {
    const batch = await generateTermBatch();
    if (batch.length === 0) throw new Error('empty batch');
    for (const line of batch) {
      pushTermLine(line);
      await sleep(450 + Math.random() * 350);
    }
  } catch (err) {
    console.warn('deepseek term failed, using fallback:', err);
    // emit a small fallback batch
    const start = Math.floor(Math.random() * FALLBACK_TERM_LINES.length);
    for (let i = 0; i < 4; i++) {
      pushTermLine(FALLBACK_TERM_LINES[(start + i) % FALLBACK_TERM_LINES.length]);
      await sleep(500);
    }
  } finally {
    termGenerating = false;
  }
}

function startTerminal(): void {
  // immediate fallback content so the panel isn't empty during the first call
  for (let i = 0; i < 3; i++) pushTermLine(FALLBACK_TERM_LINES[i]);
  void runTermBatch();
  // refill ~every 25–35s so the panel stays alive without burning quota
  setInterval(() => void runTermBatch(), 28_000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function renderProject(): void {
  els.projName.textContent = 'vitex';
  els.projBranch.textContent = 'master';
  els.projCommit.textContent = `${Math.floor(Math.random() * 12) + 2} min ago`;
  els.projFiles.textContent = String(28 + Math.floor(Math.random() * 8));
  els.projDiff.textContent = `+${Math.floor(Math.random() * 200) + 10} / -${Math.floor(Math.random() * 60)}`;
}

function startDeviceLoop(): void {
  function spark(el: HTMLElement, pct: number): void {
    el.style.setProperty('--os-spark-w', `${Math.max(2, Math.min(100, pct))}%`);
  }
  function loop(): void {
    const cpu = 40 + Math.floor(Math.random() * 55);
    const ramUsed = 4 + Math.random() * 4;
    const ramTotal = 8;
    els.cpu.textContent = `${cpu}%`;
    spark(els.cpuBar, cpu);
    els.ram.textContent = `${ramUsed.toFixed(1)} / ${ramTotal} GB`;
    spark(els.ramBar, (ramUsed / ramTotal) * 100);
    els.tabs.textContent = String(35 + Math.floor(Math.random() * 30));
    els.battery.textContent = `${50 + Math.floor(Math.random() * 45)}%`;
    els.devHost.textContent = 'sy@kernel';
  }
  loop();
  setInterval(loop, 2400);
}

function startNetworkLoop(): void {
  function loop(): void {
    const ms = 80 + Math.floor(Math.random() * 280);
    const loss = (Math.random() * 0.6).toFixed(2);
    els.latency.textContent = `${ms} ms`;
    els.loss.textContent = `${loss}%`;
    els.netStatus.textContent = ms > 250 ? 'unstable' : 'connected';
    els.ipv6.textContent = Math.random() > 0.1 ? 'connected' : 'reconnecting';
    els.warp.textContent = Math.random() > 0.5 ? 'off' : 'on';
  }
  loop();
  setInterval(loop, 3000);
}

/* ============================================================
   after-2am mode + page fatigue
   ============================================================ */

function applyMode(): void {
  const hour = new Date().getHours();
  const isNight = hour >= 2 && hour < 5;
  document.body.dataset.mode = isNight ? 'night' : 'day';
  els.tlMode.textContent = isNight ? 'after 2am' : 'day';
  els.whisper.classList.toggle('is-on', isNight);
}

function startFatigueLoop(): void {
  function tick(): void {
    const minutes = (Date.now() - sessionStart) / 60000;
    let level = 0;
    if (minutes > 5) level = 1;
    if (minutes > 12) level = 2;
    document.body.dataset.fatigue = String(level);
  }
  tick();
  setInterval(tick, 30_000);
}

/* ============================================================
   small helpers
   ============================================================ */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return c;
    }
  });
}

/* ============================================================
   main
   ============================================================ */

async function main(): Promise<void> {
  const visits = trackVisit();
  await runBoot();

  const hour = new Date().getHours();
  els.greeting.textContent = greetingFor(visits, hour); // instant fallback before the stream starts
  void streamGreeting(visits, hour);
  els.tlGreeting.textContent =
    visits <= 1
      ? 'sy.os // first contact'
      : visits < 10
        ? `sy.os // session ${visits}`
        : 'sy.os // welcome home';
  els.footerMid.textContent =
    visits <= 1 ? 'No errors. Only unresolved feelings.' : 'cached memories may be incomplete';
  els.streamFootText.textContent = visits >= 5 ? 'cached memories may be incomplete' : 'No errors. Only unresolved feelings.';

  renderPersona();
  renderEnvironmentStatic();
  void loadWeather();
  renderProject();
  renderFilterChips();
  renderStream();
  startClocks();
  startMusic();
  startTerminal();
  startDeviceLoop();
  startNetworkLoop();
  applyMode();
  startFatigueLoop();
  setInterval(applyMode, 60_000);
  setInterval(renderEnvironmentStatic, 45_000);
  setInterval(loadWeather, 10 * 60_000);
  setInterval(renderPersona, 90_000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void main());
} else {
  void main();
}

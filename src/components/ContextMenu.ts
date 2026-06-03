const FLOAT_TARGET_SELECTOR = '.sidebar, .insight-panel, .tweet-card, .music-player, .mission-console, .footer';
const MENU_CLOSE_DELAY_MS = 180;
const FLOAT_MAX_SPEED = 1.1;
const FLOAT_DAMPING = 0.996;
const FLOAT_BOUNCE = 0.82;

import { clamp } from '../utils/math';

interface FloatTarget {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationVelocity: number;
  phase: number;
  maxX: number;
  maxY: number;
}

export function initContextMenu(): void {
  const menu = createContextMenu();
  const gravity = createZeroGravityController();
  let openFrame = 0;
  let closeTimer: number | undefined;

  document.body.appendChild(menu.root);

  function syncMenuState(): void {
    menu.toggleLabel.textContent = gravity.isActive() ? '关闭失重模式' : '开启失重模式';
    menu.toggleStatus.textContent = gravity.isActive() ? 'ACTIVE' : 'READY';
    menu.toggleButton.setAttribute('aria-checked', String(gravity.isActive()));
  }

  function hideMenu(): void {
    if (openFrame !== 0) {
      cancelAnimationFrame(openFrame);
      openFrame = 0;
    }

    if (menu.root.hidden || menu.root.classList.contains('is-closing')) return;

    menu.root.classList.remove('is-open');
    menu.root.classList.add('is-closing');
    menu.root.setAttribute('aria-hidden', 'true');

    closeTimer = window.setTimeout(() => {
      if (!menu.root.classList.contains('is-open')) {
        menu.root.hidden = true;
        menu.root.classList.remove('is-closing');
      }
      closeTimer = undefined;
    }, MENU_CLOSE_DELAY_MS);
  }

  function showMenu(x: number, y: number): void {
    syncMenuState();

    if (closeTimer !== undefined) {
      window.clearTimeout(closeTimer);
      closeTimer = undefined;
    }
    if (openFrame !== 0) {
      cancelAnimationFrame(openFrame);
      openFrame = 0;
    }

    menu.root.hidden = false;
    menu.root.setAttribute('aria-hidden', 'false');
    menu.root.classList.remove('is-open', 'is-closing');

    const padding = 14;
    const rect = menu.root.getBoundingClientRect();
    const left = Math.min(Math.max(padding, x), window.innerWidth - rect.width - padding);
    const top = Math.min(Math.max(padding, y), window.innerHeight - rect.height - padding);
    const originX = Math.min(Math.max(18, x - left), rect.width - 18);
    const originY = Math.min(Math.max(18, y - top), rect.height - 18);

    menu.root.style.setProperty('--menu-x', `${left}px`);
    menu.root.style.setProperty('--menu-y', `${top}px`);
    menu.root.style.setProperty('--menu-origin-x', `${originX}px`);
    menu.root.style.setProperty('--menu-origin-y', `${originY}px`);

    openFrame = requestAnimationFrame(() => {
      openFrame = 0;
      menu.root.classList.add('is-open');
    });
  }

  menu.toggleButton.addEventListener('click', () => {
    gravity.setActive(!gravity.isActive());
    syncMenuState();
    hideMenu();
  });

  menu.topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    hideMenu();
  });

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    showMenu(event.clientX, event.clientY);
  });

  document.addEventListener('pointerdown', (event) => {
    if (!menu.root.hidden && !menu.root.contains(event.target as Node)) {
      hideMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (gravity.isActive()) gravity.setActive(false);
      hideMenu();
    }
  });

  window.addEventListener('resize', () => {
    hideMenu();
    gravity.refreshTargets();
  });
}

function createContextMenu(): {
  root: HTMLDivElement;
  toggleButton: HTMLButtonElement;
  toggleLabel: HTMLSpanElement;
  toggleStatus: HTMLSpanElement;
  topButton: HTMLButtonElement;
} {
  const root = document.createElement('div');
  root.className = 'vitex-context-menu';
  root.hidden = true;
  root.setAttribute('role', 'menu');
  root.setAttribute('aria-label', 'ViteX context menu');

  const header = document.createElement('div');
  header.className = 'vitex-context-menu-header';

  const title = document.createElement('span');
  title.textContent = 'VITEX CONTROL';

  const hint = document.createElement('span');
  hint.textContent = 'RIGHT CLICK';

  header.appendChild(title);
  header.appendChild(hint);

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'vitex-context-item vitex-context-item-primary';
  toggleButton.setAttribute('role', 'menuitemcheckbox');

  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'vitex-context-icon';
  toggleIcon.textContent = '☄';

  const toggleBody = document.createElement('span');
  toggleBody.className = 'vitex-context-copy';

  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'vitex-context-label';

  const toggleDescription = document.createElement('span');
  toggleDescription.className = 'vitex-context-description';
  toggleDescription.textContent = '组件脱离鼠标自由漂浮';

  toggleBody.appendChild(toggleLabel);
  toggleBody.appendChild(toggleDescription);

  const toggleStatus = document.createElement('span');
  toggleStatus.className = 'vitex-context-status';

  toggleButton.appendChild(toggleIcon);
  toggleButton.appendChild(toggleBody);
  toggleButton.appendChild(toggleStatus);

  const topButton = createMenuButton('↑', '回到顶部', '跳回时间线开头');

  root.appendChild(header);
  root.appendChild(toggleButton);
  root.appendChild(topButton);

  return { root, toggleButton, toggleLabel, toggleStatus, topButton };
}

function createMenuButton(iconText: string, labelText: string, descriptionText: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'vitex-context-item';
  button.setAttribute('role', 'menuitem');

  const icon = document.createElement('span');
  icon.className = 'vitex-context-icon';
  icon.textContent = iconText;

  const copy = document.createElement('span');
  copy.className = 'vitex-context-copy';

  const label = document.createElement('span');
  label.className = 'vitex-context-label';
  label.textContent = labelText;

  const description = document.createElement('span');
  description.className = 'vitex-context-description';
  description.textContent = descriptionText;

  copy.appendChild(label);
  copy.appendChild(description);
  button.appendChild(icon);
  button.appendChild(copy);

  return button;
}

function createZeroGravityController(): {
  isActive: () => boolean;
  refreshTargets: () => void;
  setActive: (nextActive: boolean) => void;
} {
  let active = false;
  let frame = 0;
  let lastTime = 0;
  let targets: FloatTarget[] = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function travelLimit(size: number, viewport: number, ratio: number, min: number, max: number): number {
    const available = Math.max(min, viewport - Math.min(size, viewport));
    return clamp(Math.min(viewport * ratio, available * 0.22), min, max);
  }

  function createTarget(el: HTMLElement, index: number, previous?: FloatTarget): FloatTarget {
    const angle = (index + 1) * 2.399963;
    const speed = 0.36 + (index % 5) * 0.055;

    return {
      el,
      x: previous?.x ?? 0,
      y: previous?.y ?? 0,
      vx: previous?.vx ?? Math.cos(angle) * speed,
      vy: previous?.vy ?? Math.sin(angle) * speed,
      rotation: previous?.rotation ?? 0,
      rotationVelocity: previous?.rotationVelocity ?? (index % 2 === 0 ? 0.045 : -0.045) + (index % 4) * 0.008,
      phase: previous?.phase ?? index * 0.91,
      maxX: travelLimit(el.offsetWidth, window.innerWidth, 0.12 + (index % 3) * 0.012, 34, 150),
      maxY: travelLimit(el.offsetHeight, window.innerHeight, 0.1 + (index % 4) * 0.01, 28, 125),
    };
  }

  function refreshTargets(): void {
    const previousTargets = new Map(targets.map((target) => [target.el, target]));
    targets = Array.from(document.querySelectorAll<HTMLElement>(FLOAT_TARGET_SELECTOR)).map((el, index) => {
      el.classList.add('gravity-float-target');
      return createTarget(el, index, previousTargets.get(el));
    });
  }

  function resetTargets(): void {
    for (const target of targets) {
      target.x = 0;
      target.y = 0;
      target.rotation = 0;
      target.el.style.setProperty('--gravity-x', '0px');
      target.el.style.setProperty('--gravity-y', '0px');
      target.el.style.setProperty('--gravity-rot', '0deg');
      target.el.style.setProperty('--gravity-scale', '1');
    }
  }

  function bounceTarget(target: FloatTarget): void {
    if (Math.abs(target.x) > target.maxX) {
      target.x = Math.sign(target.x) * target.maxX;
      target.vx = -target.vx * FLOAT_BOUNCE;
      target.rotationVelocity += target.vy * 0.035;
    }

    if (Math.abs(target.y) > target.maxY) {
      target.y = Math.sign(target.y) * target.maxY;
      target.vy = -target.vy * FLOAT_BOUNCE;
      target.rotationVelocity -= target.vx * 0.035;
    }
  }

  function tick(time: number): void {
    if (!active || reducedMotion.matches) {
      frame = 0;
      return;
    }

    if (lastTime === 0) lastTime = time;
    const step = Math.min(2.2, Math.max(0.5, (time - lastTime) / 16.67));
    lastTime = time;

    for (const target of targets) {
      const driftX = Math.sin(time * 0.0007 + target.phase) * 0.018 + Math.sin(time * 0.00021 + target.phase * 2.3) * 0.012;
      const driftY = Math.cos(time * 0.00062 + target.phase * 1.4) * 0.018 + Math.sin(time * 0.00027 + target.phase) * 0.01;
      const centerX = -(target.x / target.maxX) * 0.006;
      const centerY = -(target.y / target.maxY) * 0.006;

      target.vx = clamp((target.vx + (driftX + centerX) * step) * FLOAT_DAMPING, -FLOAT_MAX_SPEED, FLOAT_MAX_SPEED);
      target.vy = clamp((target.vy + (driftY + centerY) * step) * FLOAT_DAMPING, -FLOAT_MAX_SPEED, FLOAT_MAX_SPEED);
      target.x += target.vx * step;
      target.y += target.vy * step;
      bounceTarget(target);

      target.rotationVelocity = clamp(
        (target.rotationVelocity + Math.sin(time * 0.00038 + target.phase) * 0.0018 - target.rotation * 0.00018) * 0.998,
        -0.16,
        0.16,
      );
      target.rotation = clamp(target.rotation + target.rotationVelocity * step, -9, 9);

      const scale = 1.006 + Math.sin(time * 0.00044 + target.phase) * 0.004;

      target.el.style.setProperty('--gravity-x', `${target.x.toFixed(2)}px`);
      target.el.style.setProperty('--gravity-y', `${target.y.toFixed(2)}px`);
      target.el.style.setProperty('--gravity-rot', `${target.rotation.toFixed(2)}deg`);
      target.el.style.setProperty('--gravity-scale', scale.toFixed(3));
    }

    frame = requestAnimationFrame(tick);
  }

  function start(): void {
    refreshTargets();
    lastTime = 0;
    document.documentElement.classList.add('zero-gravity-active');
    if (frame === 0) frame = requestAnimationFrame(tick);
  }

  function stop(): void {
    active = false;
    lastTime = 0;
    document.documentElement.classList.remove('zero-gravity-active');
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    resetTargets();
  }

  const timeline = document.getElementById('timeline');
  if (timeline) {
    const observer = new MutationObserver(() => {
      refreshTargets();
      if (!active) resetTargets();
    });
    observer.observe(timeline, { childList: true });
  }

  refreshTargets();
  resetTargets();

  return {
    isActive: () => active,
    refreshTargets,
    setActive: (nextActive: boolean) => {
      if (active === nextActive) return;
      active = nextActive;
      if (active) start();
      else stop();
    },
  };
}

let cursorEl: HTMLDivElement | null = null;
let rafId = 0;

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

function move(x: number, y: number): void {
  if (!cursorEl) return;
  cursorEl.style.left = `${x}px`;
  cursorEl.style.top = `${y}px`;
}

export function renderCursor(): void {
  if (isMobile) return;

  // Hide native cursor
  const style = document.createElement('style');
  style.innerHTML = `* { cursor: none !important; }`;
  document.head.appendChild(style);

  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  cursor.classList.add('hidden');
  document.body.appendChild(cursor);
  cursorEl = cursor;

  document.addEventListener('mousemove', (e: MouseEvent) => {
    move(e.clientX, e.clientY);
    cursor.classList.remove('hidden');
  });

  document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));
  document.addEventListener('mousedown', () => cursor.classList.add('active'));
  document.addEventListener('mouseup', () => cursor.classList.remove('active'));
}

export function destroyCursor(): void {
  cancelAnimationFrame(rafId);
  cursorEl?.remove();
  cursorEl = null;
}

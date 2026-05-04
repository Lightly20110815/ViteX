let particles = 0;
const MAX_PARTICLES = 40;

const hue = () => Math.floor(Math.random() * 60 + 200);

const createDot = (x: number, y: number) => {
  if (particles > MAX_PARTICLES) return;

  const dot = document.createElement('span');
  dot.className = 'cursor-trail';
  const size = 3 + Math.random() * 4;
  const h = hue();
  dot.style.cssText = `
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    background: hsl(${h}, 80%, 65%);
    box-shadow: 0 0 ${size * 2}px hsl(${h}, 80%, 65%);
  `;
  particles++;
  document.body.appendChild(dot);

  setTimeout(() => {
    dot.remove();
    particles--;
  }, 600);
};

let lastX = 0;
let lastY = 0;
let ticking = false;

const onMove = (e: MouseEvent) => {
  lastX = e.clientX;
  lastY = e.clientY;
  if (!ticking) {
    requestAnimationFrame(() => {
      createDot(lastX, lastY);
      ticking = false;
    });
    ticking = true;
  }
};

export function renderTrailingCursor(): void {
  window.addEventListener('mousemove', onMove, { passive: true });
}

export function destroyTrailingCursor(): void {
  window.removeEventListener('mousemove', onMove);
  particles = 0;
}

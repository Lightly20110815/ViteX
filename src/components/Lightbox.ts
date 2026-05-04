export function openLightbox(url: string): void {
  const existing = document.querySelector('.lightbox-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';

  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Full image';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => overlay.remove());

  document.addEventListener('keydown', function handler(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handler);
    }
  });
}

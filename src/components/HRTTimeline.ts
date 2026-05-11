export interface HRTPhase {
  label: string;
  start: string;
  end?: string;
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
});

function getDaySpan(start: Date, end: Date): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / dayMs));
}

export function createHRTTimeline(phases: HRTPhase[]): HTMLElement {
  const sortedPhases = [...phases].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const today = new Date();
  const durations = sortedPhases.map((phase) => {
    const start = new Date(phase.start);
    const end = phase.end ? new Date(phase.end) : today;
    return getDaySpan(start, end);
  });
  const totalDays = durations.reduce((sum, days) => sum + days, 0);
  const activeIndex = sortedPhases.findIndex((phase) => !phase.end);
  const activeDays = activeIndex >= 0 ? durations[activeIndex] : 0;

  const container = document.createElement('section');
  container.className = 'hrt-timeline insight-panel insight-panel-hrt';
  container.setAttribute('aria-labelledby', 'hrt-timeline-title');

  const eyebrow = document.createElement('p');
  eyebrow.className = 'insight-eyebrow';
  eyebrow.textContent = 'Journey';

  const title = document.createElement('h2');
  title.id = 'hrt-timeline-title';
  title.className = 'insight-title';
  title.textContent = 'HRT 时间线';

  const summary = document.createElement('p');
  summary.className = 'insight-summary';
  summary.textContent =
    activeIndex >= 0 ? `当前阶段第 ${activeDays} 天，累计记录 ${totalDays} 天。` : `累计记录 ${totalDays} 天。`;

  const rail = document.createElement('ol');
  rail.className = 'hrt-phase-rail';

  sortedPhases.forEach((phase, index) => {
    const isOngoing = !phase.end;
    const start = new Date(phase.start);
    const end = phase.end ? new Date(phase.end) : today;
    const duration = durations[index];

    const item = document.createElement('li');
    item.className = `hrt-phase ${isOngoing ? 'hrt-phase-ongoing' : ''}`;

    const node = document.createElement('span');
    node.className = 'hrt-phase-node';
    node.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'hrt-phase-label';
    label.textContent = phase.label;

    const date = document.createElement('span');
    date.className = 'hrt-phase-date';
    date.textContent = `${dateFormatter.format(start)} — ${isOngoing ? 'Now' : dateFormatter.format(end)}`;

    const days = document.createElement('span');
    days.className = 'hrt-phase-days';
    days.textContent = `${duration}d`;

    item.appendChild(node);
    item.appendChild(label);
    item.appendChild(date);
    item.appendChild(days);
    rail.appendChild(item);
  });

  container.appendChild(eyebrow);
  container.appendChild(title);
  container.appendChild(summary);
  container.appendChild(rail);
  return container;
}

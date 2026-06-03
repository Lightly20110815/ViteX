import { fetchLiveWeather, type WeatherLive } from '../utils/weather';

const WEATHER_ICON_BY_KEYWORD: Array<[string, string]> = [
  ['雷', '⚡'],
  ['雨', '☔'],
  ['雪', '❄'],
  ['雾', '░'],
  ['阴', '☁'],
  ['云', '◐'],
  ['晴', '☀'],
];

export function createWeatherCard(): HTMLElement {
  const container = document.createElement('section');
  container.className = 'weather-card sidebar-weather-card';
  container.setAttribute('aria-labelledby', 'weather-card-title');
  container.setAttribute('aria-live', 'polite');

  renderLoading(container);
  void hydrateWeatherCard(container);

  return container;
}

async function hydrateWeatherCard(container: HTMLElement): Promise<void> {
  try {
    const weather = await fetchLiveWeather();
    if (!weather) {
      renderFallback(container);
      return;
    }

    renderWeather(container, weather);
  } catch (error) {
    console.error('Weather card: failed to fetch live weather', error);
    renderFallback(container);
  }
}

function renderLoading(container: HTMLElement): void {
  container.innerHTML = '';
  container.append(createHeader('Live Weather', '定位实时天气'));

  const status = document.createElement('p');
  status.className = 'weather-card-status';
  status.textContent = '同步窗外信号中...';

  container.append(status);
}

function renderFallback(container: HTMLElement): void {
  container.innerHTML = '';
  container.append(createHeader('Live Weather', '天气暂时离线'));

  const body = document.createElement('div');
  body.className = 'weather-card-body weather-card-body-muted';

  const icon = document.createElement('span');
  icon.className = 'weather-card-icon';
  icon.textContent = '--';
  icon.setAttribute('aria-hidden', 'true');

  const copy = document.createElement('div');
  copy.className = 'weather-card-copy';

  const title = document.createElement('strong');
  title.className = 'weather-card-temp';
  title.textContent = '暂无数据';

  const summary = document.createElement('span');
  summary.className = 'weather-card-summary';
  summary.textContent = '稍后再试试';

  copy.append(title, summary);
  body.append(icon, copy);
  container.append(body);
}

function renderWeather(container: HTMLElement, weather: WeatherLive): void {
  container.innerHTML = '';
  container.append(createHeader('Live Weather', formatReportTime(weather.reporttime)));

  const body = document.createElement('div');
  body.className = 'weather-card-body';

  const icon = document.createElement('span');
  icon.className = 'weather-card-icon';
  icon.textContent = getWeatherIcon(weather.weather);
  icon.setAttribute('aria-hidden', 'true');

  const copy = document.createElement('div');
  copy.className = 'weather-card-copy';

  const temperature = document.createElement('strong');
  temperature.className = 'weather-card-temp';
  temperature.textContent = `${weather.temperature}°C`;

  const summary = document.createElement('span');
  summary.className = 'weather-card-summary';
  summary.textContent = `${weather.city} · ${weather.weather}`;

  copy.append(temperature, summary);
  body.append(icon, copy);

  const meta = document.createElement('dl');
  meta.className = 'weather-card-meta';
  appendMeta(meta, '湿度', `${weather.humidity}%`);
  appendMeta(meta, '风向', weather.winddirection);
  appendMeta(meta, '风力', `${weather.windpower}级`);

  container.append(body, meta);
}

function createHeader(titleText: string, metaText: string): HTMLElement {
  const header = document.createElement('div');
  header.className = 'weather-card-header';

  const title = document.createElement('h2');
  title.id = 'weather-card-title';
  title.className = 'weather-card-title';
  title.textContent = titleText;

  const meta = document.createElement('p');
  meta.className = 'weather-card-report';
  meta.textContent = metaText;

  header.append(title, meta);
  return header;
}

function appendMeta(list: HTMLDListElement, label: string, value: string): void {
  const item = document.createElement('div');
  item.className = 'weather-card-meta-item';

  const term = document.createElement('dt');
  term.textContent = label;

  const description = document.createElement('dd');
  description.textContent = value || '--';

  item.append(term, description);
  list.appendChild(item);
}

function getWeatherIcon(weather: string): string {
  const match = WEATHER_ICON_BY_KEYWORD.find(([keyword]) => weather.includes(keyword));
  return match?.[1] ?? '◎';
}

function formatReportTime(reportTime: string): string {
  if (!reportTime) return '实时更新';

  const date = new Date(reportTime.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '实时更新';

  return `更新 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
}

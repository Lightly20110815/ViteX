/**
 * Amap weather API helpers — same pattern as vitepress-theme-curve/.vitepress/theme/api/index.js
 * https://restapi.amap.com — IP geolocation + live weather
 */

const FALLBACK_KEY = '29798a7fd1592707e87b9b9a57bde012';

export interface AdcodeResponse {
  status: string;
  info: string;
  province?: string;
  city?: string;
  adcode?: string;
  rectangle?: string;
}

export interface WeatherLive {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  temperature: string;
  winddirection: string;
  windpower: string;
  humidity: string;
  reporttime: string;
}

export interface WeatherResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  lives?: WeatherLive[];
}

function getKey(): string {
  const env = (import.meta.env.VITE_WEATHER_KEY as string | undefined) || FALLBACK_KEY;
  return env;
}

export async function getAdcode(): Promise<AdcodeResponse> {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${getKey()}`);
  if (!res.ok) throw new Error(`Amap IP error ${res.status}`);
  return (await res.json()) as AdcodeResponse;
}

export async function getWeather(adcode: string): Promise<WeatherResponse> {
  const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${getKey()}&city=${adcode}`);
  if (!res.ok) throw new Error(`Amap weather error ${res.status}`);
  return (await res.json()) as WeatherResponse;
}

export async function fetchLiveWeather(): Promise<WeatherLive | null> {
  const adcodeRes = await getAdcode();
  const adcode = adcodeRes.adcode;
  if (!adcode || typeof adcode !== 'string' || adcode.length === 0) return null;
  const weatherRes = await getWeather(adcode);
  return weatherRes.lives?.[0] ?? null;
}

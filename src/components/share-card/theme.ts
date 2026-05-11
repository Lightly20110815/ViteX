export type ShareTheme = {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSoft: string;
  glow: string;
  rail: string;
};

export const CARD_WIDTH = 1080;
export const MIN_CARD_HEIGHT = 1350;
export const CARD_RADIUS = 56;
export const CARD_X = 92;
export const CARD_Y = 92;
export const CARD_W = CARD_WIDTH - CARD_X * 2;
export const CONTENT_X = CARD_X + 72;
export const CONTENT_W = CARD_W - 144;

export function getShareTheme(): ShareTheme {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return isDark
    ? {
        pageBg: '#05070d',
        cardBg: 'rgba(17, 20, 30, 0.86)',
        cardBorder: 'rgba(255, 255, 255, 0.18)',
        textPrimary: '#f7f7fb',
        textSecondary: '#c8ccd8',
        textTertiary: '#8d96aa',
        accent: '#58a6ff',
        accentSoft: 'rgba(88, 166, 255, 0.16)',
        glow: 'rgba(41, 151, 255, 0.34)',
        rail: 'rgba(255, 255, 255, 0.12)',
      }
    : {
        pageBg: '#f5f7fb',
        cardBg: 'rgba(255, 255, 255, 0.82)',
        cardBorder: 'rgba(255, 255, 255, 0.78)',
        textPrimary: '#15171d',
        textSecondary: '#4d5566',
        textTertiary: '#8a91a2',
        accent: '#0066cc',
        accentSoft: 'rgba(0, 102, 204, 0.12)',
        glow: 'rgba(0, 102, 204, 0.2)',
        rail: 'rgba(21, 23, 29, 0.1)',
      };
}

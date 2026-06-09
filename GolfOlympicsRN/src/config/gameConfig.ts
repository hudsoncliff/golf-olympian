export const MEDAL_CONFIG = {
  gold:   { label: '🥇 金',  points: 4, color: '#F5A623' },
  silver: { label: '🥈 銀',  points: 3, color: '#9B9B9B' },
  bronze: { label: '🥉 銅',  points: 2, color: '#C47B2B' },
  iron:   { label: '🪨 鉄',  points: 1, color: '#607D8B' },
} as const;

export type MedalKey = keyof typeof MEDAL_CONFIG;
export const MEDAL_KEYS: MedalKey[] = ['gold', 'silver', 'bronze', 'iron'];

export const SPECIAL_CONFIG = {
  diamond: { label: '💎 ダイヤ',   points: 5, color: '#64D4F7' },
  saoichi: { label: '🚩 竿イチ権', bonus: 3,  color: '#A78BFA' },
  neapin:  { label: '📍 ニアピン', points: 2, color: '#34D399' },
  birdie:  { label: '🐦 バーディ', points: 3, color: '#86EFAC' },
} as const;

export interface PointConfig {
  gold: number;
  silver: number;
  bronze: number;
  iron: number;
  diamond: number;
  saoichiBonus: number;
  neapin: number;
  birdie: number;
}

export const DEFAULT_POINT_CONFIG: PointConfig = {
  gold: 4, silver: 3, bronze: 2, iron: 1,
  diamond: 5, saoichiBonus: 3, neapin: 2, birdie: 3,
};

export function getMedalKeysForCount(count: number): MedalKey[] {
  return MEDAL_KEYS.slice(0, count);
}

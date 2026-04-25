import type { Mood, PriceLevel, Situation } from '../types';

export const moodLabels: Record<Mood, string> = {
  warm: 'Něco teplého',
  fast: 'Něco rychlého',
  light: 'Něco lehkého',
  cheap: 'Něco levného',
  healthy: 'Něco zdravějšího',
  sweet: 'Něco sladkého',
  any: 'Je mi to jedno',
};

export const moodEmoji: Record<Mood, string> = {
  warm: '🍲',
  fast: '⚡',
  light: '🥗',
  cheap: '💰',
  healthy: '🌿',
  sweet: '🍰',
  any: '🤷',
};

export const situationLabels: Record<Situation, string> = {
  now: 'Chci jíst hned',
  '15min': 'Mám 15 minut',
  '30min': 'Mám 30 minut',
  sitdown: 'Chci si někam sednout',
  delivery: 'Chci rozvoz',
  pickup: 'Chci vyzvednout',
};

export const priceLabel = (level: PriceLevel): string => '€'.repeat(level);

export const moodOrder: Mood[] = [
  'warm',
  'fast',
  'light',
  'cheap',
  'healthy',
  'sweet',
  'any',
];

export const situationOrder: Situation[] = [
  'now',
  '15min',
  '30min',
  'sitdown',
  'delivery',
  'pickup',
];

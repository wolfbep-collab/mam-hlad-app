export const colors = {
  primary: '#E0701F',
  primaryDark: '#9A4B12',
  primarySoft: '#F6E4CC',
  background: '#F6EFE3',
  surface: '#FFFDF8',
  surfaceMuted: '#EFE6D6',
  textPrimary: '#15110C',
  textSecondary: '#4A3F33',
  textMuted: '#897A66',
  border: '#DDD0BA',
  gold: '#B68A2C',
  goldSoft: 'rgba(182, 138, 44, 0.16)',
  success: '#65A30D',
  successSoft: '#ECFCCB',
  warning: '#D97706',
  danger: '#DC2626',
  overlay: 'rgba(31, 18, 8, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;

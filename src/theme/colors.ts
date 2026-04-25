export const colors = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  primarySoft: '#FFEDD5',
  background: '#FFF7ED',
  surface: '#FFFFFF',
  surfaceMuted: '#FEF3E7',
  textPrimary: '#1F1208',
  textSecondary: '#6B5544',
  textMuted: '#9C8674',
  border: '#F3E4D2',
  success: '#65A30D',
  successSoft: '#ECFCCB',
  warning: '#D97706',
  danger: '#DC2626',
  overlay: 'rgba(31, 18, 8, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;

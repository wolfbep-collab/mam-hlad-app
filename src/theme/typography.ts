import { Platform, TextStyle } from 'react-native';

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const systemBold = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label';

export const typography: Record<Variant, TextStyle> = {
  display: {
    fontFamily: systemBold,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: systemBold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: systemBold,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  h3: {
    fontFamily: systemBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontFamily: systemFont,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyStrong: {
    fontFamily: systemBold,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  caption: {
    fontFamily: systemFont,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  label: {
    fontFamily: systemBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
};

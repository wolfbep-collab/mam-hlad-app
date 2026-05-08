import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../theme';

const BOWL_LOGO = require('../../assets/adaptive-icon.png');

interface SteamLogoIntroProps {
  /** Fired once the closing fade-out finishes — parent unmounts the intro then. */
  onDone: () => void;
  /** How long the intro stays on screen before the closing fade. Default 1700ms. */
  durationMs?: number;
}

const LOGO_SIZE = 220;
const STEAM_CUSHION = 64;
const STEAM_W = 12;
const STEAM_H = 24;
const FADE_OUT_MS = 320;

/**
 * Lightweight launch intro. Renders the actual bowl logo asset (the same image
 * used as the Android adaptive icon) with three poloprůhledné páry that rise
 * and dissipate above it. The image is a static PNG bundled with the app — no
 * video, no GIF, no SVG, no extra dependency. All steam animations run on the
 * native driver (opacity + translate + scaleX only).
 */
export function SteamLogoIntro({
  onDone,
  durationMs = 1700,
}: SteamLogoIntroProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;
  const steamA = useRef(new Animated.Value(0)).current;
  const steamB = useRef(new Animated.Value(0)).current;
  const steamC = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const introIn = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 460,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]);
    introIn.start();

    const wispLoop = (anim: Animated.Value) =>
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        })
      );
    const loopA = wispLoop(steamA);
    const loopB = wispLoop(steamB);
    const loopC = wispLoop(steamC);

    // Stagger the three wisps so the steam reads as continuous.
    const startA = setTimeout(() => loopA.start(), 0);
    const startB = setTimeout(() => loopB.start(), 500);
    const startC = setTimeout(() => loopC.start(), 1000);

    const closeTimer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, durationMs);

    return () => {
      clearTimeout(startA);
      clearTimeout(startB);
      clearTimeout(startC);
      clearTimeout(closeTimer);
      loopA.stop();
      loopB.stop();
      loopC.stop();
      introIn.stop();
    };
  }, [fade, logoScale, steamA, steamB, steamC, onDone, durationMs]);

  const wispStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.18, 0.7, 1],
      outputRange: [0, 0.55, 0.3, 0],
    }),
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -64],
        }),
      },
      {
        scaleX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.4],
        }),
      },
    ],
  });

  return (
    <Animated.View
      style={[styles.container, { opacity: fade }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View
        style={[styles.logoArea, { transform: [{ scale: logoScale }] }]}
      >
        <Animated.View style={[styles.steam, styles.steamLeft, wispStyle(steamA)]} />
        <Animated.View style={[styles.steam, styles.steamCenter, wispStyle(steamB)]} />
        <Animated.View style={[styles.steam, styles.steamRight, wispStyle(steamC)]} />
        <Image
          source={BOWL_LOGO}
          style={styles.bowlImage}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
      <Text style={[typography.display, styles.brand]}>Mám hlad</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    zIndex: 100,
    elevation: 100,
  },
  logoArea: {
    width: LOGO_SIZE,
    height: LOGO_SIZE + STEAM_CUSHION,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bowlImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  steam: {
    position: 'absolute',
    width: STEAM_W,
    height: STEAM_H,
    borderRadius: STEAM_W / 2,
    backgroundColor: colors.textMuted,
    bottom: LOGO_SIZE - 8,
  },
  steamLeft: {
    left: LOGO_SIZE / 2 - STEAM_W / 2 - 28,
  },
  steamCenter: {
    left: LOGO_SIZE / 2 - STEAM_W / 2,
  },
  steamRight: {
    left: LOGO_SIZE / 2 - STEAM_W / 2 + 28,
  },
  brand: {
    color: colors.primaryDark,
  },
});

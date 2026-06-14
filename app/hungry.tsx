import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../src/components';
import { colors, radius, spacing, typography } from '../src/theme';

const TRY_MAILTO = `mailto:wolf.bep@gmail.com?subject=${encodeURIComponent(
  'Chci vyzkoušet Mám hlad'
)}`;

const POINTS = [
  'Podle chuti — na co máš zrovna náladu.',
  'Podle času — kolik minut na to máš.',
  'Podle situace — sednout si, vzít s sebou, nebo cestou.',
  'A podle toho, jak jíš.',
];

export default function HungryScreen() {
  const router = useRouter();

  const openMail = () => {
    void Linking.openURL(TRY_MAILTO).catch(() => {});
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>🍜</Text>
        </View>
        <Text style={[typography.h1, styles.title]}>Nevíš, co si dát?</Text>
        <Text style={[typography.body, styles.lead]}>
          Budujeme výběrového osobního průvodce jídlem pro Česko. Mám hlad ti
          pomůže najít konkrétní jídlo v okolí — ne nekonečný seznam restaurací,
          ale pár chytrých tipů, na co se vyplatí vyrazit.
        </Text>
      </View>

      <View style={styles.card}>
        {POINTS.map((point) => (
          <View key={point} style={styles.pointRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[typography.body, styles.pointText]}>{point}</Text>
          </View>
        ))}
      </View>

      <Text style={[typography.caption, styles.note]}>
        Začínáme první partnerskou vlnou — kvůli kvalitě, ne objemu. Ještě
        nejsme veřejně v obchodech s aplikacemi — když nám napíšeš, dáme ti
        vědět, až bude co zkoušet.
      </Text>

      <View style={styles.ctaBlock}>
        <Button
          label="Chci vyzkoušet Mám hlad"
          onPress={openMail}
          accessibilityLabel="Napsat e-mail o vyzkoušení Mám hlad"
        />
        <Text style={[typography.caption, styles.ctaHint]}>
          Otevře se e-mail na wolf.bep@gmail.com.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push('/privacy')}
          accessibilityRole="link"
        >
          <Text style={[typography.caption, styles.footerLink]}>Soukromí</Text>
        </Pressable>
        <Text style={styles.footerDot}>·</Text>
        <Pressable
          onPress={() => router.push('/support')}
          accessibilityRole="link"
        >
          <Text style={[typography.caption, styles.footerLink]}>Podpora</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.xl,
  },
  hero: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 32,
  },
  title: {
    color: colors.textPrimary,
  },
  lead: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pointRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: colors.primary,
  },
  pointText: {
    color: colors.textPrimary,
    flex: 1,
  },
  note: {
    color: colors.textMuted,
  },
  ctaBlock: {
    gap: spacing.sm,
  },
  ctaHint: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footerLink: {
    color: colors.primaryDark,
  },
  footerDot: {
    color: colors.textMuted,
  },
});

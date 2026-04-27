import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../src/components';
import { colors, spacing, typography } from '../src/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.heroBlock}>
        <View style={styles.bowlBadge}>
          <Text style={styles.bowlEmoji}>🍜</Text>
        </View>
        <Text style={[typography.display, styles.title]}>Mám hlad</Text>
        <Text style={[typography.body, styles.lead]}>
          Rozhodni se za 30 sekund. Řekni nám, jakou máš chuť a kolik máš času —
          najdeme to nejlepší, co si dát teď.
        </Text>
      </View>

      <View style={styles.featureRow}>
        <Feature emoji="⚡" label="Rychlé" />
        <Feature emoji="🎯" label="Trefa" />
        <Feature emoji="🤝" label="Lidsky" />
      </View>

      <View style={styles.ctaBlock}>
        <Button
          label="Mám hlad"
          onPress={() => router.push('/hunger')}
          accessibilityLabel="Začít vybírat jídlo"
        />
        <Button
          label="Vím, co si dát"
          variant="secondary"
          onPress={() => router.push('/known')}
          accessibilityLabel="Vyhledat konkrétní jídlo"
        />
        <Pressable
          onPress={() => router.push('/history')}
          style={({ pressed }) => [
            styles.linkBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[typography.bodyStrong, styles.linkLabel]}>
            Tvoje tipy
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Feature({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={[typography.label, styles.featureLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
  },
  heroBlock: {
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  bowlBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  bowlEmoji: {
    fontSize: 40,
  },
  title: {
    color: colors.textPrimary,
  },
  lead: {
    color: colors.textSecondary,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xxl,
    gap: spacing.md,
  },
  feature: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  featureLabel: {
    color: colors.textSecondary,
  },
  ctaBlock: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkLabel: {
    color: colors.primaryDark,
  },
});

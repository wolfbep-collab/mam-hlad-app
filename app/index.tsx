import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../src/components';
import { colors, spacing, typography } from '../src/theme';

const FOOD_DECO = ['🍕', '🍜', '🥗'];

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
          Vyber, na co máš chuť. My ti najdeme vhodné jídlo.
        </Text>
      </View>

      <View
        style={styles.foodStrip}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {FOOD_DECO.map((emoji) => (
          <Text key={emoji} style={styles.foodEmoji}>
            {emoji}
          </Text>
        ))}
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
        <View style={styles.streetFoodGroup}>
          <Pressable
            onPress={() => router.push('/street-food')}
            style={({ pressed }) => [
              styles.linkBtn,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="link"
            accessibilityLabel="Zobrazit aktivní street food stánky"
          >
            <Text style={[typography.bodyStrong, styles.linkLabel]}>
              🛺 Street food dnes
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/vendor-checkin')}
            style={({ pressed }) => [
              styles.subLinkBtn,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="link"
            accessibilityLabel="Přidat dnešní místo, pokud máš stánek"
          >
            <Text style={[typography.caption, styles.subLinkLabel]}>
              Mám stánek →
            </Text>
          </Pressable>
        </View>
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
  foodStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
    marginVertical: spacing.xl,
  },
  foodEmoji: {
    fontSize: 44,
    opacity: 0.85,
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
  streetFoodGroup: {
    alignItems: 'center',
  },
  subLinkBtn: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: spacing.sm,
  },
  subLinkLabel: {
    color: colors.textMuted,
  },
});

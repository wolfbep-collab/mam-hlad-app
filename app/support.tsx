import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../src/components';
import { colors, radius, spacing, typography } from '../src/theme';

const SUPPORT_EMAIL = 'wolf.bep@gmail.com';
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  'Mám hlad — podpora'
)}`;

export default function SupportScreen() {
  const openMail = () => {
    void Linking.openURL(SUPPORT_MAILTO).catch(() => {});
  };

  return (
    <Screen contentStyle={styles.content}>
      <Text style={[typography.h1, styles.title]}>Podpora</Text>
      <Text style={[typography.body, styles.intro]}>
        Mám hlad je malý projekt. Píše ti zpátky člověk, ne robot — pro podniky
        i pro lidi, co aplikaci zkouší.
      </Text>

      <View style={styles.card}>
        <Text style={[typography.label, styles.cardLabel]}>E-mail</Text>
        <Pressable onPress={openMail} accessibilityRole="link">
          <Text style={[typography.h3, styles.email]}>{SUPPORT_EMAIL}</Text>
        </Pressable>
        <Text style={[typography.caption, styles.cardHint]}>
          Ozveme se nejpozději do dvou pracovních dnů.
        </Text>
      </View>

      <Button
        label="Napsat nám"
        onPress={openMail}
        accessibilityLabel="Napsat e-mail podpoře"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
  },
  intro: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  email: {
    color: colors.primaryDark,
  },
  cardHint: {
    color: colors.textMuted,
  },
});

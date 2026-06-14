import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../src/components';
import { colors, radius, spacing, typography } from '../src/theme';

const PARTNER_MAILTO = `mailto:wolf.bep@gmail.com?subject=${encodeURIComponent(
  'Chci přidat podnik do Mám hlad'
)}`;

const POINTS = [
  'Profil podniku připravíme my — zdarma.',
  'Vy jen schválíte náhled, než ho někdo uvidí.',
  'Žádný závazek a žádná smlouva.',
  'Žádné provize za rozvoz. Mám hlad nic neprodává.',
];

export default function PartnersScreen() {
  const router = useRouter();

  const openMail = () => {
    void Linking.openURL(PARTNER_MAILTO).catch(() => {});
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Pro podniky</Text>
        <Text style={[typography.h1, styles.title]}>
          Hledáme podniky, kuchaře a jídla, která stojí za doporučení
        </Text>
        <Text style={[typography.body, styles.lead]}>
          Budujeme výběrového osobního průvodce jídlem pro Česko. Lidé hledají
          konkrétní jídlo podle chuti, času a situace — ne další seznam
          restaurací k prohlížení. Chceme mít v každém městě ta jídla, kuchaře a
          podniky, které stojí za doporučení.
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
        Začínáme první partnerskou vlnou — ne kvůli objemu, ale kvůli kvalitě.
        Nechceme stovky náhodných podniků; první ověřovací vlna začíná v
        regionech, kde najdeme silné partnery.
      </Text>

      <View style={styles.ctaBlock}>
        <Button
          label="Chci přidat podnik"
          onPress={openMail}
          accessibilityLabel="Napsat e-mail o přidání podniku"
        />
        <Text style={[typography.caption, styles.ctaHint]}>
          Otevře se e-mail na wolf.bep@gmail.com. Odpovídáme osobně.
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
  },
  eyebrow: {
    ...typography.label,
    color: colors.primaryDark,
    textTransform: 'uppercase',
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

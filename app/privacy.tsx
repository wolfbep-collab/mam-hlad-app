import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../src/components';
import { colors, spacing, typography } from '../src/theme';

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'Pilotní aplikace',
    body: 'Mám hlad je zatím v pilotní fázi. Tenhle text je jednoduchý draft, který se bude upravovat, jak se aplikace vyvíjí. Není to právní dokument napsaný advokátem.',
  },
  {
    heading: 'Nesbíráme zbytečná data',
    body: 'Nechceme po tobě účet a nesbíráme o tobě data, která nepotřebujeme. Tvoje volby a historie zůstávají ve tvém telefonu.',
  },
  {
    heading: 'Data podniků',
    body: 'Údaje o podnicích používáme jen k tomu, abychom zobrazili jejich profil v aplikaci. Nic neprodáváme dál a neživíme tím reklamu.',
  },
  {
    heading: 'Informace o jídle',
    body: 'Informace o jídle zadává nebo schvaluje sám podnik. Mám hlad je negarantuje a nedoplňuje za podnik.',
  },
  {
    heading: 'Alergie a celiakie',
    body: 'Při alergii nebo celiakii se vždy raději zeptej přímo obsluhy. Aplikace nemůže zaručit, že je jídlo pro tebe bezpečné.',
  },
];

export default function PrivacyScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <Text style={[typography.h1, styles.title]}>Soukromí</Text>
      <Text style={[typography.body, styles.intro]}>
        Krátce a srozumitelně, co Mám hlad dělá s daty.
      </Text>

      {SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={[typography.h3, styles.heading]}>{section.heading}</Text>
          <Text style={[typography.body, styles.body]}>{section.body}</Text>
        </View>
      ))}
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
  section: {
    gap: spacing.xs,
  },
  heading: {
    color: colors.textPrimary,
  },
  body: {
    color: colors.textSecondary,
  },
});

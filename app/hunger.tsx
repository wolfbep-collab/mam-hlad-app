import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, MoodChip, Screen } from '../src/components';
import {
  moodEmoji,
  moodLabels,
  moodOrder,
  situationLabels,
  situationOrder,
} from '../src/lib/labels';
import { colors, spacing, typography } from '../src/theme';
import type { Mood, Situation } from '../src/types';

export default function HungerScreen() {
  const router = useRouter();
  const [mood, setMood] = useState<Mood | null>(null);
  const [situation, setSituation] = useState<Situation | null>(null);

  const canContinue = mood !== null && situation !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({
      pathname: '/results',
      params: { mood, situation },
    });
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.section}>
        <Text style={[typography.h1, styles.heading]}>Jakou máš chuť?</Text>
        <Text style={[typography.body, styles.subheading]}>
          Vyber jednu volbu, která ti právě teď sedí.
        </Text>
        <View style={styles.chipRow}>
          {moodOrder.map((m) => (
            <MoodChip
              key={m}
              label={moodLabels[m]}
              emoji={moodEmoji[m]}
              selected={mood === m}
              onPress={() => setMood(m)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h1, styles.heading]}>Jaká je situace?</Text>
        <Text style={[typography.body, styles.subheading]}>
          Pomůže nám to s časem a způsobem obsluhy.
        </Text>
        <View style={styles.chipRow}>
          {situationOrder.map((s) => (
            <MoodChip
              key={s}
              label={situationLabels[s]}
              selected={situation === s}
              onPress={() => setSituation(s)}
            />
          ))}
        </View>
      </View>

      <View style={styles.cta}>
        <Button
          label={canContinue ? 'Najít doporučení' : 'Vyber chuť i situaci'}
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  heading: {
    color: colors.textPrimary,
  },
  subheading: {
    color: colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cta: {
    marginTop: spacing.lg,
  },
});

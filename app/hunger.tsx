import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, MoodChip, Screen } from '../src/components';
import { demoPlaces } from '../src/data/demoPlaces';
import {
  moodEmoji,
  moodLabels,
  moodOrder,
  situationLabels,
  situationOrder,
} from '../src/lib/labels';
import { countViableTips } from '../src/lib/recommendationEngine';
import { colors, radius, spacing, typography } from '../src/theme';
import type { Mood, Situation } from '../src/types';

function tipsCaption(count: number): string {
  if (count === 0) return 'Máme pro tebe několik vhodných tipů.';
  if (count === 1) return 'Máme pro tebe jeden vhodný tip.';
  if (count >= 2 && count <= 4) return `Máme pro tebe ${count} vhodné tipy.`;
  return `Máme pro tebe ${count} vhodných tipů.`;
}

export default function HungerScreen() {
  const router = useRouter();
  const [mood, setMood] = useState<Mood | null>(null);
  const [situation, setSituation] = useState<Situation | null>(null);

  const canContinue = mood !== null && situation !== null;

  const viableCount = useMemo(() => {
    if (!canContinue || !mood || !situation) return 0;
    return countViableTips({ mood, situation }, demoPlaces);
  }, [canContinue, mood, situation]);

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({
      pathname: '/results',
      params: { mood, situation },
    });
  };

  return (
    <Screen contentStyle={styles.content}>
      <Text style={[typography.body, styles.intro]}>
        Vyber, co se ti hodí právě teď. Stačí jeden pocit a jedna situace.
      </Text>

      <View style={styles.section}>
        <Text style={[typography.h1, styles.heading]}>Na co máš chuť?</Text>
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
        <Text style={[typography.h1, styles.heading]}>Jaká je tvoje situace?</Text>
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
          label="Najít jídlo"
          onPress={handleContinue}
          disabled={!canContinue}
        />
        {canContinue ? (
          <View style={styles.captionBox}>
            <Text style={[typography.caption, styles.captionText]}>
              {tipsCaption(viableCount)}
            </Text>
          </View>
        ) : (
          <View style={styles.hintBox}>
            <Text style={[typography.caption, styles.hintText]}>
              Vyber jeden pocit a jednu situaci, ať ti můžeme poradit.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  intro: {
    color: colors.textSecondary,
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
    gap: spacing.sm,
  },
  captionBox: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
  },
  captionText: {
    color: colors.textSecondary,
  },
  hintBox: {
    alignSelf: 'center',
  },
  hintText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});

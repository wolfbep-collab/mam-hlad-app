import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, MoodChip, Screen } from '../src/components';
import { demoPlaces } from '../src/data/demoPlaces';
import {
  dietaryLabels,
  dietaryOrder,
  moodEmoji,
  moodLabels,
  moodOrder,
  situationLabels,
  situationOrder,
} from '../src/lib/labels';
import { countViableTips } from '../src/lib/recommendationEngine';
import { colors, radius, spacing, typography } from '../src/theme';
import type { DietaryPreference, Mood, Situation } from '../src/types';

function tipsCaption(count: number): string {
  if (count === 0) return 'Máme pro tebe několik vhodných tipů.';
  if (count === 1) return 'Máme pro tebe jeden vhodný tip.';
  if (count >= 2 && count <= 4) return `Máme pro tebe ${count} vhodné tipy.`;
  return `Máme pro tebe ${count} vhodných tipů.`;
}

const MAX_MOODS = 2;
const MAX_SITUATIONS = 2;

export default function HungerScreen() {
  const router = useRouter();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [dietaryPreference, setDietaryPreference] =
    useState<DietaryPreference>('any');

  const canContinue = moods.length >= 1 && situations.length >= 1;

  const toggleMood = (m: Mood) => {
    setMoods((prev) => {
      if (prev.includes(m)) {
        return prev.filter((x) => x !== m);
      }
      if (prev.length >= MAX_MOODS) {
        // Replace the oldest selection — drop the first, push the new one.
        return [...prev.slice(1), m];
      }
      return [...prev, m];
    });
  };

  const toggleSituation = (s: Situation) => {
    setSituations((prev) => {
      if (prev.includes(s)) {
        return prev.filter((x) => x !== s);
      }
      if (prev.length >= MAX_SITUATIONS) {
        return [...prev.slice(1), s];
      }
      return [...prev, s];
    });
  };

  const viableCount = useMemo(() => {
    if (!canContinue || situations.length === 0 || moods.length === 0) return 0;
    return countViableTips(
      {
        mood: moods[0],
        moods,
        situation: situations[0],
        situations,
        dietaryPreference,
      },
      demoPlaces
    );
  }, [canContinue, moods, situations, dietaryPreference]);

  const handleContinue = () => {
    if (!canContinue || situations.length === 0 || moods.length === 0) return;
    router.push({
      pathname: '/results',
      params: {
        mood: moods[0],
        moods: moods.join(','),
        situation: situations[0],
        situations: situations.join(','),
        diet: dietaryPreference,
      },
    });
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.heroBlock}>
        <View
          style={styles.bowlBadge}
          accessibilityLabel="Mám hlad"
          accessibilityRole="image"
        >
          <Text style={styles.bowlEmoji}>🍜</Text>
        </View>
        <Text style={[typography.h1, styles.heroHeading]}>Na co máš chuť?</Text>
        <Text style={[typography.body, styles.heroSubheading]}>
          Vyber jednu nebo dvě volby, které ti teď sedí.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.chipRow}>
          {moodOrder.map((m) => (
            <MoodChip
              key={m}
              label={moodLabels[m]}
              emoji={moodEmoji[m]}
              selected={moods.includes(m)}
              onPress={() => toggleMood(m)}
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
              selected={situations.includes(s)}
              onPress={() => toggleSituation(s)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.dietHeading]}>Jak jíš?</Text>
        <Text style={[typography.caption, styles.dietSubheading]}>
          Vegetariánům a veganům doporučíme jen vhodné položky.
        </Text>
        <View style={styles.chipRow}>
          {dietaryOrder.map((d) => (
            <MoodChip
              key={d}
              label={dietaryLabels[d]}
              selected={dietaryPreference === d}
              onPress={() => setDietaryPreference(d)}
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
              Vyber aspoň jeden pocit a jednu situaci, ať ti můžeme poradit.
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
  heroBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  bowlBadge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  bowlEmoji: {
    fontSize: 60,
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
  heroHeading: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroSubheading: {
    color: colors.textSecondary,
    textAlign: 'center',
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
  dietHeading: {
    color: colors.textPrimary,
  },
  dietSubheading: {
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
});

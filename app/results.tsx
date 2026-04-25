import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, FoodCard, Screen } from '../src/components';
import { demoPlaces } from '../src/data/demoPlaces';
import { appendHistory } from '../src/lib/history';
import { moodLabels, situationLabels } from '../src/lib/labels';
import { recommend } from '../src/lib/recommendationEngine';
import { colors, spacing, typography } from '../src/theme';
import type { Mood, Situation } from '../src/types';

const isMood = (v: string | undefined): v is Mood =>
  !!v &&
  ['warm', 'fast', 'light', 'cheap', 'healthy', 'sweet', 'any'].includes(v);

const isSituation = (v: string | undefined): v is Situation =>
  !!v &&
  ['now', '15min', '30min', 'sitdown', 'delivery', 'pickup'].includes(v);

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mood?: string; situation?: string }>();

  const mood: Mood = isMood(params.mood) ? params.mood : 'any';
  const situation: Situation = isSituation(params.situation)
    ? params.situation
    : 'now';

  const result = useMemo(
    () => recommend({ mood, situation }, demoPlaces),
    [mood, situation]
  );

  useEffect(() => {
    const top = result.recommendations[0];
    if (!top) return;
    void appendHistory({
      id: `${Date.now()}-${top.place.id}`,
      timestamp: Date.now(),
      preference: { mood, situation },
      placeId: top.place.id,
      placeName: top.place.name,
      kind: top.kind,
    });
  }, [result, mood, situation]);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.summary}>
        <Text style={[typography.label, styles.summaryLabel]}>
          Hledáme pro tebe
        </Text>
        <Text style={[typography.h2, styles.summaryTitle]}>
          {moodLabels[mood]} • {situationLabels[situation].toLowerCase()}
        </Text>
      </View>

      {result.recommendations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[typography.h3, styles.emptyTitle]}>
            Nic na tebe nesedí 😕
          </Text>
          <Text style={[typography.body, styles.emptyText]}>
            Zkus jinou kombinaci — třeba uvolni situaci na „Mám 30 minut".
          </Text>
        </View>
      ) : (
        result.recommendations.map((rec) => (
          <FoodCard
            key={rec.place.id}
            recommendation={rec}
            onPress={() => router.push(`/place/${rec.place.id}`)}
            onDetail={() => router.push(`/place/${rec.place.id}`)}
          />
        ))
      )}

      <View style={styles.actions}>
        <Button
          label="Vybrat znovu"
          variant="secondary"
          onPress={() => router.back()}
        />
        <Button
          label="Zpět na úvod"
          variant="ghost"
          size="md"
          onPress={() => router.replace('/')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  summary: {
    marginBottom: spacing.md,
  },
  summaryLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  empty: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.textPrimary,
  },
  emptyText: {
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});

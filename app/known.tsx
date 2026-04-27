import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, FoodCard, MoodChip, Screen } from '../src/components';
import { demoPlaces } from '../src/data/demoPlaces';
import { maybeLocalizeDemoPlaces } from '../src/lib/demoPlaceLocalizer';
import { loadHistory } from '../src/lib/history';
import {
  getRecentHistorySignals,
  type RecentHistorySignals,
} from '../src/lib/historySignals';
import { dietaryLabels, dietaryOrder } from '../src/lib/labels';
import {
  calculateDistanceMeters,
  getCachedLocation,
  type UserLocation,
} from '../src/lib/location';
import { isPlaceOpenNow } from '../src/lib/openingHours';
import {
  buildMenuItemReason,
  matchesDiet,
} from '../src/lib/recommendationEngine';
import { colors, radius, spacing, typography } from '../src/theme';
import type {
  DietaryPreference,
  MenuItem,
  Place,
  Recommendation,
} from '../src/types';

const QUICK_SUGGESTIONS = [
  'Pizza',
  'Nudle',
  'Polévka',
  'Sendvič',
  'Salát',
  'Burger',
  'Sladké',
];

const MAX_RESULTS = 6;
const SEARCH_RECENT_PLACE_PENALTY = -3;
const SEARCH_RECENT_ITEM_PENALTY = -5;

const DIACRITIC_RE = new RegExp('[\\u0300-\\u036f]', 'g');

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(DIACRITIC_RE, '').trim();
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(/[\s,;.+/]+/)
    .filter((t) => t.length >= 2);
}

interface ScoredItem {
  place: Place;
  item: MenuItem;
  score: number;
  distanceMeters: number | null;
}

function scoreSearchHit(
  place: Place,
  item: MenuItem,
  tokens: string[]
): number {
  if (tokens.length === 0) return 0;

  const itemName = normalize(item.name);
  const itemDesc = normalize(item.description);
  const itemTags = item.tags.map(normalize);
  const placeTags = place.tags.map(normalize);
  const placeCuisine = normalize(place.cuisine);
  const placeName = normalize(place.name);

  let total = 0;
  let anyHit = false;

  for (const token of tokens) {
    let hit = false;
    if (itemName.includes(token)) {
      total += 14;
      hit = true;
    }
    if (itemTags.some((t) => t.includes(token))) {
      total += 10;
      hit = true;
    }
    if (placeTags.some((t) => t.includes(token))) {
      total += 7;
      hit = true;
    }
    if (placeCuisine.includes(token)) {
      total += 8;
      hit = true;
    }
    if (itemDesc.includes(token)) {
      total += 4;
      hit = true;
    }
    if (placeName.includes(token)) {
      total += 5;
      hit = true;
    }
    if (hit) anyHit = true;
  }

  return anyHit ? total : 0;
}

function runSearch(
  query: string,
  diet: DietaryPreference,
  places: Place[],
  userLocation: UserLocation | null,
  recentSignals: RecentHistorySignals,
  now: Date
): ScoredItem[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const recentPlaceIds = new Set(recentSignals.recentPlaceIds);
  const recentItemNames = new Set(recentSignals.recentMenuItemNames);

  const hits: ScoredItem[] = [];
  for (const place of places) {
    if (!isPlaceOpenNow(place, now)) continue;
    const distance = userLocation
      ? calculateDistanceMeters(userLocation, place)
      : null;
    for (const item of place.menuItems) {
      if (!matchesDiet(item, diet)) continue;
      const base = scoreSearchHit(place, item, tokens);
      if (base <= 0) continue;
      let score = base;
      if (recentPlaceIds.has(place.id)) score += SEARCH_RECENT_PLACE_PENALTY;
      if (recentItemNames.has(item.name)) score += SEARCH_RECENT_ITEM_PENALTY;
      if (distance != null) {
        if (distance < 500) score += 4;
        else if (distance < 1500) score += 2;
        else if (distance > 5000) score -= 3;
      }
      hits.push({ place, item, score, distanceMeters: distance });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, MAX_RESULTS);
}

export default function KnownScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState<DietaryPreference>('any');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const userLocation = getCachedLocation();
  const [recentSignals, setRecentSignals] = useState<RecentHistorySignals>({
    recentPlaceIds: [],
    recentMenuItemNames: [],
    hasRecent: false,
  });

  useEffect(() => {
    let active = true;
    void loadHistory().then((items) => {
      if (active) setRecentSignals(getRecentHistorySignals(items));
    });
    return () => {
      active = false;
    };
  }, []);

  const places = useMemo(
    () => maybeLocalizeDemoPlaces(userLocation, demoPlaces).places,
    [userLocation]
  );

  const results = useMemo<ScoredItem[]>(() => {
    if (submittedQuery == null) return [];
    return runSearch(
      submittedQuery,
      diet,
      places,
      userLocation,
      recentSignals,
      new Date()
    );
  }, [submittedQuery, diet, places, userLocation, recentSignals]);

  const recommendations: Recommendation[] = useMemo(
    () =>
      results.map((r) => ({
        kind: 'match',
        place: r.place,
        menuItem: r.item,
        score: r.score,
        reason: buildMenuItemReason(r.item, 'search'),
        distanceMeters: r.distanceMeters ?? undefined,
      })),
    [results]
  );

  const submit = (text?: string) => {
    const value = (text ?? query).trim();
    if (value.length === 0) return;
    if (text !== undefined) setQuery(text);
    setSubmittedQuery(value);
  };

  const onSuggestion = (label: string) => {
    submit(label);
  };

  const openPlace = (placeId: string) => {
    router.push({
      pathname: '/place/[id]',
      params: { id: placeId, diet },
    });
  };

  const showResults = submittedQuery !== null;
  const isEmpty = showResults && recommendations.length === 0;

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[typography.h1, styles.title]}>Co by sis dal?</Text>
        <Text style={[typography.body, styles.lead]}>
          Napiš třeba pizza, nudle, polévka nebo sendvič.
        </Text>
      </View>

      <View style={styles.inputBlock}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => submit()}
          placeholder="Co máš chuť?"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          style={[typography.body, styles.input]}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsRow}
        >
          {QUICK_SUGGESTIONS.map((label) => (
            <Pressable
              key={label}
              onPress={() => onSuggestion(label)}
              style={({ pressed }) => [
                styles.suggestionChip,
                pressed && styles.suggestionPressed,
              ]}
            >
              <Text style={[typography.caption, styles.suggestionLabel]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.dietSection}>
        <Text style={[typography.h2, styles.dietHeading]}>Jak jíš?</Text>
        <View style={styles.dietRow}>
          {dietaryOrder.map((d) => (
            <MoodChip
              key={d}
              label={dietaryLabels[d]}
              selected={diet === d}
              onPress={() => setDiet(d)}
            />
          ))}
        </View>
      </View>

      <Button
        label="Najít možnosti"
        onPress={() => submit()}
        disabled={query.trim().length === 0}
      />

      {showResults && !isEmpty ? (
        <View style={styles.resultsBlock}>
          <Text style={[typography.caption, styles.resultsCaption]}>
            Tipy podle toho, co jsi napsal{query ? ` „${submittedQuery}"` : ''}.
          </Text>
          {recommendations.map((rec) => (
            <FoodCard
              key={`${rec.place.id}-${rec.menuItem?.id ?? 'x'}`}
              recommendation={rec}
              onPress={() => openPlace(rec.place.id)}
              onDetail={() => openPlace(rec.place.id)}
            />
          ))}
        </View>
      ) : null}

      {isEmpty ? (
        <View style={styles.empty}>
          <Text style={[typography.h3, styles.emptyTitle]}>
            Nic přesně nesedí
          </Text>
          <Text style={[typography.body, styles.emptyText]}>
            Tohle zatím v nabídce nemáme. Zkus jiné slovo, třeba nudle, polévka
            nebo salát.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
  },
  lead: {
    color: colors.textSecondary,
  },
  inputBlock: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    minHeight: 52,
  },
  suggestionsRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  suggestionChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionPressed: {
    opacity: 0.85,
  },
  suggestionLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dietSection: {
    gap: spacing.sm,
  },
  dietHeading: {
    color: colors.textPrimary,
  },
  dietRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  resultsBlock: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  resultsCaption: {
    color: colors.textSecondary,
  },
  empty: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    color: colors.textPrimary,
  },
  emptyText: {
    color: colors.textSecondary,
  },
});

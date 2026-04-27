import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, FoodCard, Screen } from '../src/components';
import { demoPlaces } from '../src/data/demoPlaces';
import { maybeLocalizeDemoPlaces } from '../src/lib/demoPlaceLocalizer';
import { appendHistory } from '../src/lib/history';
import { moodLabels, situationLabels } from '../src/lib/labels';
import {
  getCachedLocation,
  getCachedStatus,
  getCurrentLocation,
  setCachedLocation,
  type LocationStatus,
  type UserLocation,
} from '../src/lib/location';
import { recommend } from '../src/lib/recommendationEngine';
import { colors, radius, spacing, typography } from '../src/theme';
import type { DietaryPreference, Mood, Situation } from '../src/types';

const microcopyVariants = [
  'Dobře, zkusíme něco jiného.',
  'Jasně, ukážu ti další možnosti.',
  'OK, mrkneme na jiné tipy.',
];

const isMood = (v: string | undefined): v is Mood =>
  !!v &&
  ['warm', 'fast', 'light', 'cheap', 'healthy', 'sweet', 'any'].includes(v);

const isSituation = (v: string | undefined): v is Situation =>
  !!v &&
  ['now', '15min', '30min', 'sitdown', 'delivery', 'pickup'].includes(v);

const isDiet = (v: string | undefined): v is DietaryPreference =>
  !!v && ['any', 'vegetarian', 'vegan'].includes(v);

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mood?: string;
    situation?: string;
    diet?: string;
  }>();

  const mood: Mood = isMood(params.mood) ? params.mood : 'any';
  const situation: Situation = isSituation(params.situation)
    ? params.situation
    : 'now';
  const dietaryPreference: DietaryPreference = isDiet(params.diet)
    ? params.diet
    : 'any';

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [microcopy, setMicrocopy] = useState<string | null>(null);
  const microcopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyLogged = useRef(false);

  const [locationStatus, setLocationStatus] = useState<LocationStatus>(
    getCachedStatus()
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(
    getCachedLocation()
  );
  const [locationConfirmation, setLocationConfirmation] = useState<string | null>(
    null
  );
  const confirmationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { places: effectivePlaces, localized: isLocalizedDemo } = useMemo(
    () => maybeLocalizeDemoPlaces(userLocation, demoPlaces),
    [userLocation]
  );

  const result = useMemo(
    () =>
      recommend(
        { mood, situation, dietaryPreference },
        effectivePlaces,
        {
          excludePlaceIds: dismissedIds,
          userLocation,
        }
      ),
    [
      mood,
      situation,
      dietaryPreference,
      dismissedIds,
      userLocation,
      effectivePlaces,
    ]
  );

  useEffect(() => {
    if (historyLogged.current) return;
    const top = result.recommendations[0];
    if (!top) return;
    historyLogged.current = true;
    void appendHistory({
      id: `${Date.now()}-${top.place.id}`,
      timestamp: Date.now(),
      preference: { mood, situation, dietaryPreference },
      placeId: top.place.id,
      placeName: top.place.name,
      menuItemName: top.menuItem?.name,
      menuItemIsVegetarian: top.menuItem?.isVegetarian,
      menuItemIsVegan: top.menuItem?.isVegan,
      kind: top.kind,
    });
  }, [result, mood, situation, dietaryPreference]);

  useEffect(() => {
    return () => {
      if (microcopyTimer.current) clearTimeout(microcopyTimer.current);
      if (confirmationTimer.current) clearTimeout(confirmationTimer.current);
    };
  }, []);

  const handleDifferentTip = () => {
    const currentIds = result.recommendations.map((r) => r.place.id);
    if (currentIds.length === 0) return;
    setDismissedIds((prev) => {
      const merged = new Set([...prev, ...currentIds]);
      return Array.from(merged);
    });
    const variant =
      microcopyVariants[Math.floor(Math.random() * microcopyVariants.length)];
    setMicrocopy(variant);
    if (microcopyTimer.current) clearTimeout(microcopyTimer.current);
    microcopyTimer.current = setTimeout(() => setMicrocopy(null), 2500);
  };

  const handleReset = () => {
    setDismissedIds([]);
    setMicrocopy(null);
    if (microcopyTimer.current) clearTimeout(microcopyTimer.current);
  };

  const showConfirmation = (message: string) => {
    setLocationConfirmation(message);
    if (confirmationTimer.current) clearTimeout(confirmationTimer.current);
    confirmationTimer.current = setTimeout(
      () => setLocationConfirmation(null),
      4000
    );
  };

  const handleRequestLocation = async () => {
    setLocationStatus('loading');
    const { location, status } = await getCurrentLocation();
    setCachedLocation(location, status);
    setLocationStatus(status);
    setUserLocation(location);
    if (status === 'granted') {
      showConfirmation('Hotovo, seřadili jsme tipy podle blízkosti.');
    }
  };

  const handleRefreshLocation = async () => {
    setLocationStatus('loading');
    const { location, status } = await getCurrentLocation();
    setCachedLocation(location, status);
    setLocationStatus(status);
    setUserLocation(location);
    if (status === 'granted') {
      showConfirmation('Hotovo, tipy jsme seřadili podle aktuální polohy.');
    }
  };

  const handleOptOut = () => {
    setCachedLocation(null, 'opted_out');
    setLocationStatus('opted_out');
    setUserLocation(null);
    showConfirmation('Dobře, tipy můžeš používat i bez polohy.');
  };

  const hasMore = result.recommendations.length > 0;
  const everDismissed = dismissedIds.length > 0;

  const openPlace = (placeId: string) => {
    router.push({
      pathname: '/place/[id]',
      params: { id: placeId, mood, situation, diet: dietaryPreference },
    });
  };

  const locationButtonLabel =
    locationStatus === 'loading' ? 'Hledám tvou polohu…' : 'Najít bližší tipy';

  const showRationale =
    locationStatus === 'not_requested' || locationStatus === 'loading';

  const locationHint =
    locationStatus === 'denied'
      ? 'Nevadí, tipy můžeš používat i bez polohy.'
      : locationStatus === 'unavailable'
        ? 'Polohu se teď nepodařilo zjistit. Tipy fungují i bez ní.'
        : locationStatus === 'opted_out'
          ? 'Tipy teď řadíme bez polohy. Kdykoli ji můžeš zase zapnout.'
          : null;

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

      {locationStatus !== 'granted' ? (
        <View style={styles.locationCard}>
          {showRationale ? (
            <Text style={[typography.caption, styles.locationRationale]}>
              Polohu použijeme jen k tomu, abychom ti ukázali bližší možnosti.
            </Text>
          ) : null}
          <Button
            label={locationButtonLabel}
            variant="secondary"
            size="md"
            onPress={handleRequestLocation}
            disabled={locationStatus === 'loading'}
          />
          {locationHint ? (
            <Text style={[typography.caption, styles.locationHint]}>
              {locationHint}
            </Text>
          ) : null}
        </View>
      ) : null}

      {locationConfirmation ? (
        <View style={styles.locationConfirm}>
          <Text style={[typography.caption, styles.locationConfirmText]}>
            {locationConfirmation}
          </Text>
        </View>
      ) : null}

      {isLocalizedDemo && locationStatus === 'granted' ? (
        <Text style={[typography.caption, styles.demoNote]}>
          Testovací podniky jsou dočasně rozmístěné kolem tebe.
        </Text>
      ) : null}

      {microcopy ? (
        <View style={styles.microcopy}>
          <Text style={[typography.caption, styles.microcopyText]}>
            {microcopy}
          </Text>
        </View>
      ) : null}

      {result.scarce && hasMore ? (
        <View style={styles.scarceNote}>
          <Text style={[typography.caption, styles.scarceNoteText]}>
            Pro tuhle volbu máme méně tipů. Zkusíme ti ukázat nejbližší vhodné možnosti.
          </Text>
        </View>
      ) : null}

      {!hasMore ? (
        <View style={styles.empty}>
          <Text style={[typography.h3, styles.emptyTitle]}>
            {everDismissed
              ? 'Pro tuto chvíli jsme tipy vyčerpali'
              : dietaryPreference !== 'any'
                ? 'Pro tuhle volbu nemáme vhodný tip'
                : 'Nic na tebe nesedí 😕'}
          </Text>
          <Text style={[typography.body, styles.emptyText]}>
            {everDismissed
              ? 'Zkus se vrátit a zvolit jinou náladu nebo situaci.'
              : dietaryPreference !== 'any'
                ? 'Zkus jinou náladu nebo situaci, případně uvolni stravovací volbu.'
                : 'Zkus jinou kombinaci — třeba uvolni situaci na „Mám 30 minut".'}
          </Text>
        </View>
      ) : (
        result.recommendations.map((rec) => (
          <FoodCard
            key={rec.place.id}
            recommendation={rec}
            onPress={() => openPlace(rec.place.id)}
            onDetail={() => openPlace(rec.place.id)}
          />
        ))
      )}

      <View style={styles.actions}>
        {hasMore ? (
          <Button
            label="Dát mi jiný tip"
            variant="secondary"
            size="md"
            onPress={handleDifferentTip}
          />
        ) : null}
        {everDismissed ? (
          <Button
            label="Zpět na původní tipy"
            variant="ghost"
            size="md"
            onPress={handleReset}
          />
        ) : null}
        {locationStatus === 'granted' ? (
          <>
            <Button
              label="Aktualizovat polohu"
              variant="ghost"
              size="md"
              onPress={handleRefreshLocation}
            />
            <Button
              label="Používat bez polohy"
              variant="ghost"
              size="md"
              onPress={handleOptOut}
            />
          </>
        ) : null}
        <Button
          label="Vybrat znovu"
          variant="ghost"
          size="md"
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
  microcopy: {
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  microcopyText: {
    color: colors.textSecondary,
  },
  locationCard: {
    gap: spacing.sm,
  },
  locationRationale: {
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  locationHint: {
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  locationConfirm: {
    backgroundColor: colors.successSoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  locationConfirmText: {
    color: colors.textPrimary,
  },
  demoNote: {
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
    fontStyle: 'italic',
  },
  scarceNote: {
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  scarceNoteText: {
    color: colors.textSecondary,
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../../src/components';
import { demoPlaces } from '../../src/data/demoPlaces';
import { maybeLocalizeDemoPlaces } from '../../src/lib/demoPlaceLocalizer';
import { formatPriceLevel } from '../../src/lib/labels';
import {
  calculateDistanceMeters,
  formatDistance,
  getCachedLocation,
} from '../../src/lib/location';
import {
  getOpenStatus,
  getTodayHoursLabel,
} from '../../src/lib/openingHours';
import {
  buildMenuItemReason,
  pickMenuItems,
} from '../../src/lib/recommendationEngine';
import { colors, radius, spacing, typography } from '../../src/theme';
import type {
  DietaryPreference,
  MenuItem,
  Mood,
  Place,
  Situation,
} from '../../src/types';

const serviceLabel: Record<string, string> = {
  sitdown: 'Posezení',
  pickup: 'Vyzvednutí',
  delivery: 'Rozvoz',
};

const ALLERGEN_SAFETY_NOTE =
  'Informace zadává podnik. Při alergii nebo celiakii se raději zeptej obsluhy.';

const glutenInfoLabel: Record<'by_ingredients' | 'celiac_confirmed', string> = {
  by_ingredients: 'Bez lepku podle surovin',
  celiac_confirmed: 'Podnik uvádí oddělenou přípravu',
};

function buildNavigationUrl(place: Place): string {
  if (place.latitude != null && place.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  }
  const trimmedAddress = place.address?.trim();
  if (trimmedAddress) {
    const destination = encodeURIComponent(`${place.name}, ${trimmedAddress}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
}

function instagramUrl(handle: string): string {
  const clean = handle.replace(/^@/, '').trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  return `https://instagram.com/${clean}`;
}

function telUrl(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

function openExternal(url: string) {
  void Linking.openURL(url).catch(() => {});
}

const isMood = (v: string | undefined): v is Mood =>
  !!v &&
  ['warm', 'fast', 'light', 'cheap', 'healthy', 'sweet', 'any'].includes(v);

const isSituation = (v: string | undefined): v is Situation =>
  !!v &&
  ['now', '15min', '30min', 'sitdown', 'delivery', 'pickup'].includes(v);

const isDiet = (v: string | undefined): v is DietaryPreference =>
  !!v && ['any', 'vegetarian', 'vegan'].includes(v);

function parseMoodList(
  raw: string | undefined,
  fallback: Mood
): Mood[] {
  if (!raw) return [fallback];
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is Mood => isMood(s));
  if (parts.length === 0) return [fallback];
  return parts.slice(0, 2);
}

function parseSituationList(
  raw: string | undefined,
  fallback: Situation
): Situation[] {
  if (!raw) return [fallback];
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is Situation => isSituation(s));
  if (parts.length === 0) return [fallback];
  return parts.slice(0, 2);
}

export default function PlaceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    mood?: string;
    moods?: string;
    situation?: string;
    situations?: string;
    diet?: string;
  }>();

  const mood: Mood = isMood(params.mood) ? params.mood : 'any';
  const moods: Mood[] = parseMoodList(params.moods, mood);
  const situation: Situation = isSituation(params.situation)
    ? params.situation
    : 'now';
  const situations: Situation[] = parseSituationList(
    params.situations,
    situation
  );
  const dietaryPreference: DietaryPreference = isDiet(params.diet)
    ? params.diet
    : 'any';

  const cachedLocation = getCachedLocation();
  const place = useMemo(() => {
    const { places } = maybeLocalizeDemoPlaces(cachedLocation, demoPlaces);
    return places.find((p) => p.id === params.id);
  }, [cachedLocation, params.id]);

  const moodsKey = moods.join(',');
  const situationsKey = situations.join(',');
  const recommendedItems = useMemo(
    () =>
      place
        ? pickMenuItems(
            place,
            { mood, moods, situation, situations, dietaryPreference },
            3
          )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [place, mood, moodsKey, situation, situationsKey, dietaryPreference]
  );
  const openStatus = useMemo(
    () => (place ? getOpenStatus(place) : null),
    [place]
  );
  const todayHours = useMemo(
    () => (place ? getTodayHoursLabel(place) : ''),
    [place]
  );
  const distanceLabel = useMemo(() => {
    if (!place) return null;
    if (!cachedLocation) return null;
    const meters = calculateDistanceMeters(cachedLocation, place);
    return meters != null ? formatDistance(meters) : null;
  }, [place, cachedLocation]);

  const remainingMenuItems = useMemo(() => {
    if (!place) return [] as MenuItem[];
    const tipIds = new Set(recommendedItems.map((it) => it.id));
    return place.menuItems.filter((it) => !tipIds.has(it.id));
  }, [place, recommendedItems]);

  const [showFullMenu, setShowFullMenu] = useState(false);

  if (!place) {
    return (
      <Screen>
        <Text style={[typography.h2, { color: colors.textPrimary }]}>
          Místo nenalezeno
        </Text>
        <Button label="Zpět" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      <View>
        <Text style={[typography.h1, styles.name]}>{place.name}</Text>
        <Text style={[typography.body, styles.cuisine]}>{place.cuisine}</Text>
      </View>

      <View
        style={[
          styles.statusPill,
          openStatus?.open ? styles.statusOpen : styles.statusClosed,
        ]}
      >
        <Text style={styles.statusText}>
          {openStatus?.label ?? 'Otevírací doba neznámá'}
        </Text>
      </View>

      <Button
        label="Navigovat"
        onPress={() => openExternal(buildNavigationUrl(place))}
      />

      <View style={styles.card}>
        <Text style={[typography.label, styles.cardLabel]}>Otevírací doba dnes</Text>
        <Text style={[typography.body, styles.cardValue]}>{todayHours}</Text>
      </View>

      <View style={styles.metaGrid}>
        <Meta label="Příprava" value={`~${place.prepMinutes} min`} />
        <Meta label="Cena" value={formatPriceLevel(place.priceLevel)} />
        <Meta label="Hodnocení" value={`★ ${place.rating.toFixed(1)}`} />
      </View>

      {distanceLabel ? (
        <View style={styles.card}>
          <Text style={[typography.label, styles.cardLabel]}>Vzdálenost</Text>
          <Text style={[typography.body, styles.cardValue]}>
            {distanceLabel} od tebe
          </Text>
        </View>
      ) : null}

      {recommendedItems.length > 0 ? (
        <View style={styles.menuSection}>
          <Text style={[typography.h2, styles.menuHeading]}>
            Co si dát tady?
          </Text>
          <Text style={[typography.caption, styles.menuSub]}>
            Tři tipy z menu na míru.
          </Text>
          {recommendedItems.map((it) => (
            <MenuItemRow
              key={it.id}
              item={it}
              reason={buildMenuItemReason(it, 'detail')}
            />
          ))}
        </View>
      ) : null}

      {remainingMenuItems.length > 0 ? (
        <View style={styles.menuSection}>
          <Button
            label={showFullMenu ? 'Skrýt celou nabídku' : 'Zobrazit celou nabídku'}
            variant="secondary"
            size="md"
            onPress={() => setShowFullMenu((v) => !v)}
          />
          {showFullMenu ? (
            <View style={styles.fullMenuList}>
              <Text style={[typography.caption, styles.menuSub]}>
                Další položky z menu.
              </Text>
              {remainingMenuItems.map((it) => (
                <MenuItemRow key={it.id} item={it} reason={null} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {place.website || place.instagram || place.phone ? (
        <View style={styles.card}>
          <Text style={[typography.label, styles.cardLabel]}>Odkazy</Text>
          <View style={styles.linksColumn}>
            {place.website ? (
              <LinkRow
                label="Web"
                onPress={() => openExternal(place.website as string)}
              />
            ) : null}
            {place.instagram ? (
              <LinkRow
                label="Instagram"
                onPress={() =>
                  openExternal(instagramUrl(place.instagram as string))
                }
              />
            ) : null}
            {place.phone ? (
              <LinkRow
                label="Zavolat"
                onPress={() => openExternal(telUrl(place.phone as string))}
              />
            ) : null}
            <LinkRow
              label="Mapa / Navigace"
              onPress={() => openExternal(buildNavigationUrl(place))}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={[typography.label, styles.cardLabel]}>Adresa</Text>
        <Text style={[typography.body, styles.cardValue]}>{place.address}</Text>
      </View>

      <View style={styles.card}>
        <Text style={[typography.label, styles.cardLabel]}>O místě</Text>
        <Text style={[typography.body, styles.cardValue]}>
          {place.description}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={[typography.label, styles.cardLabel]}>Obsluha</Text>
        <View style={styles.chipsRow}>
          {place.services.map((s) => (
            <View key={s} style={styles.tagPill}>
              <Text style={styles.tagText}>{serviceLabel[s] ?? s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[typography.label, styles.cardLabel]}>Tagy</Text>
        <View style={styles.chipsRow}>
          {place.tags.map((t) => (
            <View key={t} style={styles.tagPill}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button label="Zpět" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={[typography.caption, styles.metaLabel]}>{label}</Text>
      <Text style={[typography.bodyStrong, styles.metaValue]}>{value}</Text>
    </View>
  );
}

function LinkRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
    >
      <Text style={[typography.body, styles.linkText]}>{label}</Text>
      <Text style={styles.linkChevron}>›</Text>
    </Pressable>
  );
}

function MenuItemRow({
  item,
  reason,
}: {
  item: MenuItem;
  reason: string | null;
}) {
  const gluten =
    item.glutenInfo && item.glutenInfo !== 'not_set'
      ? glutenInfoLabel[item.glutenInfo]
      : null;
  const hasAllergenInfo =
    (item.ingredients && item.ingredients.length > 0) ||
    (item.containsAllergens && item.containsAllergens.length > 0) ||
    (item.mayContainAllergens && item.mayContainAllergens.length > 0) ||
    !!gluten;
  return (
    <View style={styles.itemCard}>
      <Text style={[typography.h3, styles.itemName]}>{item.name}</Text>
      <Text style={[typography.body, styles.itemDesc]}>{item.description}</Text>
      <View style={styles.itemMetaRow}>
        <View style={styles.itemMeta}>
          <Text style={styles.itemMetaIcon}>⏱</Text>
          <Text style={[typography.caption, styles.itemMetaText]}>
            ~{item.preparationMinutes} min
          </Text>
        </View>
        <View style={styles.itemMeta}>
          <Text style={styles.itemMetaIcon}>💸</Text>
          <Text style={[typography.caption, styles.itemMetaText]}>
            {formatPriceLevel(item.priceLevel)}
          </Text>
        </View>
        {item.isVegan ? (
          <View style={styles.dietPill}>
            <Text style={styles.dietText}>Vegan</Text>
          </View>
        ) : item.isVegetarian ? (
          <View style={styles.dietPill}>
            <Text style={styles.dietText}>Vege</Text>
          </View>
        ) : null}
        {gluten ? (
          <View style={styles.glutenPill}>
            <Text style={styles.glutenText}>{gluten}</Text>
          </View>
        ) : null}
      </View>
      {item.ingredients && item.ingredients.length > 0 ? (
        <View style={styles.itemDetailBlock}>
          <Text style={[typography.label, styles.itemDetailLabel]}>
            Ingredience
          </Text>
          <Text style={[typography.body, styles.itemDetailValue]}>
            {item.ingredients.join(', ')}
          </Text>
        </View>
      ) : null}
      {item.containsAllergens && item.containsAllergens.length > 0 ? (
        <View style={styles.itemDetailBlock}>
          <Text style={[typography.label, styles.itemDetailLabel]}>
            Obsahuje alergeny
          </Text>
          <Text style={[typography.body, styles.itemDetailValue]}>
            {item.containsAllergens.join(', ')}
          </Text>
        </View>
      ) : null}
      {item.mayContainAllergens && item.mayContainAllergens.length > 0 ? (
        <View style={styles.itemDetailBlock}>
          <Text style={[typography.label, styles.itemDetailLabel]}>
            Může obsahovat stopy
          </Text>
          <Text style={[typography.body, styles.itemDetailValue]}>
            {item.mayContainAllergens.join(', ')}
          </Text>
        </View>
      ) : null}
      {item.chefNote ? (
        <View style={styles.chefNoteBox}>
          <Text style={[typography.label, styles.chefNoteLabel]}>
            Poznámka kuchaře
          </Text>
          <Text style={[typography.body, styles.chefNoteText]}>
            {item.chefNote}
          </Text>
        </View>
      ) : null}
      {hasAllergenInfo ? (
        <Text style={[typography.caption, styles.allergenNote]}>
          {ALLERGEN_SAFETY_NOTE}
        </Text>
      ) : null}
      {reason ? (
        <View style={styles.itemReasonBox}>
          <Text style={[typography.caption, styles.itemReason]}>{reason}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  name: {
    color: colors.textPrimary,
  },
  cuisine: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  statusOpen: {
    backgroundColor: colors.successSoft,
  },
  statusClosed: {
    backgroundColor: colors.surfaceMuted,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 13,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: colors.textPrimary,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaCell: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaLabel: {
    color: colors.textMuted,
  },
  metaValue: {
    color: colors.textPrimary,
  },
  menuSection: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  menuHeading: {
    color: colors.textPrimary,
  },
  menuSub: {
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  itemName: {
    color: colors.textPrimary,
  },
  itemDesc: {
    color: colors.textSecondary,
  },
  itemMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.lg,
    rowGap: spacing.sm,
    marginTop: spacing.xs,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemMetaIcon: {
    fontSize: 14,
  },
  itemMetaText: {
    color: colors.textSecondary,
  },
  dietPill: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  dietText: {
    color: '#3F6212',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemReasonBox: {
    marginTop: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  itemReason: {
    color: colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
  },
  tagText: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 13,
  },
  glutenPill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  glutenText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemDetailBlock: {
    marginTop: spacing.xs,
    gap: 2,
  },
  itemDetailLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  itemDetailValue: {
    color: colors.textPrimary,
  },
  chefNoteBox: {
    marginTop: spacing.xs,
    backgroundColor: colors.primarySoft,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: 2,
  },
  chefNoteLabel: {
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  chefNoteText: {
    color: colors.textPrimary,
  },
  allergenNote: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  fullMenuList: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  linksColumn: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
  linkRowPressed: {
    opacity: 0.7,
  },
  linkText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  linkChevron: {
    color: colors.textMuted,
    fontSize: 22,
    lineHeight: 22,
  },
});

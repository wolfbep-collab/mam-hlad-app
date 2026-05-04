import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, MoodChip, Screen } from '../src/components';
import { dietaryLabels, dietaryOrder } from '../src/lib/labels';
import {
  formatDistance,
  getCachedLocation,
  getCachedStatus,
  getCurrentLocation,
  setCachedLocation,
  type LocationStatus,
  type UserLocation,
} from '../src/lib/location';
import {
  formatCheckInTime,
  formatRemainingHours,
  getActiveStreetFoodVendors,
  loadLocalCheckIns,
  selectFeaturedMenu,
  streetFoodCategoryEmoji,
} from '../src/lib/streetFood';
import { colors, radius, spacing, typography } from '../src/theme';
import type {
  ActiveStreetFoodVendor,
  DietaryPreference,
  StreetFoodCheckIn,
  StreetFoodMenuItem,
} from '../src/types';

export default function StreetFoodScreen() {
  const router = useRouter();
  const [diet, setDiet] = useState<DietaryPreference>('any');
  const [localCheckIns, setLocalCheckIns] = useState<StreetFoodCheckIn[]>([]);
  const [now, setNow] = useState<Date>(() => new Date());
  const [userLocation, setUserLocation] = useState<UserLocation | null>(() =>
    getCachedLocation()
  );
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(() =>
    getCachedStatus()
  );

  useEffect(() => {
    let active = true;
    void loadLocalCheckIns().then((items) => {
      if (active) setLocalCheckIns(items);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleRequestLocation = async () => {
    setLocationStatus('loading');
    const { location, status } = await getCurrentLocation();
    setCachedLocation(location, status);
    setLocationStatus(status);
    setUserLocation(location);
  };

  const vendors = useMemo<ActiveStreetFoodVendor[]>(
    () =>
      getActiveStreetFoodVendors({
        now,
        userLocation,
        localCheckIns,
        diet,
      }),
    [now, userLocation, localCheckIns, diet]
  );

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[typography.h1, styles.title]}>Street food dnes</Text>
        <Text style={[typography.body, styles.lead]}>
          Mobilní stánky a dobroty, které jsou dnes poblíž.
        </Text>
      </View>

      <View style={styles.dietSection}>
        <Text style={[typography.h3, styles.dietHeading]}>Jak jíš?</Text>
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

      {!userLocation && locationStatus !== 'denied' ? (
        <Pressable
          onPress={handleRequestLocation}
          disabled={locationStatus === 'loading'}
          style={({ pressed }) => [
            styles.locationBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
        >
          <Text style={[typography.bodyStrong, styles.locationBtnText]}>
            {locationStatus === 'loading'
              ? 'Hledám tvou polohu…'
              : '📍 Použít polohu'}
          </Text>
          <Text style={[typography.caption, styles.locationBtnHint]}>
            Seřadíme stánky podle vzdálenosti.
          </Text>
        </Pressable>
      ) : null}

      {vendors.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[typography.h3, styles.emptyTitle]}>
            {diet === 'any'
              ? 'Teď tu nikdo není'
              : 'Pro tuhle volbu dnes nemáme žádný aktivní stánek.'}
          </Text>
          <Text style={[typography.body, styles.emptyText]}>
            {diet === 'any'
              ? 'Zkus to později — stánky se v průběhu dne mění. Můžeš si zatím dát tip přes „Mám hlad" nebo „Vím, co si dát".'
              : 'Zkus změnit dietní volbu — třeba „Vegetariánsky" nebo „Jím všechno".'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          <Text
            style={[typography.caption, styles.countCaption]}
            key={`count-${diet}-${vendors.length}`}
          >
            {countCaption(diet, vendors.length)}
          </Text>
          {vendors.map((v) => (
            <VendorCard
              key={v.vendor.id}
              entry={v}
              now={now}
              diet={diet}
              onOpen={() =>
                router.push({
                  pathname: '/street-food/[id]',
                  params: { id: v.vendor.id, diet },
                })
              }
            />
          ))}
        </View>
      )}

      <Pressable
        onPress={() => router.push('/vendor-checkin')}
        style={({ pressed }) => [
          styles.vendorLink,
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="link"
      >
        <Text style={[typography.bodyStrong, styles.vendorLinkText]}>
          Mám stánek →
        </Text>
        <Text style={[typography.caption, styles.vendorLinkHint]}>
          Ukaž lidem, kde dnes prodáváš.
        </Text>
      </Pressable>
    </Screen>
  );
}

interface VendorCardProps {
  entry: ActiveStreetFoodVendor;
  now: Date;
  diet: DietaryPreference;
  onOpen: () => void;
}

function countCaption(diet: DietaryPreference, count: number): string {
  const noun = pluralStanky(count);
  if (diet === 'vegan') return `Dnes je tu ${count} ${noun} s vegan nabídkou.`;
  if (diet === 'vegetarian')
    return `Dnes je tu ${count} ${noun} s vegetariánskou nabídkou.`;
  const adj = count >= 5 ? 'aktivních' : 'aktivní';
  return `Dnes je tu ${count} ${adj} ${noun}.`;
}

function pluralStanky(count: number): string {
  if (count === 1) return 'stánek';
  if (count >= 2 && count <= 4) return 'stánky';
  return 'stánků';
}

function pluralPolozky(count: number): string {
  if (count === 1) return 'položka';
  if (count >= 2 && count <= 4) return 'položky';
  return 'položek';
}

function vegetarianAdj(count: number): string {
  if (count === 1) return 'vegetariánská';
  if (count >= 2 && count <= 4) return 'vegetariánské';
  return 'vegetariánských';
}

function dietMenuHeading(
  diet: DietaryPreference,
  count: number
): string | null {
  if (diet === 'any' || count === 0) return null;
  const noun = pluralPolozky(count);
  if (diet === 'vegan') return `${count} vegan ${noun} z menu`;
  return `${count} ${vegetarianAdj(count)} ${noun} z menu`;
}

function VendorCard({ entry, now, diet, onOpen }: VendorCardProps) {
  const { vendor, checkIn, distanceMeters } = entry;
  const featured: StreetFoodMenuItem[] = selectFeaturedMenu(vendor, diet);
  const emoji = streetFoodCategoryEmoji[vendor.category];
  const timeLabel = formatCheckInTime(checkIn, now);
  const remaining = formatRemainingHours(checkIn, now);
  const dietHeading = dietMenuHeading(diet, featured.length);

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      accessibilityLabel={`Otevřít detail stánku ${vendor.name}`}
    >
      <View style={styles.cardHead}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <View style={styles.cardHeadText}>
          <Text style={[typography.h2, styles.vendorName]} numberOfLines={2}>
            {vendor.name}
          </Text>
          <Text style={[typography.caption, styles.vendorDesc]} numberOfLines={2}>
            {vendor.description}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>📍 {checkIn.locationLabel}</Text>
        </View>
        {distanceMeters != null ? (
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>
              {formatDistance(distanceMeters)}
            </Text>
          </View>
        ) : null}
        <View style={[styles.metaPill, styles.timePill]}>
          <Text style={[styles.metaPillText, styles.timePillText]}>
            ⏱ {timeLabel}
            {remaining ? ` · ${remaining}` : ''}
          </Text>
        </View>
      </View>

      {checkIn.note ? (
        <View style={styles.noteBox}>
          <Text style={[typography.body, styles.noteText]}>“{checkIn.note}”</Text>
        </View>
      ) : null}

      <View style={styles.menuList}>
        {dietHeading ? (
          <Text style={[typography.caption, styles.menuHeading]}>
            {dietHeading}
          </Text>
        ) : null}
        {featured.map((item) => (
          <View key={item.id} style={styles.menuRow}>
            <View style={styles.menuTextBlock}>
              <Text style={[typography.bodyStrong, styles.menuName]}>
                {item.name}
              </Text>
              <Text style={[typography.caption, styles.menuDesc]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            {item.isVegan ? (
              <View style={styles.dietPill}>
                <Text style={styles.dietPillText}>Vegan</Text>
              </View>
            ) : item.isVegetarian ? (
              <View style={styles.dietPill}>
                <Text style={styles.dietPillText}>Vege</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.openRow}>
        <Text style={[typography.bodyStrong, styles.openLabel]}>
          Otevřít stánek →
        </Text>
      </View>
    </Pressable>
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
  list: {
    gap: spacing.lg,
  },
  countCaption: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  menuHeading: {
    color: colors.primaryDark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardHeadText: {
    flex: 1,
    gap: spacing.xs,
  },
  vendorName: {
    color: colors.textPrimary,
  },
  vendorDesc: {
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaPill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timePill: {
    backgroundColor: colors.successSoft,
  },
  timePillText: {
    color: '#3F6212',
  },
  noteBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  noteText: {
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  menuList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  menuTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  menuName: {
    color: colors.textPrimary,
  },
  menuDesc: {
    color: colors.textSecondary,
  },
  dietPill: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  dietPillText: {
    color: '#3F6212',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  empty: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
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
  locationBtn: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  locationBtnText: {
    color: colors.primaryDark,
  },
  locationBtnHint: {
    color: colors.textSecondary,
  },
  openRow: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  openLabel: {
    color: colors.primaryDark,
  },
  vendorLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2,
    marginTop: spacing.sm,
  },
  vendorLinkText: {
    color: colors.primaryDark,
  },
  vendorLinkHint: {
    color: colors.textMuted,
  },
});

import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MoodChip, Screen } from '../src/components';
import { dietaryLabels, dietaryOrder } from '../src/lib/labels';
import { formatDistance, getCachedLocation } from '../src/lib/location';
import {
  filterVendorMenuByDiet,
  formatCheckInTime,
  formatRemainingHours,
  getActiveStreetFoodVendors,
  loadLocalCheckIns,
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

  const userLocation = getCachedLocation();

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

      {vendors.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[typography.h3, styles.emptyTitle]}>
            Teď tu nikdo není
          </Text>
          <Text style={[typography.body, styles.emptyText]}>
            Zkus to později — stánky se v průběhu dne mění. Můžeš si zatím dát
            tip přes „Mám hlad" nebo „Vím, co si dát".
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {vendors.map((v) => (
            <VendorCard
              key={v.vendor.id}
              entry={v}
              now={now}
              diet={diet}
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
        <Text style={[typography.caption, styles.vendorLinkText]}>
          Jste prodejce? Demo check-in →
        </Text>
      </Pressable>
    </Screen>
  );
}

interface VendorCardProps {
  entry: ActiveStreetFoodVendor;
  now: Date;
  diet: DietaryPreference;
}

function VendorCard({ entry, now, diet }: VendorCardProps) {
  const { vendor, checkIn, distanceMeters } = entry;
  const dietItems = filterVendorMenuByDiet(vendor, diet);
  const featured: StreetFoodMenuItem[] = (
    dietItems.length > 0 ? dietItems : vendor.menuItems
  ).slice(0, 2);
  const emoji = streetFoodCategoryEmoji[vendor.category];
  const timeLabel = formatCheckInTime(checkIn, now);
  const remaining = formatRemainingHours(checkIn, now);

  return (
    <View style={styles.card}>
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
                <Text style={styles.dietPillText}>Vegetariánské</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
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
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuTextBlock: {
    flex: 1,
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
  vendorLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  vendorLinkText: {
    color: colors.textMuted,
  },
});

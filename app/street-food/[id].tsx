import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../../src/components';
import { demoStreetFoodVendors } from '../../src/data/demoStreetFood';
import { dietaryLabels, formatPriceLevel } from '../../src/lib/labels';
import {
  formatDistance,
  getCachedLocation,
  calculateDistanceMeters,
} from '../../src/lib/location';
import {
  filterVendorMenuByDiet,
  formatCheckInTime,
  formatRemainingHours,
  getActiveStreetFoodVendors,
  loadLocalCheckIns,
  streetFoodCategoryEmoji,
} from '../../src/lib/streetFood';
import { colors, radius, spacing, typography } from '../../src/theme';
import type {
  ActiveStreetFoodVendor,
  DietaryPreference,
  StreetFoodCheckIn,
  StreetFoodMenuItem,
} from '../../src/types';

const isDiet = (v: string | undefined): v is DietaryPreference =>
  !!v && ['any', 'vegetarian', 'vegan'].includes(v);

export default function StreetFoodDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; diet?: string }>();
  const diet: DietaryPreference = isDiet(params.diet) ? params.diet : 'any';

  const [now, setNow] = useState<Date>(() => new Date());
  const [localCheckIns, setLocalCheckIns] = useState<StreetFoodCheckIn[]>([]);

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

  const vendor = useMemo(
    () => demoStreetFoodVendors.find((v) => v.id === params.id),
    [params.id]
  );

  const active: ActiveStreetFoodVendor | null = useMemo(() => {
    if (!vendor) return null;
    const list = getActiveStreetFoodVendors({
      now,
      userLocation,
      localCheckIns,
      diet: 'any',
    });
    return list.find((entry) => entry.vendor.id === vendor.id) ?? null;
  }, [vendor, now, userLocation, localCheckIns]);

  const distanceMeters = useMemo(() => {
    if (active?.distanceMeters != null) return active.distanceMeters;
    if (!active || !userLocation) return null;
    return calculateDistanceMeters(userLocation, {
      latitude: active.checkIn.latitude,
      longitude: active.checkIn.longitude,
    });
  }, [active, userLocation]);

  if (!vendor) {
    return (
      <Screen>
        <Text style={[typography.h2, { color: colors.textPrimary }]}>
          Stánek nenalezen
        </Text>
        <Button label="Zpět" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const filteredMenu: StreetFoodMenuItem[] = filterVendorMenuByDiet(vendor, diet);
  const emoji = streetFoodCategoryEmoji[vendor.category];

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>{emoji}</Text>
        <Text style={[typography.h1, styles.name]}>{vendor.name}</Text>
        <Text style={[typography.body, styles.description]}>
          {vendor.description}
        </Text>
      </View>

      {active ? (
        <View style={styles.statusCard}>
          <Text style={[typography.label, styles.cardLabel]}>Dnes tady</Text>
          <Text style={[typography.bodyStrong, styles.cardValue]}>
            📍 {active.checkIn.locationLabel}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.metaPill, styles.timePill]}>
              <Text style={[styles.metaPillText, styles.timePillText]}>
                ⏱ {formatCheckInTime(active.checkIn, now)}
                {formatRemainingHours(active.checkIn, now)
                  ? ` · ${formatRemainingHours(active.checkIn, now)}`
                  : ''}
              </Text>
            </View>
            {distanceMeters != null ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>
                  {formatDistance(distanceMeters)}
                </Text>
              </View>
            ) : null}
          </View>
          {active.checkIn.note ? (
            <View style={styles.noteBox}>
              <Text style={[typography.body, styles.noteText]}>
                “{active.checkIn.note}”
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.statusCard}>
          <Text style={[typography.label, styles.cardLabel]}>Dnes tady</Text>
          <Text style={[typography.body, styles.cardValue]}>
            Tenhle stánek teď nemá aktivní check-in.
          </Text>
        </View>
      )}

      {vendor.tags.length > 0 ? (
        <View style={styles.tagBlock}>
          <Text style={[typography.label, styles.cardLabel]}>Co dělají</Text>
          <View style={styles.tagsRow}>
            {vendor.tags.map((t) => (
              <View key={t} style={styles.tagPill}>
                <Text style={styles.tagText}>#{t}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.menuSection}>
        <Text style={[typography.h2, styles.menuHeading]}>
          {diet === 'any'
            ? 'Menu'
            : diet === 'vegan'
              ? 'Vegan menu'
              : 'Vegetariánské menu'}
        </Text>
        {diet !== 'any' ? (
          <Text style={[typography.caption, styles.menuSub]}>
            Filtrováno podle volby „{dietaryLabels[diet]}".
          </Text>
        ) : null}

        {filteredMenu.length === 0 ? (
          <View style={styles.emptyMenu}>
            <Text style={[typography.body, styles.emptyMenuText]}>
              Pro tuhle volbu zatím tenhle stánek nic nemá.
            </Text>
          </View>
        ) : (
          filteredMenu.map((item) => (
            <View key={item.id} style={styles.menuRow}>
              <View style={styles.menuTextBlock}>
                <Text style={[typography.bodyStrong, styles.menuName]}>
                  {item.name}
                </Text>
                <Text style={[typography.caption, styles.menuDesc]}>
                  {item.description}
                </Text>
                <View style={styles.menuMetaRow}>
                  <Text style={[typography.caption, styles.menuMeta]}>
                    ⏱ ~{item.preparationMinutes} min
                  </Text>
                  <Text style={[typography.caption, styles.menuMeta]}>
                    💸 {formatPriceLevel(item.priceLevel)}
                  </Text>
                </View>
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
          ))
        )}
      </View>

      {vendor.instagram || vendor.website || vendor.contactLabel ? (
        <View style={styles.contactBlock}>
          <Text style={[typography.label, styles.cardLabel]}>Kontakt</Text>
          {vendor.contactLabel ? (
            <Text style={[typography.body, styles.cardValue]}>
              {vendor.contactLabel}
            </Text>
          ) : null}
          {vendor.instagram ? (
            <Text style={[typography.body, styles.cardValue]}>
              {vendor.instagram}
            </Text>
          ) : null}
          {vendor.website ? (
            <Pressable
              onPress={() => {
                if (vendor.website) {
                  void Linking.openURL(vendor.website);
                }
              }}
            >
              <Text style={[typography.body, styles.linkValue]}>
                {vendor.website}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Button label="Zpět" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  headerEmoji: {
    fontSize: 40,
  },
  name: {
    color: colors.textPrimary,
  },
  description: {
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardValue: {
    color: colors.textPrimary,
  },
  linkValue: {
    color: colors.primaryDark,
    textDecorationLine: 'underline',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
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
    marginTop: spacing.xs,
  },
  noteText: {
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  tagBlock: {
    gap: spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  menuSection: {
    gap: spacing.sm,
  },
  menuHeading: {
    color: colors.textPrimary,
  },
  menuSub: {
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  menuTextBlock: {
    flex: 1,
    gap: 4,
  },
  menuName: {
    color: colors.textPrimary,
  },
  menuDesc: {
    color: colors.textSecondary,
  },
  menuMetaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  menuMeta: {
    color: colors.textMuted,
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
  emptyMenu: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  emptyMenuText: {
    color: colors.textSecondary,
  },
  contactBlock: {
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

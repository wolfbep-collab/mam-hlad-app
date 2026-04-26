import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../../src/components';
import { demoPlaces } from '../../src/data/demoPlaces';
import { priceLabel } from '../../src/lib/labels';
import {
  buildMenuItemReason,
  pickMenuItems,
} from '../../src/lib/recommendationEngine';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { MenuItem, Mood, Situation } from '../../src/types';

const serviceLabel: Record<string, string> = {
  sitdown: 'Posezení',
  pickup: 'Vyzvednutí',
  delivery: 'Rozvoz',
};

const isMood = (v: string | undefined): v is Mood =>
  !!v &&
  ['warm', 'fast', 'light', 'cheap', 'healthy', 'sweet', 'any'].includes(v);

const isSituation = (v: string | undefined): v is Situation =>
  !!v &&
  ['now', '15min', '30min', 'sitdown', 'delivery', 'pickup'].includes(v);

export default function PlaceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    mood?: string;
    situation?: string;
  }>();

  const mood: Mood = isMood(params.mood) ? params.mood : 'any';
  const situation: Situation = isSituation(params.situation)
    ? params.situation
    : 'now';

  const place = demoPlaces.find((p) => p.id === params.id);

  const recommendedItems = useMemo(
    () => (place ? pickMenuItems(place, { mood, situation }, 3) : []),
    [place, mood, situation]
  );

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
          place.openNow ? styles.statusOpen : styles.statusClosed,
        ]}
      >
        <Text style={styles.statusText}>
          {place.openNow ? '● Otevřeno' : '● Zavřeno'} • {place.hoursLabel}
        </Text>
      </View>

      <View style={styles.metaGrid}>
        <Meta label="Příprava" value={`~${place.prepMinutes} min`} />
        <Meta label="Cena" value={priceLabel(place.priceLevel)} />
        <Meta label="Hodnocení" value={`★ ${place.rating.toFixed(1)}`} />
      </View>

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

function MenuItemRow({ item, reason }: { item: MenuItem; reason: string }) {
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
            {priceLabel(item.priceLevel)}
          </Text>
        </View>
        {item.isVegan ? (
          <View style={styles.dietPill}>
            <Text style={styles.dietText}>vegan</Text>
          </View>
        ) : item.isVegetarian ? (
          <View style={styles.dietPill}>
            <Text style={styles.dietText}>veggie</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.itemReasonBox}>
        <Text style={[typography.caption, styles.itemReason]}>{reason}</Text>
      </View>
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
    backgroundColor: '#FEE2E2',
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
    alignItems: 'center',
    gap: spacing.lg,
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
});

import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../theme';
import type { Recommendation } from '../types';
import { priceLabel } from '../lib/labels';
import { getOpenStatus } from '../lib/openingHours';

const kindBadge: Record<
  Recommendation['kind'],
  { label: string; bg: string; fg: string }
> = {
  best: { label: 'Nejlepší volba teď', bg: '#F97316', fg: '#FFFFFF' },
  fastest: { label: 'Nejrychlejší volba', bg: '#65A30D', fg: '#FFFFFF' },
  alternative: { label: 'Alternativa', bg: '#FFEDD5', fg: '#9A3412' },
};

interface FoodCardProps {
  recommendation: Recommendation;
  onPress: () => void;
  onDetail: () => void;
}

export function FoodCard({ recommendation, onPress, onDetail }: FoodCardProps) {
  const { place, menuItem, reason, kind } = recommendation;
  const badge = kindBadge[kind];

  const prepMinutes = menuItem?.preparationMinutes ?? place.prepMinutes;
  const itemPriceLevel = menuItem?.priceLevel ?? place.priceLevel;
  const openStatus = useMemo(() => getOpenStatus(place), [place]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadow.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.badgeText, { color: badge.fg }]}>
          {badge.label}
        </Text>
      </View>

      <Text style={[typography.caption, styles.placeLine]}>{place.name}</Text>
      <Text style={[typography.h2, styles.itemName]} numberOfLines={2}>
        {menuItem ? menuItem.name : place.cuisine}
      </Text>
      <Text style={[typography.caption, styles.cuisine]}>{place.cuisine}</Text>

      <View
        style={[
          styles.statusPill,
          openStatus.open ? styles.statusOpen : styles.statusClosed,
        ]}
      >
        <Text style={styles.statusText}>{openStatus.label}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⏱</Text>
          <Text style={[typography.caption, styles.metaText]}>
            ~{prepMinutes} min
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>💸</Text>
          <Text style={[typography.caption, styles.metaText]}>
            {priceLabel(itemPriceLevel)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>★</Text>
          <Text style={[typography.caption, styles.metaText]}>
            {place.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={styles.reasonBox}>
        <Text style={[typography.body, styles.reason]}>{reason}</Text>
      </View>

      <Pressable
        onPress={onDetail}
        accessibilityRole="button"
        style={({ pressed }) => [styles.detailBtn, pressed && styles.pressed]}
      >
        <Text style={[typography.bodyStrong, styles.detailLabel]}>
          Detail →
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  placeLine: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  itemName: {
    color: colors.textPrimary,
  },
  cuisine: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    color: colors.textSecondary,
  },
  reasonBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  reason: {
    color: colors.textPrimary,
  },
  detailBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    color: colors.primaryDark,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  statusOpen: {
    backgroundColor: colors.successSoft,
  },
  statusClosed: {
    backgroundColor: colors.surfaceMuted,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
})

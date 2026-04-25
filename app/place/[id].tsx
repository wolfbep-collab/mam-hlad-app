import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../../src/components';
import { demoPlaces } from '../../src/data/demoPlaces';
import { priceLabel } from '../../src/lib/labels';
import { colors, radius, spacing, typography } from '../../src/theme';

const serviceLabel: Record<string, string> = {
  sitdown: 'Posezení',
  pickup: 'Vyzvednutí',
  delivery: 'Rozvoz',
};

export default function PlaceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = demoPlaces.find((p) => p.id === id);

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

      <View style={styles.metaGrid}>
        <Meta label="Příprava" value={`~${place.prepMinutes} min`} />
        <Meta label="Cena" value={priceLabel(place.priceLevel)} />
        <Meta label="Hodnocení" value={`★ ${place.rating.toFixed(1)}`} />
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

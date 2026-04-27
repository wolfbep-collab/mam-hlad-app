import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../src/components';
import { clearHistory, loadHistory } from '../src/lib/history';
import {
  dietaryLabels,
  moodLabels,
  situationLabels,
} from '../src/lib/labels';
import { colors, radius, spacing, typography } from '../src/theme';
import type { DietaryPreference, HistoryEntry } from '../src/types';

const HISTORY_DISPLAY_LIMIT = 10;

const dateFmt = new Intl.DateTimeFormat('cs-CZ', {
  day: '2-digit',
  month: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('cs-CZ', {
  hour: '2-digit',
  minute: '2-digit',
});

function relativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'právě teď';
  if (minutes < 60) return `před ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 6) return `před ${hours} h`;
  const date = new Date(timestamp);
  const today = new Date(now);
  const yesterday = new Date(now - 24 * 60 * 60 * 1000);
  const sameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (sameDay) return `dnes ${timeFmt.format(date)}`;
  if (isYesterday) return `včera ${timeFmt.format(date)}`;
  return `${dateFmt.format(date)} ${timeFmt.format(date)}`;
}

function safeDiet(entry: HistoryEntry): DietaryPreference {
  const value = entry.preference?.dietaryPreference;
  if (value === 'vegetarian' || value === 'vegan' || value === 'any') {
    return value;
  }
  return 'any';
}

export default function HistoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      void loadHistory().then((items) => {
        if (active) {
          setEntries(items);
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const confirmClear = () => {
    Alert.alert(
      'Vymazat historii?',
      'Tvoje uložené tipy v tomto zařízení budou smazané. Akci nelze vrátit.',
      [
        { text: 'Zpět', style: 'cancel' },
        {
          text: 'Vymazat',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setEntries([]);
          },
        },
      ]
    );
  };

  const openPlace = (entry: HistoryEntry) => {
    const diet = safeDiet(entry);
    router.push({
      pathname: '/place/[id]',
      params: {
        id: entry.placeId,
        mood: entry.preference?.mood ?? 'any',
        situation: entry.preference?.situation ?? 'now',
        diet,
      },
    });
  };

  if (loading) {
    return (
      <Screen>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Načítám…
        </Text>
      </Screen>
    );
  }

  if (entries.length === 0) {
    return (
      <Screen contentStyle={styles.empty}>
        <Text style={styles.emptyEmoji}>🍽</Text>
        <Text style={[typography.h2, styles.emptyTitle]}>Tvoje tipy</Text>
        <Text style={[typography.body, styles.emptyText]}>
          Zatím tu nejsou žádné tipy. Až si necháš něco doporučit, najdeš to
          tady.
        </Text>
        <Button label="Mám hlad" onPress={() => router.push('/hunger')} />
      </Screen>
    );
  }

  const visible = entries.slice(0, HISTORY_DISPLAY_LIMIT);

  return (
    <Screen contentStyle={styles.content}>
      <Text style={[typography.body, styles.intro]}>
        Posledních {visible.length}{' '}
        {visible.length === 1 ? 'tip' : visible.length < 5 ? 'tipy' : 'tipů'}{' '}
        (uloženo jen v tomto zařízení).
      </Text>

      {visible.map((entry) => {
        const diet = safeDiet(entry);
        const showVeganPill = entry.menuItemIsVegan === true;
        const showVegPill =
          !showVeganPill && entry.menuItemIsVegetarian === true;
        return (
          <Pressable
            key={entry.id}
            onPress={() => openPlace(entry)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.rowHead}>
              <View style={styles.rowTitleBlock}>
                <Text
                  style={[typography.bodyStrong, styles.placeName]}
                  numberOfLines={2}
                >
                  {entry.placeName}
                </Text>
                {entry.menuItemName ? (
                  <Text
                    style={[typography.caption, styles.itemLine]}
                    numberOfLines={2}
                  >
                    {entry.menuItemName}
                  </Text>
                ) : null}
              </View>
              <Text style={[typography.caption, styles.time]}>
                {relativeTime(entry.timestamp)}
              </Text>
            </View>

            <Text style={[typography.caption, styles.context]}>
              {moodLabels[entry.preference?.mood ?? 'any']} •{' '}
              {situationLabels[entry.preference?.situation ?? 'now'].toLowerCase()}{' '}
              • {dietaryLabels[diet].toLowerCase()}
            </Text>

            {showVeganPill || showVegPill ? (
              <View style={styles.pillRow}>
                <View style={styles.dietPill}>
                  <Text style={styles.dietPillText}>
                    {showVeganPill ? 'Vegan' : 'Vegetariánské'}
                  </Text>
                </View>
              </View>
            ) : null}
          </Pressable>
        );
      })}

      <Button
        label="Vymazat historii"
        variant="ghost"
        size="md"
        onPress={confirmClear}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  intro: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rowTitleBlock: {
    flex: 1,
    gap: 2,
  },
  placeName: {
    color: colors.textPrimary,
  },
  itemLine: {
    color: colors.textSecondary,
  },
  time: {
    color: colors.textMuted,
    flexShrink: 0,
    marginLeft: spacing.sm,
  },
  context: {
    color: colors.textSecondary,
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    color: colors.textPrimary,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

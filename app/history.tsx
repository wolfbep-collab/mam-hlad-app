import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../src/components';
import { clearHistory, loadHistory } from '../src/lib/history';
import { moodLabels, situationLabels } from '../src/lib/labels';
import { colors, radius, spacing, typography } from '../src/theme';
import type { HistoryEntry } from '../src/types';

const dateFmt = new Intl.DateTimeFormat('cs-CZ', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

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

  const handleClear = async () => {
    await clearHistory();
    setEntries([]);
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
        <Text style={[typography.h2, styles.emptyTitle]}>
          Zatím tu nic není
        </Text>
        <Text style={[typography.body, styles.emptyText]}>
          Až si necháš poradit s jídlem, najdeš tady svou historii voleb.
        </Text>
        <Button label="Mám hlad" onPress={() => router.push('/hunger')} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      <Text style={[typography.body, styles.intro]}>
        Posledních {entries.length} voleb (pouze v tomto zařízení).
      </Text>

      {entries.map((entry) => (
        <Pressable
          key={entry.id}
          onPress={() => router.push(`/place/${entry.placeId}`)}
          style={({ pressed }) => [
            styles.row,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.rowHead}>
            <Text style={[typography.bodyStrong, styles.placeName]}>
              {entry.placeName}
            </Text>
            <Text style={[typography.caption, styles.time]}>
              {dateFmt.format(new Date(entry.timestamp))}
            </Text>
          </View>
          <Text style={[typography.caption, styles.context]}>
            {moodLabels[entry.preference.mood]} •{' '}
            {situationLabels[entry.preference.situation].toLowerCase()}
          </Text>
        </Pressable>
      ))}

      <Button
        label="Vymazat historii"
        variant="ghost"
        size="md"
        onPress={handleClear}
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
    alignItems: 'center',
  },
  placeName: {
    color: colors.textPrimary,
    flex: 1,
  },
  time: {
    color: colors.textMuted,
  },
  context: {
    color: colors.textSecondary,
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

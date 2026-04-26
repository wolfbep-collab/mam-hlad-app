import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface MoodChipProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}

export function MoodChip({ label, emoji, selected, onPress }: MoodChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text
          style={[
            typography.bodyStrong,
            styles.label,
            selected && styles.labelSelected,
          ]}
        >
          {label}
        </Text>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.primaryDark,
  },
  check: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: spacing.xs,
  },
});

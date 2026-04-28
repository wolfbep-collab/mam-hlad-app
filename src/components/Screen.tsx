import { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

const BOTTOM_BUFFER = spacing.xxxl + spacing.xl;

export function Screen({
  children,
  scroll = true,
  contentStyle,
  edges = ['top', 'left', 'right', 'bottom'],
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const includesBottom = edges.includes('bottom');
  const bottomPad = includesBottom
    ? BOTTOM_BUFFER
    : Math.max(insets.bottom, spacing.lg) + BOTTOM_BUFFER;
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            contentStyle,
            { paddingBottom: bottomPad },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[styles.content, contentStyle, { paddingBottom: bottomPad }]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});

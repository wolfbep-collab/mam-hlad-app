import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
  keyboardAvoiding?: boolean;
}

const BOTTOM_BUFFER = spacing.xxxl + spacing.xl;

export function Screen({
  children,
  scroll = true,
  contentStyle,
  edges = ['top', 'left', 'right', 'bottom'],
  keyboardAvoiding = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const includesBottom = edges.includes('bottom');
  const bottomPad = includesBottom
    ? BOTTOM_BUFFER
    : Math.max(insets.bottom, spacing.lg) + BOTTOM_BUFFER;
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        contentStyle,
        { paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[styles.content, contentStyle, { paddingBottom: bottomPad }]}
    >
      {children}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});

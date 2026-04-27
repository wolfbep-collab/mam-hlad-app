import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
            headerTintColor: colors.primaryDark,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="hunger" options={{ title: 'Mám hlad na…' }} />
          <Stack.Screen name="known" options={{ title: 'Vím, co si dát' }} />
          <Stack.Screen name="results" options={{ title: 'Doporučení' }} />
          <Stack.Screen name="place/[id]" options={{ title: 'Detail' }} />
          <Stack.Screen name="history" options={{ title: 'Tvoje tipy' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

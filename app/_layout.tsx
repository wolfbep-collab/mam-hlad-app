import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SteamLogoIntro } from '../src/components';
import { colors } from '../src/theme';

export default function RootLayout() {
  // RootLayout mounts once per JS session, so this state — and therefore the
  // intro — only appears on cold start, never during in-app navigation.
  const [introDone, setIntroDone] = useState(false);

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
          <Stack.Screen name="hunger" options={{ title: '' }} />
          <Stack.Screen name="known" options={{ title: 'Vím, co si dát' }} />
          <Stack.Screen name="results" options={{ title: 'Doporučení' }} />
          <Stack.Screen name="place/[id]" options={{ title: 'Detail' }} />
          <Stack.Screen name="history" options={{ title: 'Tvoje tipy' }} />
          <Stack.Screen
            name="street-food"
            options={{ title: 'Street food dnes' }}
          />
          <Stack.Screen
            name="street-food/[id]"
            options={{ title: 'Detail stánku' }}
          />
          <Stack.Screen
            name="vendor-checkin"
            options={{ title: 'Mám stánek' }}
          />
        </Stack>
        {!introDone ? (
          <SteamLogoIntro onDone={() => setIntroDone(true)} />
        ) : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

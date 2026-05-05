import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, MoodChip } from '../src/components';
import { demoStreetFoodVendors, getDemoBaseLocation } from '../src/data/demoStreetFood';
import { getCachedLocation, type UserLocation } from '../src/lib/location';
import {
  endLocalCheckIn,
  loadLocalCheckIns,
  saveLocalCheckIn,
  streetFoodCategoryEmoji,
} from '../src/lib/streetFood';
import { colors, radius, spacing, typography } from '../src/theme';
import type { StreetFoodCheckIn, StreetFoodVendor } from '../src/types';

const HOUR_MS = 60 * 60 * 1000;
const DEFAULT_DURATION_HOURS = 4;
// Extra room added to the scroll content when the keyboard is visible so the
// note input + CTA can scroll into view above the keyboard on Android edge-to-edge.
const KEYBOARD_EXTRA_PADDING = 320;
// Top breathing room above the section that's being scrolled into view.
const SCROLL_TARGET_OFFSET = 80;
// Wait for the soft keyboard's animation to finish before measuring/scrolling.
const SCROLL_DELAY_MS = 250;

export default function VendorCheckInScreen() {
  const [vendorId, setVendorId] = useState<string>(demoStreetFoodVendors[0].id);
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [useDeviceLocation, setUseDeviceLocation] = useState<boolean>(false);
  const [localCheckIns, setLocalCheckIns] = useState<StreetFoodCheckIn[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const scrollRef = useRef<ScrollView>(null);
  const noteInputRef = useRef<TextInput | null>(null);
  const locationSectionY = useRef<number>(0);
  const noteSectionY = useRef<number>(0);

  const cachedLocation = getCachedLocation();

  useEffect(() => {
    let active = true;
    void loadLocalCheckIns().then((items) => {
      if (active) setLocalCheckIns(items);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const vendorById = useMemo(
    () => new Map(demoStreetFoodVendors.map((v) => [v.id, v])),
    []
  );

  const selectedVendor: StreetFoodVendor | undefined = vendorById.get(vendorId);

  const refreshLocal = async () => {
    const items = await loadLocalCheckIns();
    setLocalCheckIns(items);
  };

  const scrollToInput = (target: 'location' | 'note') => {
    setTimeout(() => {
      const y =
        target === 'note' ? noteSectionY.current : locationSectionY.current;
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - SCROLL_TARGET_OFFSET),
        animated: true,
      });
    }, SCROLL_DELAY_MS);
  };

  const onLocationSectionLayout = (e: LayoutChangeEvent) => {
    locationSectionY.current = e.nativeEvent.layout.y;
  };

  const onNoteSectionLayout = (e: LayoutChangeEvent) => {
    noteSectionY.current = e.nativeEvent.layout.y;
  };

  const onSave = async () => {
    if (!selectedVendor) return;
    Keyboard.dismiss();
    const now = Date.now();
    const base: UserLocation =
      useDeviceLocation && cachedLocation
        ? cachedLocation
        : getDemoBaseLocation(cachedLocation);
    const checkIn: StreetFoodCheckIn = {
      id: `local-${selectedVendor.id}-${now}`,
      vendorId: selectedVendor.id,
      latitude: base.latitude,
      longitude: base.longitude,
      locationLabel: locationLabel.trim() || 'Demo poloha',
      activeFrom: now,
      activeUntil: now + DEFAULT_DURATION_HOURS * HOUR_MS,
      createdAt: now,
      status: 'active',
      note: note.trim() ? note.trim() : undefined,
    };
    await saveLocalCheckIn(checkIn);
    setSavedAt(now);
    setNote('');
    await refreshLocal();
  };

  const onEnd = async (id: string) => {
    const target = localCheckIns.find((c) => c.id === id);
    if (!target) return;
    await endLocalCheckIn(target.vendorId);
    await refreshLocal();
  };

  const activeLocal = localCheckIns.filter((c) => c.status === 'active');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && { paddingBottom: KEYBOARD_EXTRA_PADDING },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.intro}>
            <Text style={[typography.h1, styles.introTitle]}>Mám stánek</Text>
            <Text style={[typography.body, styles.introLead]}>
              Řekni lidem, kde dnes prodáváš.
            </Text>
          </View>

          <View style={styles.banner}>
            <Text style={[typography.label, styles.bannerLabel]}>
              Demo režim pro stánkaře
            </Text>
            <Text style={[typography.caption, styles.bannerText]}>
              Tady si můžeš vyzkoušet, jak by prodejce jednoduše oznámil: dnes
              prodávám tady. Check-in se uloží jen do tohoto telefonu.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[typography.h2, styles.sectionTitle]}>Vyber stánek</Text>
            <View style={styles.vendorRow}>
              {demoStreetFoodVendors.map((v) => (
                <MoodChip
                  key={v.id}
                  label={v.name}
                  emoji={streetFoodCategoryEmoji[v.category]}
                  selected={vendorId === v.id}
                  onPress={() => setVendorId(v.id)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section} onLayout={onLocationSectionLayout}>
            <Text style={[typography.h2, styles.sectionTitle]}>Kde dnes stojíš?</Text>
            <TextInput
              value={locationLabel}
              onChangeText={setLocationLabel}
              placeholder="např. U parku na Letné"
              placeholderTextColor={colors.textMuted}
              style={[typography.body, styles.input]}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={() => scrollToInput('location')}
              onSubmitEditing={() => noteInputRef.current?.focus()}
            />
            <View style={styles.locationChoiceRow}>
              <LocationOption
                label="Použít moji aktuální polohu"
                hint={
                  cachedLocation
                    ? 'Použijeme GPS souřadnice z telefonu.'
                    : 'Poloha zatím není povolená — vrátíme se k demo poloze.'
                }
                selected={useDeviceLocation}
                onPress={() => setUseDeviceLocation(true)}
              />
              <LocationOption
                label="Použít demo polohu"
                hint="Stánek se ukáže v okolí Prahy (demo)."
                selected={!useDeviceLocation}
                onPress={() => setUseDeviceLocation(false)}
              />
            </View>
          </View>

          <View style={styles.section} onLayout={onNoteSectionLayout}>
            <Text style={[typography.h2, styles.sectionTitle]}>Krátká poznámka</Text>
            <TextInput
              ref={noteInputRef}
              value={note}
              onChangeText={setNote}
              placeholder="např. Dnes do 15:00 u parku."
              placeholderTextColor={colors.textMuted}
              style={[typography.body, styles.input, styles.inputMultiline]}
              multiline
              maxLength={140}
              returnKeyType="done"
              onFocus={() => scrollToInput('note')}
            />
          </View>

          <Button
            label="Ukázat mě dnes"
            onPress={onSave}
            disabled={!selectedVendor}
          />

          <Text style={[typography.caption, styles.demoFooter]}>
            Zatím jde jen o demo režim v tomto zařízení.
          </Text>

          {savedAt ? (
            <Text style={[typography.caption, styles.savedHint]}>
              Hotovo. Lidé tě teď uvidí ve „Street food dnes" (jen v tomto
              telefonu).
            </Text>
          ) : null}

          {activeLocal.length > 0 ? (
            <View style={styles.section}>
              <Text style={[typography.h2, styles.sectionTitle]}>
                Aktivní demo check-iny
              </Text>
              <Text style={[typography.caption, styles.activeHint]}>
                Tyhle check-iny jsou jen v tomto telefonu. Můžeš je tady ukončit.
              </Text>
              <View style={styles.activeList}>
                {activeLocal.map((c) => {
                  const v = vendorById.get(c.vendorId);
                  return (
                    <View key={c.id} style={styles.activeRow}>
                      <View style={styles.activeText}>
                        <Text style={[typography.bodyStrong, styles.activeTitle]}>
                          {v?.name ?? c.vendorId}
                        </Text>
                        <Text
                          style={[typography.caption, styles.activeSubtitle]}
                          numberOfLines={2}
                        >
                          📍 {c.locationLabel}
                          {c.note ? ` · ${c.note}` : ''}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => onEnd(c.id)}
                        style={({ pressed }) => [
                          styles.endBtn,
                          pressed && { opacity: 0.7 },
                        ]}
                        accessibilityRole="button"
                      >
                        <Text style={styles.endBtnText}>Ukončit</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface LocationOptionProps {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}

function LocationOption({ label, hint, selected, onPress }: LocationOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.locationOption,
        selected && styles.locationOptionSelected,
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View
        style={[
          styles.radioDot,
          selected && styles.radioDotSelected,
        ]}
      />
      <View style={styles.locationOptionText}>
        <Text style={[typography.bodyStrong, styles.locationOptionLabel]}>
          {label}
        </Text>
        <Text style={[typography.caption, styles.locationOptionHint]}>
          {hint}
        </Text>
      </View>
    </Pressable>
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl + spacing.xl,
    gap: spacing.xl,
  },
  intro: {
    gap: spacing.xs,
  },
  introTitle: {
    color: colors.textPrimary,
  },
  introLead: {
    color: colors.textSecondary,
  },
  banner: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerLabel: {
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bannerText: {
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  vendorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    minHeight: 52,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationChoiceRow: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  locationOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: 2,
  },
  radioDotSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  locationOptionText: {
    flex: 1,
    gap: 2,
  },
  locationOptionLabel: {
    color: colors.textPrimary,
  },
  locationOptionHint: {
    color: colors.textSecondary,
  },
  demoFooter: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  savedHint: {
    color: colors.success,
    fontWeight: '600',
  },
  activeHint: {
    color: colors.textSecondary,
  },
  activeList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  activeText: {
    flex: 1,
    gap: 2,
  },
  activeTitle: {
    color: colors.textPrimary,
  },
  activeSubtitle: {
    color: colors.textSecondary,
  },
  endBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  endBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
});

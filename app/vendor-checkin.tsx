import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  findNodeHandle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components';
import { demoStreetFoodVendors, getDemoBaseLocation } from '../src/data/demoStreetFood';
import { getCachedLocation, type UserLocation } from '../src/lib/location';
import {
  endLocalCheckIn,
  loadLocalCheckIns,
  saveLocalCheckIn,
} from '../src/lib/streetFood';
import { colors, radius, spacing, typography } from '../src/theme';
import type { StreetFoodCheckIn } from '../src/types';

const HOUR_MS = 60 * 60 * 1000;
const DEFAULT_DURATION_HOURS = 4;
// Internal demo vendor used purely as a back-end anchor for the local check-in;
// the user never sees a vendor picker.
const DEFAULT_VENDOR_ID = demoStreetFoodVendors[0].id;
// Generous bottom padding so the deepest fields (note + CTA + footer) can always
// scroll above the keyboard, regardless of which input is focused.
const KEYBOARD_EXTRA_PADDING = 480;
// Top breathing room above the section we're bringing into view.
const SCROLL_TOP_MARGIN = 60;
// Wait for the soft keyboard's open animation to finish before measuring.
const SCROLL_DELAY_MS = 280;

type FieldKey = 'location' | 'offering' | 'note';

export default function VendorCheckInScreen() {
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [offering, setOffering] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [useDeviceLocation, setUseDeviceLocation] = useState<boolean>(false);
  const [localCheckIns, setLocalCheckIns] = useState<StreetFoodCheckIn[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const scrollRef = useRef<ScrollView | null>(null);
  const locationSectionRef = useRef<View | null>(null);
  const offeringSectionRef = useRef<View | null>(null);
  const noteSectionRef = useRef<View | null>(null);
  const offeringInputRef = useRef<TextInput | null>(null);
  const noteInputRef = useRef<TextInput | null>(null);
  const focusedField = useRef<FieldKey | null>(null);

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

  const sectionRefFor = (k: FieldKey): React.RefObject<View | null> =>
    k === 'note'
      ? noteSectionRef
      : k === 'offering'
        ? offeringSectionRef
        : locationSectionRef;

  // Always measure the section's current position relative to the ScrollView's
  // inner content view, then scroll there. Doesn't depend on stored layout
  // values, so it works the first time the user taps any field, regardless of
  // whether previous fields are filled or empty.
  const bringSectionIntoView = (target: FieldKey) => {
    const scroll = scrollRef.current;
    const view = sectionRefFor(target).current;
    if (!scroll || !view) return;

    const innerHandle =
      (scroll as unknown as { getInnerViewNode?: () => number | null })
        .getInnerViewNode?.() ?? findNodeHandle(scroll);
    if (innerHandle == null) return;

    const onMeasured = (_x: number, y: number) => {
      const targetY = Math.max(0, y - SCROLL_TOP_MARGIN);
      scroll.scrollTo({ y: targetY, animated: true });
      // For the note (last field before CTA + footer) reinforce the scroll a
      // moment later: even if the first scrollTo lands a few pixels short,
      // a second pass with the now-settled layout brings the field comfortably
      // above the keyboard.
      if (target === 'note') {
        setTimeout(() => {
          const node = sectionRefFor(target).current;
          const sc = scrollRef.current;
          if (!node || !sc) return;
          node.measureLayout(
            innerHandle,
            (_x2, y2) => {
              sc.scrollTo({ y: Math.max(0, y2 - SCROLL_TOP_MARGIN), animated: true });
            },
            () => {}
          );
        }, 220);
      }
    };

    view.measureLayout(innerHandle, onMeasured, () => {});
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      const target = focusedField.current;
      if (target) {
        // Defer past the layout pass that just added bottom padding.
        setTimeout(() => bringSectionIntoView(target), 50);
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleFocus = (target: FieldKey) => () => {
    focusedField.current = target;
    // Always fire — also covers the case where the keyboard is already open
    // and the user just switches between fields (keyboardDidShow won't re-fire).
    setTimeout(() => {
      if (focusedField.current === target) bringSectionIntoView(target);
    }, SCROLL_DELAY_MS);
  };

  const refreshLocal = async () => {
    const items = await loadLocalCheckIns();
    setLocalCheckIns(items);
  };

  const onPublish = async () => {
    Keyboard.dismiss();
    const now = Date.now();
    const base: UserLocation =
      useDeviceLocation && cachedLocation
        ? cachedLocation
        : getDemoBaseLocation(cachedLocation);
    const trimmedOffering = offering.trim();
    const trimmedNote = note.trim();
    const checkIn: StreetFoodCheckIn = {
      id: `local-${DEFAULT_VENDOR_ID}-${now}`,
      vendorId: DEFAULT_VENDOR_ID,
      latitude: base.latitude,
      longitude: base.longitude,
      locationLabel: locationLabel.trim() || 'Mé dnešní místo',
      activeFrom: now,
      activeUntil: now + DEFAULT_DURATION_HOURS * HOUR_MS,
      createdAt: now,
      status: 'active',
      note: trimmedNote ? trimmedNote : undefined,
      offering: trimmedOffering ? trimmedOffering : undefined,
    };
    await saveLocalCheckIn(checkIn);
    setSavedAt(now);
    setNote('');
    setOffering('');
    setLocationLabel('');
    await refreshLocal();
  };

  const onEnd = async (vendorId: string) => {
    await endLocalCheckIn(vendorId);
    await refreshLocal();
  };

  const onEdit = (c: StreetFoodCheckIn) => {
    setLocationLabel(c.locationLabel === 'Mé dnešní místo' ? '' : c.locationLabel);
    setOffering(c.offering ?? '');
    setNote(c.note ?? '');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const activeLocal = useMemo(
    () => localCheckIns.filter((c) => c.status === 'active'),
    [localCheckIns]
  );

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
          <View style={styles.heroBlock}>
            <View
              style={styles.heroBadge}
              accessibilityRole="image"
              accessibilityLabel="Stánek"
            >
              <Text style={styles.heroEmoji}>🛺</Text>
            </View>
            <Text style={[typography.h1, styles.heroTitle]}>Mám stánek</Text>
            <Text style={[typography.body, styles.heroLead]}>
              Dej lidem vědět, kde dnes prodáváš a co nabízíš.
            </Text>
          </View>

          <View
            ref={locationSectionRef}
            collapsable={false}
            style={styles.section}
          >
            <Text style={[typography.h2, styles.sectionTitle]}>Kde dnes stojíš?</Text>
            <TextInput
              value={locationLabel}
              onChangeText={setLocationLabel}
              placeholder="např. U parku na Letné"
              placeholderTextColor={colors.textMuted}
              style={[typography.body, styles.input]}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={handleFocus('location')}
              onSubmitEditing={() => offeringInputRef.current?.focus()}
            />
            <View style={styles.locationChoiceRow}>
              <LocationOption
                label="Použít moji aktuální polohu"
                hint={
                  cachedLocation
                    ? 'Použijeme GPS souřadnice z telefonu.'
                    : 'Poloha zatím není povolená — vrátíme se k přibližné poloze.'
                }
                selected={useDeviceLocation}
                onPress={() => setUseDeviceLocation(true)}
              />
              <LocationOption
                label="Zadat polohu jen popisem"
                hint="Zobrazíme tě podle textu výše, bez GPS."
                selected={!useDeviceLocation}
                onPress={() => setUseDeviceLocation(false)}
              />
            </View>
          </View>

          <View
            ref={offeringSectionRef}
            collapsable={false}
            style={styles.section}
          >
            <Text style={[typography.h2, styles.sectionTitle]}>Co dnes nabízíš?</Text>
            <TextInput
              ref={offeringInputRef}
              value={offering}
              onChangeText={setOffering}
              placeholder="např. káva, cappuccino, cold brew, toast"
              placeholderTextColor={colors.textMuted}
              style={[typography.body, styles.input]}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={handleFocus('offering')}
              onSubmitEditing={() => noteInputRef.current?.focus()}
            />
          </View>

          <View
            ref={noteSectionRef}
            collapsable={false}
            style={styles.section}
          >
            <View style={styles.noteHeading}>
              <Text style={[typography.h2, styles.sectionTitle]}>Krátká poznámka</Text>
              <Text style={[typography.caption, styles.optional]}>volitelné</Text>
            </View>
            <TextInput
              ref={noteInputRef}
              value={note}
              onChangeText={setNote}
              placeholder="např. Dnes do 15:00"
              placeholderTextColor={colors.textMuted}
              style={[typography.body, styles.input, styles.inputMultiline]}
              multiline
              maxLength={140}
              returnKeyType="done"
              onFocus={handleFocus('note')}
            />
          </View>

          <Button label="Zveřejnit dnešní stánek" onPress={onPublish} />

          <Text style={[typography.caption, styles.demoFooter]}>
            Zatím jde jen o lokální režim v tomto zařízení.
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
                Aktivní dnešní oznámení
              </Text>
              <Text style={[typography.caption, styles.activeHint]}>
                Tady vidíš svoje aktivní oznámení. Můžeš je upravit nebo
                ukončit.
              </Text>
              <View style={styles.activeList}>
                {activeLocal.map((c) => (
                  <View key={c.id} style={styles.activeRow}>
                    <View style={styles.activeText}>
                      <Text style={[typography.bodyStrong, styles.activeTitle]}>
                        📍 {c.locationLabel}
                      </Text>
                      {c.offering ? (
                        <Text
                          style={[typography.caption, styles.activeSubtitle]}
                          numberOfLines={2}
                        >
                          {c.offering}
                        </Text>
                      ) : null}
                      {c.note ? (
                        <Text
                          style={[typography.caption, styles.activeNote]}
                          numberOfLines={2}
                        >
                          {c.note}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.activeActions}>
                      <Pressable
                        onPress={() => onEdit(c)}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          pressed && { opacity: 0.7 },
                        ]}
                        accessibilityRole="button"
                      >
                        <Text style={styles.actionBtnText}>Upravit</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onEnd(c.vendorId)}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.actionBtnEnd,
                          pressed && { opacity: 0.7 },
                        ]}
                        accessibilityRole="button"
                      >
                        <Text style={styles.actionBtnText}>Ukončit</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
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
  heroBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroEmoji: {
    fontSize: 44,
  },
  heroTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroLead: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  noteHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  optional: {
    color: colors.textMuted,
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
    textAlign: 'center',
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
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  activeText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  activeTitle: {
    color: colors.textPrimary,
  },
  activeSubtitle: {
    color: colors.textSecondary,
  },
  activeNote: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  activeActions: {
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  actionBtnEnd: {
    backgroundColor: colors.surface,
  },
  actionBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
});

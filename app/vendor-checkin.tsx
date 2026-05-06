import {
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Keyboard,
  type KeyboardEvent,
  KeyboardAvoidingView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
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
// Internal anchor for the persisted check-in. The stánkař never sees a vendor list.
const DEFAULT_VENDOR_ID = demoStreetFoodVendors[0].id;
// Generous bottom spacer so the deepest fields + CTA stay reachable even when
// the keyboard is open.
const KEYBOARD_BOTTOM_SPACER = 480;
// Margin between the focused input's bottom edge and the keyboard top.
const INPUT_KEYBOARD_MARGIN = 32;
// Wait for the soft keyboard's open animation to finish on Android before measuring.
const FOCUS_SCROLL_DELAY_MS = 320;

export default function VendorCheckInScreen() {
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [offering, setOffering] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [useDeviceLocation, setUseDeviceLocation] = useState<boolean>(false);
  const [localCheckIns, setLocalCheckIns] = useState<StreetFoodCheckIn[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const scrollRef = useRef<ScrollView | null>(null);
  const locationInputRef = useRef<TextInput | null>(null);
  const offeringInputRef = useRef<TextInput | null>(null);
  const noteInputRef = useRef<TextInput | null>(null);

  // Tracked in refs so we don't re-render every scroll/keyboard frame.
  const scrollOffsetY = useRef<number>(0);
  // Distance from the top of the window to the top of the keyboard, in screen
  // coordinates. Number.POSITIVE_INFINITY when the keyboard is hidden.
  const keyboardTopY = useRef<number>(Number.POSITIVE_INFINITY);
  // Ref of the currently focused input so we can re-scroll once the keyboard
  // finishes opening.
  const focusedInputRef = useRef<RefObject<TextInput | null> | null>(null);

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

  // Keep the screen-absolute keyboard top up to date. measureInWindow returns
  // window-relative y, and Keyboard.endCoordinates also lives in window coords,
  // so this comparison is apples-to-apples.
  useEffect(() => {
    const onShow = (event: KeyboardEvent) => {
      const windowHeight = Dimensions.get('window').height;
      const kbHeight = event.endCoordinates?.height ?? 0;
      keyboardTopY.current =
        kbHeight > 0 ? windowHeight - kbHeight : Number.POSITIVE_INFINITY;
      setKeyboardVisible(true);
      // Re-scroll the currently focused input now that we know exactly where
      // the keyboard is. Covers the cold-start case where focus fired before
      // the keyboard finished opening.
      const focused = focusedInputRef.current;
      if (focused) ensureInputAboveKeyboard(focused);
    };
    const onHide = () => {
      keyboardTopY.current = Number.POSITIVE_INFINITY;
      setKeyboardVisible(false);
    };
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onShow
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onHide
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetY.current = e.nativeEvent.contentOffset.y;
  };

  // Measures the input's position on the screen (window coords) and, if the
  // input's bottom is below or under the keyboard top, scrolls the ScrollView
  // up by exactly the overlap. Doesn't depend on cached layout values, on the
  // form's filled state, or on the order in which the user taps fields.
  const ensureInputAboveKeyboard = (
    inputRef: RefObject<TextInput | null>
  ) => {
    const input = inputRef.current;
    const scroll = scrollRef.current;
    if (!input || !scroll) return;
    if (typeof input.measureInWindow !== 'function') return;
    input.measureInWindow((_x, y, _w, h) => {
      if (typeof y !== 'number' || typeof h !== 'number') return;
      const inputBottom = y + h;
      const kbTop = keyboardTopY.current;
      const overlap = inputBottom + INPUT_KEYBOARD_MARGIN - kbTop;
      if (overlap <= 0) return;
      const targetOffset = scrollOffsetY.current + overlap;
      scroll.scrollTo({ y: targetOffset, animated: true });
    });
  };

  const handleFocus = (inputRef: RefObject<TextInput | null>) => () => {
    focusedInputRef.current = inputRef;
    // Always run, regardless of any input value or location toggle.
    setTimeout(() => {
      if (focusedInputRef.current === inputRef) {
        ensureInputAboveKeyboard(inputRef);
      }
    }, FOCUS_SCROLL_DELAY_MS);
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
            keyboardVisible && { paddingBottom: KEYBOARD_BOTTOM_SPACER },
          ]}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.section}>
            <Text style={[typography.h2, styles.sectionTitle]}>Kde dnes stojíš?</Text>
            <TextInput
              ref={locationInputRef}
              value={locationLabel}
              onChangeText={setLocationLabel}
              placeholder="např. U parku na Letné"
              placeholderTextColor={colors.textMuted}
              style={[typography.body, styles.input]}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={handleFocus(locationInputRef)}
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

          <View style={styles.section}>
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
              onFocus={handleFocus(offeringInputRef)}
              onSubmitEditing={() => noteInputRef.current?.focus()}
            />
          </View>

          <View style={styles.section}>
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
              onFocus={handleFocus(noteInputRef)}
            />
          </View>

          <Button label="Zveřejnit dnešní stánek" onPress={onPublish} />

          {savedAt ? (
            <Text style={[typography.caption, styles.savedHint]}>
              Hotovo. Lidé tě teď uvidí ve „Street food dnes".
            </Text>
          ) : null}

          {activeLocal.length > 0 ? (
            <View style={styles.section}>
              <Text style={[typography.h2, styles.sectionTitle]}>
                Aktivní dnešní oznámení
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
  savedHint: {
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
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

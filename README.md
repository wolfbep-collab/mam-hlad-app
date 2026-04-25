# Mám hlad

Mobilní aplikace, která člověku za 30 sekund pomůže rozhodnout, co si dát právě teď. Žádný nekonečný seznam restaurací — jen pár otázek a tři chytrá doporučení.

> **Status:** MVP v0.1 — demo data, lokální historie, žádné přihlášení.

## Stack

- [Expo](https://expo.dev) SDK 54 (managed workflow)
- React Native 0.81, React 19
- TypeScript (strict)
- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based navigace
- [`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/) — lokální historie
- Supabase je připravený jako pointer (`src/lib/supabase.ts`), ale MVP běží na demo datech

## Spuštění lokálně

```bash
# 1. instalace
npm install

# 2. dev server
npm start
# pak naskenuj QR kód v aplikaci Expo Go (Android) nebo iOS Camera

# další možnosti
npm run android   # otevře Android emulátor
npm run ios       # otevře iOS simulátor (jen macOS)
npm run web       # otevře verzi v prohlížeči
```

### Kontrola kódu

```bash
npm run typecheck    # spustí tsc --noEmit
```

## Struktura projektu

```
app/                       # Expo Router (každý soubor = obrazovka)
  _layout.tsx              # Stack navigace + theming
  index.tsx                # Home: „Mám hlad"
  hunger.tsx               # Výběr chuti + situace
  results.tsx              # 3 doporučení
  place/[id].tsx           # Detail místa
  history.tsx              # Lokální historie voleb

src/
  components/              # Button, FoodCard, MoodChip, Screen
  data/demoPlaces.ts       # 12 testovacích podniků
  lib/
    recommendationEngine.ts  # bodovací logika
    history.ts               # AsyncStorage wrapper
    labels.ts                # české popisky
    supabase.ts              # placeholder na pozdější napojení
  theme/                   # colors, spacing, typography
  types/                   # Place, UserPreference, Recommendation, …

docs/                      # produktové dokumenty
assets/                    # ikony, splash, logo koncept
```

## Doporučovací engine v krátkosti

`src/lib/recommendationEngine.ts` přiřadí každému podniku skóre na základě:

- **Otevřeno teď?** Velký negativní postih, pokud ne.
- **Sedí typ obsluhy** (sednout / vyzvednout / rozvoz) na situaci.
- **Tagy chuti** se shodují s vybraným moodem (warm / fast / light / …).
- **Doba přípravy** vejde do limitu situace (15/30 min, …).
- **Cena** — bonus pro levné, když uživatel má spěch nebo chce levné.
- **Hodnocení** — drobný bonus za ★ 4.6+.

Z výsledku vybereme tři karty:

1. **Nejlepší volba teď** — nejvyšší celkové skóre.
2. **Nejrychlejší volba** — nejnižší `prepMinutes`.
3. **Alternativa** — další z žebříčku.

## Roadmapa

Viz [`docs/ROADMAP.md`](docs/ROADMAP.md). MVP scope je v [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md), produktový brief v [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md), a workflow s Claude v [`docs/CLAUDE_WORKFLOW.md`](docs/CLAUDE_WORKFLOW.md).

## Cesta na Google Play

Distribuce přes EAS Build / EAS Submit:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview      # interní APK
eas build --platform android --profile production
eas submit --platform android
```

Detailněji v `docs/ROADMAP.md` (sekce Distribuce).

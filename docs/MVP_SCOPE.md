# MVP Scope — v0.1

## In scope

### Obrazovky

| #   | Route             | Účel                                                            |
| --- | ----------------- | --------------------------------------------------------------- |
| 1   | `/`               | Home — název, lead, hlavní CTA „Mám hlad", odkaz na historii.   |
| 2   | `/hunger`         | Výběr chuti (7 voleb) + situace (6 voleb).                       |
| 3   | `/results`        | 3 karty: Nejlepší teď, Nejrychlejší, Alternativa.                |
| 4   | `/place/[id]`     | Detail: adresa, tagy, otevírací stav, cena, hodnocení, popis.    |
| 5   | `/history`        | Posledních ~30 voleb z `AsyncStorage`.                           |

### Stav & data

- **Demo katalog** — 12 podniků v `src/data/demoPlaces.ts`. Stačí pro pokrytí všech kombinací mood × situation.
- **Lokální historie** — `AsyncStorage` klíč `mam-hlad:history:v1`, max 30 záznamů.
- **Bez přihlášení.** Bez Supabase v běhu (placeholder existuje).

### Doporučovací engine

- Skóre = funkce (otevřeno, obsluha, mood-tag match, čas přípravy, cena, hodnocení).
- Vrací **přesně 3** doporučení (best / fastest / alternative) — viz `recommendationEngine.ts`.

### Kvalita

- TypeScript strict, žádné `any` v aplikační logice.
- `npm run typecheck` prochází.
- Manuální průchod home → hunger → results → detail → history funguje na webu i v Expo Go.

## Out of scope (pro v0.1)

- Reálná data o restauracích (Google Places, Mapy.cz, …).
- Geolokace / vzdálenost v km.
- Platby, objednávky, doručení.
- Účet, synchronizace mezi zařízeními.
- Push notifikace.
- Hodnocení uživatelem, recenze, foto.
- Tmavý režim (přijde s designovým pasem).
- i18n (zatím jen čeština).

## Definition of Done pro MVP

- [x] `npm install && npm start` rozjede dev server.
- [x] Aplikace projde všemi 5 obrazovkami bez crashe (Expo Go).
- [x] `npm run typecheck` bez errorů.
- [x] 12 podniků pokrývá všechny mood × situation kombinace bez „prázdného" výsledku.
- [x] README říká, jak rozjet projekt z nuly za < 5 minut.
- [x] Logo koncept připravený v `assets/logo-concept.md`.
- [ ] Internal APK (EAS preview profile) instalovatelný na Android — řeší v0.2.

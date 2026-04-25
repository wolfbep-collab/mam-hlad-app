# Roadmapa

## v0.1 — MVP s demo daty (hotovo)

- 5 obrazovek (home, hunger, results, place detail, history).
- Doporučovací engine s bodováním.
- 12 testovacích podniků.
- Lokální historie přes AsyncStorage.
- Vizuální identita: teplá oranžová, krémové pozadí.

## v0.2 — Distribuce & test na zařízení

**Cíl:** Mít app instalovatelnou jako APK na 5 testovacích Androidech.

- [ ] Konfigurace EAS Build (`eas.json`, profily preview / production).
- [ ] Vygenerovat ikonu aplikace z konceptu (1024×1024) a nahradit `assets/icon.png`, `assets/adaptive-icon.png`.
- [ ] `eas build --platform android --profile preview` → APK.
- [ ] Distribuce odkazem testerům (mimo Play Store).
- [ ] Sběr feedbacku přes formulář (Tally / Google Forms).

## v0.3 — Reálné podniky pro 1 čtvrť

**Cíl:** Místo demo dat reálný kurátorovaný katalog pro jednu čtvrť (např. Vinohrady).

- [ ] Schéma `places` v Supabase (stejné jako `Place` v `src/types`).
- [ ] Nahrát 30–50 reálných podniků ručně přes Supabase Studio.
- [ ] V app načítat z Supabase + fallback na demo, pokud offline.
- [ ] Otevírací doba podle aktuálního dne / hodiny (ne jen `openNow` flag).

## v0.4 — Geolokace & vzdálenost

- [ ] `expo-location` — vyžádat polohu, počítat vzdálenost.
- [ ] Filtr „do 1 km / 2 km".
- [ ] V doporučovacím skóre zohlednit vzdálenost.

## v0.5 — Google Play (closed testing)

- [ ] Vytvořit konzoli Google Play (jednorázový poplatek $25).
- [ ] Privacy policy URL (text v `docs/PRIVACY.md`).
- [ ] Screenshoty, popis, kategorie „Food & Drink".
- [ ] `eas submit --platform android` do closed testing tracku.
- [ ] Dotáhnout 12+ testerů (Play vyžaduje pro production track).

## v1.0 — Veřejné spuštění

- [ ] Production track na Play.
- [ ] Reálná data pro celou Prahu (nebo aspoň 5 čtvrtí).
- [ ] Push notifikace „Je oběd, kam dnes?".
- [ ] Volitelný účet pro synchronizaci historie.

## Distribuce — shrnutí kroků na Play

1. **EAS setup**: `npm install -g eas-cli && eas login && eas build:configure`.
2. **Build APK** pro interní testování: `eas build -p android --profile preview`.
3. **Build AAB** pro Play: `eas build -p android --profile production`.
4. **Submit**: `eas submit -p android --latest`.
5. **Konzole Play**: vyplnit listing, screenshots, privacy policy, kontakty.
6. **Closed testing → Production**: postupné rolling.

## Co schválně zatím není v plánu

- iOS distribuce (vyžaduje Apple Developer účet $99/rok — necháme až po validaci na Androidu).
- Vlastní backend mimo Supabase (zbytečná složitost).
- AI/LLM volby z přirozeného textu („mám chuť na něco co mě nabudí") — počkáme, až bude jasné, jestli to lidi opravdu chtějí.

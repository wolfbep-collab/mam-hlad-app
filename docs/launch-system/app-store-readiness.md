# App Store Readiness

Checklist pro dostání Mám hlad do Google Play a Apple App Store / TestFlight. Tento dokument je provozní — slouží jako acceptance kritéria pro Store Launch Agent a jako live checklist pro zakladatele.

## Pořadí prací

1. **Google Play closed testing** (týden 2 v `30-day-launch-plan.md`).
2. **Google Play open testing** (týden 4).
3. **Apple TestFlight** (dny 31–45).
4. **Google Play production track** (po validaci open testingu).
5. **Apple App Store production** (po TestFlight + validaci).

Apple je vždy zpožděný oproti Androidu — registrace developer účtu trvá dny, review může trvat 24–72 h, plus iOS build je ekonomicky horší pro early stage (poměr cena $99/rok vs. počet českých iOS testerů). Android je primární platforma pro launch.

---

## Google Play

### Účet a předpoklady

- [ ] Google Developer účet ($25 jednorázově, vlastní email zakladatele, ne firemní pokud firma neexistuje).
- [ ] Dvoufaktorová autentizace zapnutá.
- [ ] Tax info / payee info vyplněno (i pokud appka je zdarma — Play to vyžaduje).
- [ ] D-U-N-S číslo NENÍ potřeba pro individual accounty (na rozdíl od Apple).

### Build

- [ ] `eas.json` má `preview` (APK pro testery mimo Play) a `production` (AAB pro Play).
- [ ] `app.json` má unikátní `package` (např. `cz.mamhlad.app`) — jednou nastavené, navždy.
- [ ] Verze (`versionCode`) se inkrementuje při každém uploadu.
- [ ] Ikona 512×512 (Play listing) — vygenerovaná z `assets/icon.png`.
- [ ] Feature graphic 1024×500.
- [ ] Adaptive icon (foreground + background) v `app.json`.

### Listing — texty

- [ ] **App name:** „Mám hlad" (max 30 znaků).
- [ ] **Short description:** 80 znaků, „Tři chytrá doporučení, co si dát teď. Bez skrolování." (k iteraci).
- [ ] **Full description:** 4000 znaků, CZ verze primární, EN verze záloha. Bez startup buzzwords. Bez slibů, které appka nemá.
- [ ] **Category:** Food & Drink.
- [ ] **Content rating:** vyplnit dotazník (pravděpodobně Everyone / 3+, žádný shopping, žádný social).
- [ ] **Target audience:** 13+.
- [ ] **Privacy policy URL:** veřejný odkaz na `mamhlad.cz/privacy` (musí být live před submit).

### Listing — vizuál

- [ ] **Screenshots:** 4–8 ks, 1080×1920 (portrait), bez status baru s emulátorovým časem.
- [ ] **Sekvence:** home → hunger → results → place detail. Volitelně screenshot historie.
- [ ] **Žádné fake screenshoty** s reálným podnikem, který nemá souhlas.
- [ ] **Feature graphic** s logem a tagline.

### Privacy a Data Safety

Toto je sekce, kterou Play nově hodně přitvrdil. Vyplnit přesně:

- [ ] **Data collected:** žádná osobní data v MVP (lokální historie).
- [ ] **Data shared with third parties:** žádná v MVP.
- [ ] **Encrypted in transit:** ano (https).
- [ ] **Data deletion:** in-app (uživatel může smazat lokální historii) + email request.
- [ ] **Account creation:** ne (anonymní použití).

Pokud později přidáme Supabase login, **data safety** se musí aktualizovat. Až dosud zůstat u „neukládáme nic".

### Closed testing

- [ ] Vytvořit Closed testing track.
- [ ] Sehnat 12+ testerů (jejich Gmail účty). Play vyžaduje 12+ aktivních testerů 14+ dní před production accessem (pravidlo se mění, zkontrolovat aktuální Play policy v týdnu 2).
- [ ] Tester list: rodina, kamarádi, ochotní Pilot 0 majitelé.
- [ ] Otestovat install flow z testing linku.
- [ ] Feedback formulář (Google Form, link v Play listing pro testery).

### Review rizika — Play

| Riziko | Mitigace |
|---|---|
| **Health claims** v textech | Safety Guard pass na všech text artefaktech listingu |
| **Restaurace dat bez souhlasu** | Pilot 0 = jen explicitně schválené, Google Places seed v aplikaci v týdnu 1–4 NESPOUŠTÍME |
| **Cookies / tracking** disclosure | MVP nemá tracking, ale pokud přidáme PostHog: aktualizovat data safety + privacy policy |
| **Stejný název s jinou appkou** | Před registrací search v Play, doménový check |
| **Závadný content** (food poisoning warning) | Žádná konkrétní zdravotní rada, jen recommendation |

---

## Apple TestFlight / App Store

### Účet a předpoklady

- [ ] Apple Developer Program ($99/rok).
  - Individual: stačí jméno, telefon, kreditní karta.
  - Company: vyžaduje D-U-N-S, legal entity, déle.
  - **Doporučení:** v early stage individual účet na zakladatele. Převést na company později.
- [ ] Verifikace může trvat 1–7 dní. Spustit hned na začátku týdne 2.
- [ ] Bank info pro payouts (i pro free app — Apple vyžaduje).

### Build

- [ ] `eas.json` má `ios` profil, signing pomocí EAS managed credentials.
- [ ] `app.json` má `ios.bundleIdentifier` (např. `cz.mamhlad.app`).
- [ ] Build number se inkrementuje.
- [ ] App icon 1024×1024.

### Listing — texty

- [ ] **App name:** „Mám hlad" (max 30 znaků).
- [ ] **Subtitle:** 30 znaků.
- [ ] **Promotional text:** 170 znaků (lze měnit bez review).
- [ ] **Description:** 4000 znaků.
- [ ] **Keywords:** 100 znaků (čárkami oddělené, žádné mezery navíc).
- [ ] **Support URL:** `mamhlad.cz/podpora`.
- [ ] **Privacy policy URL:** `mamhlad.cz/privacy`.
- [ ] **Category:** Food & Drink (Primary).

### Listing — vizuál

- [ ] **Screenshots pro 6.7" iPhone** (1290×2796 nebo 1284×2778 dle iOS verze) — povinné.
- [ ] **Screenshots pro 5.5" iPhone** (1242×2208) — povinné pro starší zařízení (může se měnit, ověřit aktuální App Store Connect pravidla v týdnu 2).
- [ ] **iPad screenshoty:** jen pokud appka tvrdí, že podporuje iPad. Defaultně NE.
- [ ] **App preview video:** volitelné, později.

### Privacy — App Privacy

- [ ] **Privacy nutrition labels:** vyplnit přesně. „Data Not Collected" pokud zůstaneme bez backendu.
- [ ] **Tracking:** žádný (žádný ATT prompt potřeba).

### TestFlight

- [ ] **Internal testing** (do 100 testerů z Apple Connect týmu, bez review).
- [ ] **External testing** (do 10 000 testerů, ale vyžaduje Apple review prvního buildu — typicky 24–48 h).
- [ ] **Beta App Description** + **Beta App Feedback Email**.
- [ ] **Demo account / test login** — pokud bychom mít přihlášení (zatím nemáme).

### Review notes pro Apple reviewera

Apple je striktnější. Připravit text:

```
This app helps people decide what to eat right now.
No account is required. No data is collected from the user.
The recommendation engine uses a curated list of restaurants
in Liberec, Czech Republic.

To test:
1. Open the app.
2. Tap "Mám hlad".
3. Pick a mood and situation.
4. View three recommendations.

There is no payment, no order placement, no chat,
no third-party login.

Contact: ahoj@mamhlad.cz
```

### Review rizika — Apple

| Riziko | Mitigace |
|---|---|
| **Guideline 4.2 — Minimum Functionality** (Apple zamítá „too simple" appky) | Recommendation engine je nontriviální, popsat ho v review notes |
| **Guideline 5.1.1 — Data Collection** | Žádný account, žádné data v MVP. Pokud bude Supabase login, aktualizovat. |
| **Guideline 1.5 — Developer Information** | Support email aktivní, web live |
| **In-app browser links** vedoucí na external order | Žádné v MVP — pokud později přidáme „otevřít web podniku", ujistit se, že to Apple netraktuje jako payment routing |
| **Czech-only content** | Mít EN screenshoty a EN description fallback (Apple reviewer ne vždy mluví česky) |

---

## Společné — privacy policy

Privacy policy musí být:

- [ ] **Veřejně dostupná URL** (`mamhlad.cz/privacy`), žádný PDF download.
- [ ] **V češtině** (primární uživatelská populace) + **v angličtině** (pro Apple/Google reviewery).
- [ ] **Aktuální datum poslední aktualizace.**
- [ ] **Kontakt na DPO / responsible person** (může být zakladatel).
- [ ] **Co sbíráme:** v MVP nic. Lokální historie zůstává na zařízení.
- [ ] **Co sdílíme:** v MVP nic.
- [ ] **Cookies / analytics:** žádné na webu landing page bez consent banneru. Pokud později PostHog v appce → aktualizovat.
- [ ] **Práva uživatele (GDPR):** přístup, oprava, výmaz, přenositelnost.
- [ ] **Children's data:** Mám hlad není určen pro děti pod 13 let.

Privacy policy NESMÍ být generována blind agentem a publikována. Store Launch Agent generuje draft, zakladatel reviewuje, ideálně i právník (v pozdější fázi).

---

## Společné — screenshoty pipeline

- [ ] Use case: vytvořit deterministicky znovu vyrobitelné screenshoty.
- [ ] **Postup:**
  1. `npx expo start --android` v emulátoru s předem nastaveným device profile.
  2. Naskriptovaný flow (home → hunger → results → place detail).
  3. Screenshot util (`adb shell screencap` nebo Maestro / Detox v budoucnu).
  4. Branding overlay (Canva / Figma): nadpis nad screenshotem.
- [ ] **Nevkládat reálné podniky bez souhlasu** — pro launch screenshoty použít demo data nebo Liberec Pilot 0 podniky, které dali explicitní souhlas se screenshotem v marketingu (= zaznamenat v `docs/pilot-0/`).

---

## Společné — support email

- [ ] `ahoj@mamhlad.cz` nebo `podpora@mamhlad.cz`.
- [ ] Forwarduje na osobní email zakladatele (nebo do shared inboxu).
- [ ] **SLA:** odpověď do 48 h v pracovních dnech (toto je realistické pro solo founder).
- [ ] **Auto-reply v0:** „Děkujeme za zprávu. Mám hlad je malý projekt, odpovíme nejpozději do dvou pracovních dnů."

---

## Pre-submit checklist (poslední 30 min před tlačítkem „Submit")

- [ ] Typecheck (`npm run typecheck`) prošel.
- [ ] `npx expo export --platform android` (resp. ios) prošel.
- [ ] Build version / version code inkrementován.
- [ ] Žádné `console.log` / `console.error` debug s citlivými daty.
- [ ] Žádný hardcoded API klíč v repu.
- [ ] Privacy policy live na produkční URL.
- [ ] Support email odpovídá (test mail z jiného účtu).
- [ ] Listing texty Safety Guard pass.
- [ ] Screenshots aktuální (ne ze starého buildu).
- [ ] Review notes čeká reviewera.

## Po-submit (první 7 dnů)

- [ ] Sledovat Play Console / App Store Connect denně.
- [ ] Připravit fix-listu pro typické review rejections (gluten claim, restaurant data, missing privacy).
- [ ] Strategy Agent: zaznamenat learnings do `docs/launch-system/store-launch-retro.md` (vznikne v týdnu 4).

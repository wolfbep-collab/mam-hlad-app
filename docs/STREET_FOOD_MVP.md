# Street Food MVP — produktový a technický návrh

Stav: **prototyp v0.8 / demo režim**. Žádný backend, žádné účty, žádná
veřejně dostupná data prodejců. Všechno běží lokálně na zařízení.

## Proč tato funkce existuje

Aplikace „Mám hlad" pomáhá člověku rychle se rozhodnout, co si dát teď. V
realitě ale velkou část denního jídla u nás tvoří street food: kávovary v
dodávce, sendviče u kanceláří, pop-up burgery na trzích, lívance na festivalu,
asijské nudle u parku.

Tito prodejci sdílejí dvě vlastnosti, které do klasického „seznamu restaurací"
nesedí:

1. **Polohu mění den ode dne.** Dnes Náplavka, zítra Letenské sady, pozítří
   firemní akce.
2. **Mají úzké, ale vysoce hodnotné menu.** Tři položky, žádné rozvozy, žádný
   sit-down, jenom „dej si tohle teď".

Cíl funkce **Street food dnes** je proto:

- ukázat zákazníkovi, *kdo dnes stojí poblíž a co vaří*,
- dát prodejci *minimální způsob, jak říct „dnes jsem tady"* — bez registrace,
  bez webu, bez účetních dat.

## Aktuální stav (v0.8 demo)

- **Demo dataset** s 8 typovými prodejci v `src/data/demoStreetFood.ts`:
  káva, sendviče, burgery, vegan bowl, tacos, polévky, sladké, asijské nudle.
- **Aktivní check-iny** se generují za běhu z dnešního času (`now − 1 h`
  až `now + N h`), takže demo vypadá realisticky bez ohledu na denní dobu.
- **Polohy** vycházejí z pražského základu (Wenceslas / centrum). Pokud
  uživatel povolil polohu a je dál než 20 km, demo polohy se přesouvají blíž k
  uživateli (stejná logika jako u stávajícího `demoPlaceLocalizer`).
- **Vegan / vegetariánský filtr** funguje přesně jako v hlavním flow:
  - položka označená `isVegan` nesmí obsahovat živočišné produkty,
  - položka označená `isVegetarian` nesmí obsahovat maso ani ryby,
  - filtr „Vegansky" pustí dál jen prodejce, který má alespoň jednu veganskou
    položku, a v kartě ukáže pouze veganské položky.
- **Vzdálenost** počítáme přes existující `calculateDistanceMeters` a řadíme
  prodejce od nejbližšího.
- **Bez polohy** aplikace funguje — prodejci se ukážou bez vzdálenosti, ve
  výchozím pořadí podle dataset.

## Demo režim pro prodejce

Obrazovka `app/vendor-checkin.tsx` je interní prototyp. Není to registrace.
Nemá login, nemá heslo, neposílá nic ven. Slouží jen k tomu, abychom otestovali,
zda check-in flow vůbec dává smysl.

Co umí:

- Vybrat jednoho z demo prodejců.
- Napsat krátký popis polohy (např. „Dnes do 15:00 u parku na Letné").
- Volitelně použít aktuální GPS polohu zařízení místo demo polohy.
- Přidat krátkou poznámku (max. 140 znaků).
- Uložit check-in do `AsyncStorage` pod klíčem
  `mam-hlad:street-food-checkins:v1`.
- Ukončit běžící lokální check-in tlačítkem „Ukončit".

Lokální check-in **přepíše** demo check-in pro stejného prodejce — takže když
prodejce nastaví „dnes stojím u Tržnice", uvidí ho zákazník v zákaznické
obrazovce na téhle adrese.

Default doba aktivity: 4 h od uložení.

## Jak by to fungovalo v produkci (návrh)

Až tahle funkce projde validací, plánovaný next step:

### 1. Registrace prodejce
- Supabase Auth (e-mail magic link), žádná hesla.
- Profil prodejce (`street_food_vendors`) odpovídá současnému typu
  `StreetFoodVendor`. Je veřejně viditelný (název, popis, kategorie, menu),
  ale **bez** osobních údajů (e-mail, telefon, IČO se nikde nezobrazí).

### 2. Check-in / check-out
- Prodejce klepne v aplikaci na „Dnes jsem tady", zadá polohu (GPS nebo ručně)
  a volitelnou poznámku.
- Server zapíše záznam do `street_food_checkins` se `status = 'active'` a
  default `active_until = now + 6 h`.
- Prodejce může check-in ručně ukončit. Po `active_until` server check-in
  automaticky deaktivuje (cron / scheduled function).

### 3. Soukromí
- **Přesnou polohu** zobrazujeme veřejně **jen po dobu aktivního
  check-inu**. Po `active_until` se přesné GPS souřadnice nezobrazují.
- Historie pohybů prodejce není veřejná. Prodejce vidí jen vlastní historii.
- Zákazník nikdy nevidí osobní údaje prodejce — jen profil stánku, menu, dnešní
  polohu.
- Žádné push notifikace na pozici (proti stalkingu).
- Prodejce může profil kdykoli skrýt (`vendor.public = false`) a všechny
  veřejné check-iny se okamžitě přestanou zobrazovat.

### 4. Co výslovně **neděláme**
- Žádné platby v aplikaci.
- Žádné rezervace.
- Žádné hodnocení / hvězdičky pro street food prodejce v MVP — toxické
  gamifikace v okamžiku, kdy stojí prodejce sám u dodávky, jsou kontraproduktivní.
- Žádná mapa zatím. Začínáme list-based discovery, mapu přidáme až když
  ověříme hodnotu funkce a budeme znát potřeby prodejců.

## Soubory

- `src/types/index.ts` — `StreetFoodVendor`, `StreetFoodMenuItem`,
  `StreetFoodCheckIn`, `StreetFoodCategory`, `ActiveStreetFoodVendor`.
- `src/data/demoStreetFood.ts` — demo prodejci a generátor dnešních
  check-inů.
- `src/lib/streetFood.ts` — `getActiveStreetFoodVendors`,
  `mergeDemoAndLocalCheckIns`, `sortStreetFoodByDistance`,
  `filterStreetFoodByDiet`, `vendorMatchesDiet`, `formatCheckInTime`,
  AsyncStorage helpery.
- `app/street-food.tsx` — zákaznická obrazovka „Street food dnes".
- `app/vendor-checkin.tsx` — demo prodejcovská obrazovka.

## Otevřené otázky pro další iteraci

- Chceme „dnes" definovat jako kalendářní den, nebo jako aktivní check-in?
  (Teď je to *aktivní check-in* — to je pružnější.)
- Jak řešit nárazové akce a festivaly? (Speciální event-based check-in.)
- Mají prodejci přístup ke statistikám zhlédnutí? (Pravděpodobně ano, ale
  agregovaně.)
- Chceme push, když oblíbený prodejce dorazí poblíž? (Opt-in, opatrně.)

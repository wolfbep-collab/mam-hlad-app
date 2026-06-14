# Google Places Seed Plan

Pravidla pro to, jak Mám hlad používá Google Places API. Cíl: rychlý seed při startu v novém městě, **aniž bychom z Mám hlad udělali kopii Google Maps**.

## Tři tvrdá pravidla

1. **Google Places je seed, ne katalog.** Z Places bereme základní fakta (existuje, kde je, kdy má otevřeno), ne hodnotu Mám hlad (chef card, denní doporučení, mood/situation tagy).
2. **Seed data jsou v samostatné tabulce**, nikoli v hlavní `places`. Hlavní tabulka drží jen profily ověřené podnikem.
3. **Žádné fotky z Google Places** se neukládají, nezobrazují, neredistribuují. ToS Google Places to neumožňuje, a my to navíc nepotřebujeme — naše hodnota je v textu, který Google nemá.

## Co z Google Places používáme

| Pole | Použít | Důvod |
|---|---|---|
| `place_id` | ✅ | Stabilní klíč pro deduplikaci |
| `name` | ✅ | Základní identifikace |
| `formatted_address` | ✅ | Adresa pro UI |
| `geometry.location` (lat/lng) | ✅ | Pro filtr „do 1 km" |
| `types` / `primary_type` | ✅ | Kategorizace (restaurant, cafe, bakery) |
| `opening_hours` (weekday text) | ✅ | „Otevřeno teď?" výpočet |
| `phone_number` | ✅ | Kontakt pro Outreach Agent (private metadata, ne UI) |
| `website` | ✅ | Kontakt pro Outreach Agent (UI optional) |
| `rating` | ⚠️ podmíněně | Jen jako interní signál pro shortlist, NEZOBRAZOVAT v UI Mám hlad |
| `user_ratings_total` | ⚠️ podmíněně | Tamtéž |

## Co z Google Places NEukládáme

| Pole | Proč ne |
|---|---|
| **Photos** | ToS porušení + nepotřebujeme |
| **Reviews / review texts** | ToS + nechceme review-driven UX (proti severní hvězdě) |
| **Editorial summary** | Google content, nevěnujeme se mu |
| **Price level** | Nepřesné, zavádějící — vlastní cenu doplníme od podniku |
| **Google Maps URL** | Nechceme z Mám hlad odkazovat na Maps, nebudujeme tím vztah |
| **Cokoli, co se tváří jako Mám hlad hodnota** | Mood tagy, denní doporučení, chef card — nikdy ne z Places |

## Schéma: dvě tabulky, čistá hranice

### Tabulka `places_seed`

Staging pro seed data. **Nikdy se nezobrazuje uživatelům přímo.**

```
id              (uuid)
source          ('google_places_seed' | 'osm_seed' | 'manual_seed')
source_ref_id   (text — např. place_id z Google)
name            (text)
address         (text)
lat, lng        (float)
types           (text[])
opening_hours   (jsonb)
phone           (text, nullable)
website         (text, nullable)
last_synced_at  (timestamp)
seed_notes      (text, nullable — interní poznámky)
```

### Tabulka `places` (existující / cílová)

Produkční katalog. **Jen ověřené profily, které prošly concierge onboardingem nebo equivalent.**

```
id                  (uuid)
source              ('concierge_onboarding' | 'self_serve' | …)
source_seed_id      (uuid → places_seed.id, nullable — kdyby vzniklo ze seedu)
verified_by_owner   (boolean)
verified_at         (timestamp, nullable)
verified_via        ('whatsapp_screenshot' | 'email' | 'in_person' | …)

name, address, lat, lng, opening_hours, contact_info, …
moods               (text[])         ← vlastní hodnota
situations          (text[])         ← vlastní hodnota
chef_card           (jsonb, nullable) ← vlastní hodnota
daily_recommendation (text, nullable) ← vlastní hodnota
description         (text)            ← vlastní hodnota (kurátorovaný popis)
```

Kritické pravidlo: **uživatel v aplikaci nikdy nevidí záznam z `places_seed` přímo**. Aplikace čte z `places`, kde je `verified_by_owner = true` (nebo `manual_curated = true` ve speciálních případech).

## Sync flow

1. **Seed pull** (Google Places Agent):
   - Spuštěno ručně zakladatelem pro nové město/čtvrť.
   - Stáhnout do `places_seed`.
   - Žádné fotky.

2. **Shortlist** (manuální + Strategy Agent):
   - Zakladatel projde seed, vybere kandidáty pro outreach.
   - Strategy Agent může navrhnout shortlist podle typů a rozprostření.

3. **Outreach** (Outreach Agent):
   - Pracuje s `places_seed` + veřejným kontextem.

4. **Onboarding** (Onboarding Agent + zakladatel):
   - 10minutový rozhovor, voice memo, profile draft.
   - Vznikne nový záznam v `places` s `source_seed_id` na původní seed.

5. **Verify** (zakladatel + podnik):
   - Screenshot review → souhlas → `verified_by_owner = true`.

6. **Resync** (volitelně):
   - Sync hodin / kontaktu z Google Places do `places_seed`, nikdy ne přímo do `places`.

## Co dělá Mám hlad jiné než Google Maps

| Atribut | Google Maps | Mám hlad |
|---|---|---|
| **UX** | Skroluj feed, srovnávej, otevírej karty | 30 sekund: hunger → tři karty s důvodem |
| **Zdroj dat** | Editovatelné davem | Ověřené přímo s podnikem |
| **Kurátor** | Algoritmus + uživatelé | Zakladatel + kuchař |
| **Mood / situation** | Nemá | Hlavní vstup |
| **Denní doporučení** | Nemá | Drive na vracení |
| **Chef card** | Nemá | Lidský kontakt |
| **Review texty** | Tisíce | Nula — kurátorovaný popis nahrazuje |
| **Fotky** | Tisíce uživatelských | Jen ty, na které má Mám hlad explicitní souhlas (a kurátorské) |

Tato tabulka je důležitá interně: pokaždé, když uživatel řekne „proč nepoužívám Google Maps", odpovědí je tato tabulka. Pokud Mám hlad nevypadá z těchto sloupců odlišně, projekt selhal.

## Pravidlo „verified" odznáčku v UI

Konzervativní přístup:

- **Žádný „verified" odznáček v UI v MVP.**
- Důvod: badge implikuje úroveň důvěryhodnosti, kterou nemůžeme garantovat (např. jestli je info aktuální dnes).
- Co děláme místo toho: aplikace zobrazuje jen `verified_by_owner = true` profily. Pro uživatele je tedy 100 % obsahu „verified" — žádný badge není potřeba.
- Pokud později přidáme self-serve onboarding (kdy podnik sám vyplní bez concierge), pak teprve dává smysl rozlišovat (`gold profile` vs. self-serve). Tehdy promyslet odznáček znovu.

## Náklady a limity Places API

- **Free tier** (do změny ceníku Google): ~$200 monthly credit. Vystačí na seed pull několik měst v early phase.
- **Pravidlo:** Places sync běží **ručně**, ne na cronu, dokud nemáme reálný objem. Zabraňuje to runaway billing.
- **Cache:** držet podle aktuálního Places ToS (typicky 30 dní pro většinu polí). `last_synced_at` v `places_seed` toto vynucuje.

## Záložní zdroje seed dat

Pokud Google Places vypadne / zdraží / odřízne:

1. **OpenStreetMap (Overpass API):** zdarma, otevřené. Slabší pokrytí menších podniků, ale dostatečné pro start.
2. **Mapy.cz veřejné exporty:** pokrytí ČR. Licenční podmínky ověřit před nasazením.
3. **Manuální seed z radniční databáze podniků:** v Liberci a Praze mají města datasety podniků.

Google Places Agent musí být napsán tak, aby přepínání mezi backendy bylo question of configu, ne přepisování pipeline.

## Co Google Places NEsmí v Mám hlad nikdy udělat

- ❌ Vyplnit `chef_card`, `daily_recommendation`, `description` v `places`.
- ❌ Nastavit `verified_by_owner = true` automaticky.
- ❌ Generovat tooltipy „založeno na Google datech" — to je transparency, ale taky brand pollution.
- ❌ Být primární zdroj pro produkční čtení.
- ❌ Nahradit Pilot 0 concierge model „rychlým seed launch" v jiném městě bez ověření alespoň 5 podniků osobně.

## Spojení s ostatními agenty

- **Google Places Agent** stahuje seed.
- **Outreach Agent** používá seed + veřejný kontext pro drafty.
- **Onboarding Agent** vytváří `places` záznam navázaný na seed.
- **Safety Guard** kontroluje výstup Onboarding Agenta (seed sám neprochází Safety Guardem, protože z něj nic nepublikujeme).
- **QA Agent** kontroluje finální `places` záznam.
- **Strategy Agent** rozhoduje, kdy a kde seed pull spustit.

## Den 0 v novém městě

Vzor postupu pro vstup do dalšího města po Liberci (např. Praha-Vinohrady):

1. Stáhnout seed pro polygon Vinohrad → `places_seed` (80–150 míst).
2. Strategy Agent navrhne shortlist 15–25 dle typového mixu (jako Pilot 0).
3. Outreach Agent připraví drafty pro top 10.
4. Concierge onboarding 5–10 podniků (1–2 týdny).
5. Profily jdou do `places` po souhlasu podniků.
6. Aplikace v nové čtvrti je „založena", aniž bychom kdy publikovali seed data.

Toto je **jediná správná cesta** rozšiřování. Žádný „one-click cover Praha" launch z Google Places.

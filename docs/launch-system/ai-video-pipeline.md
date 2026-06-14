# AI Video Pipeline

Jak vyrobit AI video pro Mám hlad, **aniž bychom klamali, že jde o reálné dokumentární záběry**. Pipeline má 8 kroků a každý má lidskou kontrolu.

## Železné pravidlo

> **Žádné AI video pro Mám hlad nepředstírá, že je natočený dokumentární záběr reálné kuchyně, podniku, kuchaře nebo zákazníka.**

Důvody:

- Lidé hladu dělají rozhodnutí o jídle. Manipulace = brand toxic.
- Podniky v Pilotu 0 jsou identifikovatelné. Fake záběr „jejich" kuchyně je porušení důvěry.
- Apple, Google, IG, TikTok platforms začínají vyžadovat AI disclosure. Lepší být přede zákonem než hned na warning.

Co tedy můžeme dělat:

- **Schématické / stylizované AI vizuály** (zjevně grafika nebo abstraktní motion).
- **Kinetic typography** (text v pohybu, brand barvy, zvuk).
- **AI voiceover** s explicitní disclosure větou na začátku nebo v captions.
- **B-roll z royalty-free archivu** (Pexels, Pixabay) — ne AI, ale s atribucí.
- **Reálné záběry, které my sami natočíme** v Pilotu 0 podnicích s explicitním souhlasem (toto je nejlepší materiál, ale není to AI pipeline).

## 8 kroků pipeline

```
1. Nápad → 2. Scénář → 3. Safety/trust kontrola → 4. Video prompt
   → 5. Generování → 6. Lidská kontrola → 7. Publikace → 8. Metriky
```

### 1. Nápad

Vstupy:
- Téma z brief banky (`docs/launch-system/video-brief-bank.md` — vznikne v týdnu 2).
- Cílová persona (hladový uživatel / majitel podniku / zvědavý outsider).
- Cílová platforma (IG Reels 9:16, TikTok 9:16, YouTube Shorts 9:16, LinkedIn 1:1).

Výstup:
- 1–2 věty popisu („30s video pro hladového uživatele, vysvětlí, že Mám hlad není katalog ale rozhodovák").

Kdo dělá: zakladatel + Strategy Agent.

### 2. Scénář

Vstup: nápad.
Výstup: scénář ve formátu:

```
TITLE: …
LENGTH: 25s
PLATFORM: IG Reels 9:16

[0:00–0:03] Shot: kinetic text „Mám hlad. Mám 30 sekund."
            VO: žádný
            On-screen: žádný

[0:03–0:08] Shot: stylizovaná animace tří karet
            VO: „Mám hlad ti dá tři chytrá doporučení."
            On-screen: tagline

...

[0:22–0:25] Shot: logo + URL
            VO: „mamhlad.cz"
            On-screen: „Brzy v Google Play. AI generated visuals."
```

Kdo dělá: Video Script Agent → zakladatel reviewuje.

### 3. Safety / trust kontrola

Safety Guard Agent prochází scénář před tím, než cokoli generujeme. Hledá:

- Implicitní zdravotní claims.
- Sliby features, které appka nemá (rezervace, rozvoz, alergeny).
- Reálné podniky bez souhlasu.
- Cokoli, co by mohlo být čteno jako dokumentární záběr bez disclosure.

Verdikt: `pass` / `needs_redline` / `hard_block`.

### 4. Video prompt

Vstup: schválený scénář.
Výstup: konkrétní prompty pro video AI nástroj (Fable 5, Runway, Pika, Luma) a pro voiceover (ElevenLabs nebo alternativa).

Pravidla pro prompty:

- **Explicitně „stylized"** / „illustrative" / „motion graphic" — ne „cinematic realistic kitchen footage".
- **Žádná konkrétní jména reálných lidí** v promptech.
- **Žádné konkrétní názvy podniků** v promptech (kromě generic „a cafe", „a bistro").
- **Brand barvy** zadat explicitně (`#F97316` oranžová, `#FFF7ED` krém).

### 5. Generování

Video Production Agent spouští generaci v primárním nástroji.

**Fallback chain** (model-agnostic, viz `model-agnostic-agents.md`):

1. **Fable 5** — primární, pokud dostupný.
2. **Runway Gen-3 / Pika 1.x / Luma Dream Machine** — alespoň jeden účet vždy aktivní.
3. **Pure kinetic typography** (Canva / CapCut motion graphics) — nepotřebuje žádný video AI.

Kinetic typography fallback je důležitý: pokud zítra zmizí všechny AI video nástroje, do hodiny umíme vyrobit video ve stylu „bold orange text on cream background s animovaným pohybem". To je legitimní brand asset, ne ústupek.

### 6. Lidská kontrola

Před publikací video projde **3-checkpoint review**:

1. **Zakladatel:** dává smysl? Reprezentuje Mám hlad?
2. **Disclosure check:** je v captions / on-screen „AI generated visuals" nebo equivalent? Pokud video obsahuje cokoli, co by laik mohl číst jako reálné záběry → musí.
3. **2 nezávislí lidé** (kamarádi, testeři) odpovědí: „Připadá ti, že je to reálné video z konkrétní kuchyně?" Pokud ano → re-cut.

Pokud nějaký checkpoint padá → zpět ke kroku 4 (prompt) nebo 2 (scénář).

### 7. Publikace

- Publikuje **zakladatel ručně** z osobních / brand účtů. Žádný auto-post agent.
- Caption obsahuje:
  - Stručný popis.
  - **Disclosure** („AI generated visuals" nebo „Created with AI motion tools").
  - Link na `mamhlad.cz`.
  - Žádné fake @mention reálných podniků bez souhlasu.
- Žádné placené promotion v early phase (pre-launch). Toto rozhodnutí znovu zvážit po prvních metrikách (krok 8).

### 8. Metriky

Analytics Agent sleduje:

- **View completion rate** (kolik % videa se průměrně přehraje).
- **Click-through na `mamhlad.cz`** (UTM linky).
- **Comments / DMs** ručně — co lidé říkají?
- **Save / share rate** — silnější signál než lajky.

Threshold pro „funguje": > 30 % view completion na Reels. Pokud ne → re-think scénář, ne pumpnout reklamu.

Negativní signály:

- Comments „myslel jsem, že je to reálná appka". Disclosure selhala → vrátit se ke kroku 6.
- Sliby features, které appka nemá, v komentech („uděláte mi rezervaci?"). Scénář selhal → review.

## Pravidla pro voiceover

- AI voiceover (ElevenLabs nebo alternativa) je OK pro generic narration.
- **Ne** klonovat hlas zakladatele bez explicitního testu, jestli to nezní cringe / dystopicky.
- **Ne** klonovat hlas reálného kuchaře z Pilotu 0 bez písemného souhlasu (a ani potom defaultně ne).
- Disclosure věta na začátku nebo na konci, pokud je voiceover hlavní nositel sdělení.

## Pravidla pro hudbu

- Royalty-free knihovny (Epidemic Sound, Artlist, YouTube Audio Library, Suno generated s ToS check).
- **Ne** copyrighted skladby, ani „malý kousek nikdo nepozná".
- AI generated hudba (Suno, Udio): ověřit licenční podmínky před komerčním použitím (pre-launch je marketing **komerční**).

## Co video pipeline NEDĚLÁ

- ❌ Nemoutí AI tvář zakladatele a nedeepfakuje ho.
- ❌ Nedělá fake recenze („Karla, 32 let, miluje Mám hlad").
- ❌ Nedělá fake screenshoty fungujících features, které appka nemá.
- ❌ Nedělá AI video portrét reálného kuchaře z Pilotu 0 bez souhlasu.
- ❌ Nepoužívá AI-generated „street footage" stylu Liberec / Praha, který by vypadal jako dokument.
- ❌ Nepublikuje bez 3-checkpoint review.

## Příklady scénářů (k iteraci v týdnu 2)

### Scénář A: „30 sekund od hladu k rozhodnutí"

Pro hladového uživatele. Kinetic typography + abstract food shapes. Disclosure v rohu.

### Scénář B: „Pro podniky: ne další appka"

Pro majitele. Vysvětlí, že není rozvoz, není objednávkový systém, není kolektor recenzí. Klidný tón. Generic vizuál (bistro silueta, ne konkrétní podnik).

### Scénář C: „Jak vznikl recommendation engine"

Lehce educational. Animace „mood × situation × time → tři karty". Brand colors. Bez disclosure problému — celé je to očividně grafika.

### Scénář D: „První 10 podniků v Liberci"

Riskantní — zmiňuje reálné město a fázi. **Musí mít** souhlas podniků, pokud zazní jejich názvy. Bez souhlasu jen „v Liberci" obecně.

## Kdy AI video pipeline nepoužít

- Když potřebujeme reálné záběry konkrétního podniku → natočit telefonem se souhlasem.
- Když potřebujeme zakladatelovu mluvící hlavu → natočit telefonem, sestříhat ručně.
- Když máme reálný kuchařův příběh → audio + ilustrované karty, ne AI fake kuchař.

AI video je nástroj pro brand a edukaci, ne pro důkaz, že Mám hlad „je opravdu venku".

# Logo koncept — Mám hlad

## Pozice

Logo je první dotek značky. Musí říct tři věci za půl sekundy:

1. **Jídlo.** — symbol misky / talíře / lžíce.
2. **Rychlost & jednoduchost.** — žádný realismus, žádné ingredience navíc, čisté linie.
3. **Teplo & lidskost.** — měkké tvary, teplá oranžová, žádné ostré rohy.

Logo nemá být složitější než to, co vidíš na termosce. Pamatuj, že na adaptivní ikoně Androidu se ze symbolu vykousne kruh nebo squircle — všechno mimo střed se může ztratit.

## Hlavní symbol

**Stylizovaná miska v půlkruhu, ze které stoupá pára.**

- Miska: silný bílý / krémový oblouk (≈ 60 % šířky), tloušťka tahu ~12 % výšky.
- Pára: dva měkké S-tahy nad miskou, klesající tloušťka, žádné ostré špičky.
- Ohraničení: žádné. Logo je solidní tvar, ne outline.

Alternativa: **kruh s vykousnutým zubem** (jako abstraktní „uhryzlý" talíř) — funguje na ikoně, méně dobře na velkém banneru.

## Wordmark

- Text: `Mám hlad`
- Font: zaoblený sans-serif, geometrický (např. Nunito, Plus Jakarta Sans, nebo Inter Tight v rounded variantě).
- Váha: 700–800.
- Háček nad „á" je dost veliký, aby byl čitelný i v 24 px.
- Mezera mezi `Mám` a `hlad` je „dechová" — ne těsná, ale ne řídká.

Combo: na obdélných použití symbol vlevo + wordmark vpravo. Na čtvercové ikoně jen symbol.

## Barvy

| Role               | Hex       | Použití                              |
| ------------------ | --------- | ------------------------------------ |
| Akcent             | `#F97316` | symbol, hlavní tahy, klíčový prvek   |
| Tmavá              | `#1F1208` | wordmark na světlém pozadí           |
| Pozadí světlé      | `#FFF7ED` | hlavní podklad                       |
| Pozadí na ikoně AND| `#FFEDD5` | adaptive icon background             |
| Bílá               | `#FFFFFF` | inverze, podsvit                     |

**Ne**: zelená v logu (rezervovaná pro „zdravější volby" v UI).

## Varianty, které potřebujeme

1. **App ikona iOS** — 1024×1024 PNG, plný čtverec, symbol vycentrovaný, padding 12 %.
2. **App ikona Android (adaptive)** — popředí 1024×1024 (transparentní pozadí, symbol uvnitř bezpečné zóny ø 660 px), pozadí solid `#FFEDD5`.
3. **Splash screen** — symbol vycentrovaný, pozadí `#FFF7ED`.
4. **Favicon web** — 32×32 a 192×192 PNG, čistě symbol.
5. **Sociální / banner** — symbol + wordmark na světlém i tmavém pozadí.

## Prompt pro generování ikony aplikace

> A flat vector app icon for a mobile app called "Mám hlad" (Czech for "I'm hungry"). Centered symbol: a soft, rounded bowl seen from the side, drawn in solid warm orange (#F97316) on a cream background (#FFEDD5). Two gentle, wavy steam lines rise from the bowl, also in solid warm orange, with rounded ends and no sharp points. The bowl is a thick semicircular shape, taking about 55–60% of the icon width, sitting visually centered. No text. No outline. No gradients. No realism. No food inside. No shadows. Style: minimalist, friendly, geometric, single-color symbol on a solid background. Padding around the symbol is at least 14% of the icon size so it reads clearly inside Android's circular adaptive mask. Square 1024×1024 PNG, perfectly centered.

### Negative prompt (pokud nástroj umí)

> realism, photo, ingredients, vegetables, soup splashes, plate detail, faces, mascot, drop shadow, gradient, multiple colors, outline, text overlay, 3d, glossy, stickers, emoji style.

## Acceptance kritéria pro hotový asset

- Čitelný i ve 24 px (zkouška: okno 24×24 v prohlížeči).
- V kruhové masce Androidu se neořízne klíčová část.
- Vypadá konzistentně se zbytkem UI (oranžová sedí na `#FFF7ED`).
- Žádný text uvnitř ikony.
- Použité jen barvy z palety výše.

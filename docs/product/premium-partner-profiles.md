# Prémiové partnerské profily

Koncept toho, jak by v budoucnu v Mám hlad mohly fungovat **prémiové partnerské profily podniků**, aniž by se z aplikace stala reklamní platforma.

> **Status:** koncept, ne specifikace. Neimplementuje se v aktuálním pilotu. Doplňuje [`docs/PRODUCT_BRIEF.md`](../PRODUCT_BRIEF.md), [`docs/agents/README.md`](../agents/README.md) a [`docs/food-data-safety.md`](../food-data-safety.md). Při sporu platí ty.

## Proč tento dokument vzniká

Mám hlad má jasný severní směr: **konkrétní jídlo podle chuti, času, situace, lokace a stravování uživatele**. Jakmile začneme uvažovat o partnerských vztazích a budoucích zdrojích, je potřeba předem říct, **co prémiový profil je — a hlavně co není.** Aby ho nikdo později nezneužil ke skrytému ovlivňování doporučení.

Tenhle dokument je tedy ohrada, ne plán implementace. Implementace přijde, až bude validovaný produkt.

---

## 1. Princip

### Co Mám hlad dělá

Mám hlad doporučuje **konkrétní jídlo** podle:

- chuti uživatele („teplé / lehké / sladké / pálivé"),
- času, který má („mám 15 min / 30 min / klidně víc"),
- situace („sednout / vzít s sebou / cestou"),
- lokace (jak je to daleko),
- toho, jak jí (vegetarián, vegan, bez masa, atd.).

Doporučení = užitečnost pro uživatele. Nic víc.

### Co prémiový profil je

Prémiový profil je **kvalitnější zpracování vizitky podniku**: víc prostoru pro konkrétní jídla, slovo kuchaře, příběh místa, sezónní nabídku, fotky, krátké video, jemný zvukový podpis. Žádný profil v Mám hlad není pouhý „pin na mapě"; prémiový je jen propracovanější verze toho, co dělá smysl už dnes.

### Co prémiový profil NENÍ

- ❌ **Není to placená pozice ve výsledcích.** Pořadí doporučení určuje recommendation engine podle relevance, ne podle toho, kdo platí. Žádné „sponsored top of the list".
- ❌ **Není to obejití kurátorského filtru.** Když podnik nezapadá do výběru (kvalita, alergeny, claims), zaplacení tomu nepomůže.
- ❌ **Není to reklamní inventář** pro třetí strany. Mám hlad nikdy nezobrazuje reklamy cizích značek na podnik.
- ❌ **Není to slib většího dosahu.** Mám hlad neslibuje impressions, kliky ani konverze. Slibuje **kvalitnější vizitku**.

### Jediná legitimní výměna

Podnik si platí za to, že:

1. Jeho profil je profesionálně zpracovaný — s pomocí Mám hlad týmu a [agentů](../agents/README.md).
2. Má víc bloků, do kterých si může promítnout, kdo doopravdy je (jídlo dne, slovo kuchaře, příběh, fotky, video, zvukový podpis).
3. Dostává údržbu — pravidelnou aktualizaci s ohledem na sezónu, denní menu, změny v týmu.

Nic víc. Nic, co by zkreslilo to, co vidí hladový člověk.

---

## 2. Co může prémiový profil obsahovat

Prémiový profil rozšiřuje standardní vizitku o tyto bloky. Každý je volitelný — podnik si vybírá, co mu sedí.

| Blok | Co to je | Pro koho je to silné |
|---|---|---|
| **Jídlo dne** | Jedna konkrétní volba, ne celé menu. Vybírá podnik. | Lidé, kteří se nechtějí rozhodovat. |
| **Doporučení kuchaře** | Pár vět od člověka, který to vaří — osobní tip. | Lidé, co si váží řemesla. |
| **Příběh podniku** | Krátký lidský odstavec — proč podnik existuje. | Cestovatelé, nováčci, „proč právě sem". |
| **Důvod, proč přijít právě sem** | Jedna věta, která podnik odliší od ostatních. | Lidé, kteří mají na výběr 5 možností. |
| **Denní / sezónní nabídka** | Co je dnes/tento týden čerstvé. Aktualizuje podnik. | Stálí návštěvníci, milovníci sezónního vaření. |
| **Vegetariánská / veganská / rychlá volba** | Jeden konkrétní tip v každé kategorii, ne výpis. | Lidé s dietní preferencí, lidé ve spěchu. |
| **Fotky jídel** | Vlastní fotky konkrétních jídel z profilu. Žádné stock. | Vizuální rozhodování. |
| **Krátké video** | 5–15 s, atmosféra místa nebo příprava jídla. | Premium podniky, kde atmosféra je hodnota. |
| **Jemný zvukový podpis** | Velmi krátký zvuk při otevření profilu. Viz §3. | Premium podniky, fine dining, kavárny. |

### Pravidla pro obsah

- **Vše schvaluje podnik** — žádný blok se nezveřejní bez explicitního souhlasu (platí stejně jako pro [Pilot 0 concierge model](../agents/onboarding-agent.md)).
- **Žádné fake fotky.** Použít lze pouze fotky, které pořídil podnik nebo Mám hlad tým ve spolupráci s podnikem. Žádné stock fotky restaurací, žádné AI-generované „ilustrace toho, jak by to mohlo vypadat".
- **Žádné nepravdivé příběhy.** Příběh podniku je editorial — krátká pravdivá vinětka, ne marketingový text.
- **Žádné dietní claims bez ověření.** Vegan / vegetarián / bez lepku jen tam, kde to podnik výslovně garantuje a [Safety Guard Agent](../agents/safety-guard-agent.md) to projde.

---

## 3. Zvukový podpis

Velmi krátký, jemný zvukový efekt, který zazní **jen při explicitním otevření prémiového profilu** uživatelem. Slouží jako jemný „značkový moment" — podporuje atmosféru podniku, ne pozornost.

### Tvrdá pravidla

- **Délka 0,5–1,0 s.** Kratší než reklamní jingle, jiný formát.
- **Jemný, nerušivý.** Tlumený, žádné špičky hlasitosti.
- **Žádný reklamní jingle.** Bez melodické fráze, bez hlasu, bez slov.
- **Žádný hlasitý autoplay.** Hraje **jednou**, na otevření profilu, ne ve smyčce, ne při scroll-by, ne v náhledu, ne na pozadí.
- **Respektuje tichý režim zařízení.** Když má telefon vypnuté zvuky / je v tichém režimu, **nehraje vůbec**. Žádný haptic-only fallback, který by uživatele překvapil.
- **Vypnutelný v nastavení.** Globální přepínač „Zvuky profilu: zapnuto / vypnuto", default zapnuto. Volba se zapamatuje.
- **Nesmí působit manipulativně.** Žádné „dopaminové" zvuky typu coin/level-up, žádné notifikační upozornění typu push, žádné srdíčko, žádné lajk-sound.
- **Podporuje atmosféru podniku**, ne identitu Mám hlad. Mám hlad nemá vlastní brand jingle a nezavádí ho.

### Příklady (skicy, ne specifikace)

| Typ podniku | Charakter zvuku |
|---|---|
| **Kavárna** | Jemné cinknutí porcelánového šálku o talířek. |
| **Restaurace** | Měkké cinknutí příboru o sklenku — minimální, jednorázové. |
| **Street food** | Krátký teplý rytmický tón — tep místa, ne reklama. |
| **Fine dining** | Velmi jemný elegantní tón, na hraně slyšitelnosti. |

V každém případě: zvuk vybírá podnik z malé kurátorské knihovny, nedělá si vlastní. Tím se předejde tomu, že podnik vloží reklamní jingle nebo cizí značku.

### Co zvuk **nikdy** není

- ❌ Není to upozornění („otevřete tento profil!").
- ❌ Není to ozvěna interakce („super, otevřel jsi sponzora!").
- ❌ Není to A/B testovaný „engagement booster".
- ❌ Není to dárek od podniku („užijte si naši znělku").

---

## 4. Etická pravidla

Bez těchto pravidel by prémiový profil rozbil důvěru, na které Mám hlad stojí.

### Transparentnost

- Pokud má profil **propagační charakter** (placený rozšířený formát), aplikace to viditelně označí — jednoduchým, neutrálním štítkem. Žádné dark patterns, žádný malý šedý text dole.
- Označení se zobrazuje **vždy stejně**, ať podnik platí kolik chce.
- V seznamu doporučení **neexistuje** pozice typu „sponsored result above the fold". Pořadí dělá engine, ne peníze.

### Užitečnost pro uživatele

- Doporučení musí dál pomáhat **rozhodnout, co si dát teď**. Pokud prémiový blok přestane být užitečný a začne jen prodávat, je špatně postavený.
- Engine **neváží** prémiové podniky výš za to, že jsou prémiové. Vážíme relevanci pro uživatele.
- Pokud relevance říká, že prémiový podnik teď nesedí (zavřeno, daleko, neodpovídá náladě), **nezobrazí se**. Žádný „pojistný floor".

### Žádné lži

- ❌ **Žádné falešné recenze.** Mám hlad recenze nesbírá. Pokud někdy přibudou, prémiový status na ně nemá vliv.
- ❌ **Žádné nepravdivé fotky.** Žádné stock, žádné fotky z jiných podniků, žádné AI-generované „food porn" mockupy.
- ❌ **Žádné skryté ovlivňování.** Žádné A/B testy, které tlačí placeného partnera tam, kam by nepatřil.
- ❌ **Žádné fake „doporučujeme"** štítky pro placené podniky.

### Alergeny a zdravotní tvrzení

- Tato sekce **nemá výjimku pro prémiové profily.** Platí celé [`docs/food-data-safety.md`](../food-data-safety.md): aplikace nesmí tvrdit, že je jídlo bezpečné pro alergiky / celiaky / atd., pokud to podnik sám oficiálně nepotvrdil ověřeným procesem.
- [Safety Guard Agent](../agents/safety-guard-agent.md) prochází **každý** profil, prémiový i ne.
- Prémium **neznamená oprávnění** psát „bez lepku" / „vegan" / „detox" / „posiluje imunitu". Tato pravidla jsou tvrdší než kterýkoli partnerský vztah.

---

## 5. Technické poznámky pro budoucí implementaci

Tato sekce je pro budoucí inženýrské sprinty, ne pro aktuální pilot. **Nic z toho se teď nestaví.**

### Pořadí prací

1. **Nejdřív dokumentace a UX pravidla** (tento dokument + UX rozšíření až po validaci produktu).
2. **Pak rozšířená vizitka** — jídlo dne, slovo kuchaře, příběh, sezónní nabídka, fotky, video — bez zvuků.
3. **Až pak nastavení zvuku** — globální přepínač + respekt tichého režimu.
4. **Až pak zvukový podpis** — malá kurátorská knihovna, ne vlastní upload.

### Pravidla pro zvuky

- **Zvuk jen při explicitním otevření profilu**, ne při scroll-by, ne v náhledu, ne v seznamu doporučení.
- **Při skryté kartě (background)** — nehraje.
- **Při tichém režimu zařízení** — nehraje.
- **Default nastavení:** zvuky **zapnuto** (jemné a krátké, takže neruší), ale uživatelská volba má přednost a zapamatuje se mezi sessions.
- **Žádný auto-replay** při návratu na profil, který už uživatel viděl v aktuálním session — leda by ho zavřel a otevřel znovu po větší časové prodlevě (např. 5+ min).
- **Hlasitost** nastavena tak, aby na tlumeném prostředí nebyla rušivá — testuje se na minimálním systémovém zvuku.

### Telemetrie (až vznikne)

- Logujeme **pouze**: že zvuk hrál × nehrál (kvůli tichému režimu × kvůli vypnutí v nastavení). Nesbíráme identitu uživatele.
- Necíleně netracukjeme „kdo zvuk vypnul" — to je signál pro nás, ne pro podnik.

### Vazba na recommendation engine

- Recommendation engine **nesmí znát** prémiový status. Vstupy do skóre: chuť, čas, situace, lokace, dietní preference, otevírací doba, vzdálenost, tagy. **Konec.**
- Pokud někdy přidáme „prémiový boost" jako vstup, je to **prolomení** tohoto dokumentu a vyžaduje samostatné rozhodnutí + samostatný dokument.

### Vazba na agenty

- [Onboarding Agent](../agents/onboarding-agent.md) připravuje rozšířený profile draft stejně jako pro běžný profil; jen pracuje s víc bloky.
- [Safety Guard Agent](../agents/safety-guard-agent.md) prochází víc textu, tvrdá pravidla beze změny.
- [QA Agent](../agents/qa-agent.md) hlídá úplnost a konzistenci rozšířených bloků.
- Žádný agent **nesmí** přidat sám prémiový status, nastavit cenu nebo cokoli, co se týká obchodního vztahu. To je vždy člověk.

---

## Pravidlo poslední instance

Pokud někdy v budoucnu vznikne tlak (vlastní, investorský, partnerský) prolomit jedno z těchto pravidel, je správná odpověď **přepsat tento dokument první**, předem, otevřeně — ne to obejít implementací. Důvěra hladového člověka v Mám hlad je jediná věc, kterou nelze koupit zpět.

# Partnerský onboarding systém

Přesný proces toho, co se stane, když podnik klikne na **„Přidat podnik“** (microsite [`landing-site/`](../../landing-site/)) nebo nám napíše, že chce být mezi prvními partnery.

> **Status:** koncept + provozní šablona. V této fázi běží ručně přes e-mail. Doplňuje [`docs/PRODUCT_BRIEF.md`](../PRODUCT_BRIEF.md), [`docs/agents/README.md`](../agents/README.md), [`docs/food-data-safety.md`](../food-data-safety.md) a [`docs/product/premium-partner-profiles.md`](./premium-partner-profiles.md). Při sporu platí ty.

## 1. Princip

- Mám hlad **není katalog restaurací**.
- Mám hlad **buduje výběrového osobního průvodce jídlem pro Česko**.
- Podnik **nevstupuje do systému automaticky**. Žádné self-serve sign-up, žádný „instant listing“, žádné scrape-and-publish.
- Každý profil musí být **připraven, zkontrolován a explicitně schválen podnikem**, než ho někdo z aplikace uvidí.
- **Cílem je kvalita, ne objem.** Nemáme cíl mít tisíc podniků. Máme cíl mít v každém městě ta, která stojí za doporučení.

Tato pravidla jsou tvrdá. Vážou se na [Tři pravidla v `docs/agents/README.md`](../agents/README.md) („AI připravuje, člověk schvaluje, podnik potvrzuje“).

## 2. Onboarding flow

```
Zájem  →  Odpovědní e-mail  →  Sběr informací  →  AI návrh profilu
       →  Lidská kontrola  →  Schválení podnikem  →  Publikace
```

### Krok 1 — Podnik projeví zájem

- Kanál: kliknutí na `Chci přidat podnik` v microsite → otevře se klientovi mail na `wolf.bep@gmail.com` s předvyplněným předmětem; nebo přímá zpráva, doporučení od jiného podniku, vlastní oslovení.
- **Žádný self-serve formulář** v této fázi. Důvod: zájem si chceme přečíst lidsky a hned rozumět, jestli podnik zapadá do výběrového směru.

### Krok 2 — Krátký odpovědní e-mail

- Do **48 hodin v pracovní dny** odpovídá zakladatel osobně (ne agent).
- Obsah:
  - poděkování,
  - jasné vysvětlení, že jsme výběrový průvodce, ne katalog,
  - bez slibování umístění, bez slibu, že to bude rychlé,
  - prosba o 5–10 minut na získání základních informací (e-mail / hovor / krátký call).
- **Žádné PR fráze**, žádný marketingový tón.

### Krok 3 — Získání základních informací

- Strukturovaně se zeptáme na věci podle §3 níže. Buď e-mailem, nebo krátkým hovorem (zakladatel zapíše do strukturované formy).
- **Fotky:** přijímáme **jen ty, které podnik výslovně poskytl** a má k nim práva, nebo vznikly ve spolupráci s námi se souhlasem podniku. Žádný stock, žádné AI-generované „food porn mockupy“, žádné fotky z Google Maps bez souhlasu.
- **Alergeny:** sbíráme jen to, co podnik **sám aktivně potvrdí**. Default je „nezadáno“. Viz [`docs/food-data-safety.md`](../food-data-safety.md).

### Krok 4 — AI připraví návrh profilu

- Profile Draft Agent (viz §4) sestaví strukturovaný návrh z poskytnutých informací: vizitka, jídlo dne, doporučení kuchaře, příběh, vegetariánská/veganská/rychlá volba.
- **Nic z toho ještě není veřejné.** Návrh existuje jen v interním stagingu.

### Krok 5 — Lidská kontrola (Mám hlad strana)

- **Food Safety Guard** projde návrh kvůli alergenním a zdravotním tvrzením.
- **Tone & Brand Agent** projde návrh kvůli stylu (klidný, lidský, žádný marketingový tlak).
- **Human Reviewer** (zakladatel) projde **vše**: pravdivost, fotky, tón, sedí to k podniku.
- Pokud něco nesedí, vrací se to Profile Draft Agentovi k úpravě, nebo jdeme zpátky za podnikem upřesnit.

### Krok 6 — Schválení podnikem (Business Approval Gate)

- Hotový návrh **se ukáže podniku** — screenshot, PDF náhled, nebo později link do interního dashboardu.
- Podnik **musí explicitně schválit**. Žádné „implicitní schválení po 7 dnech mlčení“.
- Žádné publikování bez tohoto výslovného souhlasu. Pravidlo bez výjimky.

### Krok 7 — Publikace

- Profil se zveřejní.
- Podnik dostane zprávu „je to venku“ s odkazem.
- Stav leadu v interní evidenci: `published`.
- Update profilu (denní jídlo, sezónní volba) běží **stejným cyklem** — podnik posílá podklady, AI připraví draft změny, zakladatel zkontroluje, podnik potvrdí, jde to ven.

## 3. Jaké informace od podniku potřebujeme

Minimální vstup pro vznik profilu:

- **Název podniku**
- **Město** (a čtvrť, pokud dává smysl)
- **Typ kuchyně / formát** — bistro, kavárna, restaurace, street food, atd.
- **3–5 jídel, která stojí za doporučení** — ne celé menu, výběr
- **Jedno jídlo dne / signature dish** — to, co podnik sám označí jako tip
- **Doporučení kuchaře** — krátký text od člověka, který to vaří
- **Vegetariánská / veganská / rychlá volba** — jeden konkrétní tip v každé kategorii, kde to dává smysl
- **Otevírací doba**
- **Kontakt** (e-mail, případně telefon)
- **Fotky** — pouze vlastní podniku nebo výslovně schválené podnikem
- **Alergeny / dietní claims** — pouze bezpečně a ověřeně; jinak nezadáno (viz `docs/food-data-safety.md`)

Volitelně (zvyšuje kvalitu profilu):

- Příběh podniku — krátká pravdivá vinětka, ne marketingový text.
- Důvod, proč přijít právě sem — jedna věta.
- Sezónní nabídka.
- Krátké video (5–15 s), pokud existuje.
- Pro prémiový profil: jemný zvukový podpis (viz [`premium-partner-profiles.md`](./premium-partner-profiles.md)).

**Co NESBÍRÁME automaticky a bez vědomí podniku:**

- Recenze odjinud (Google, TripAdvisor, atd.).
- Fotky odjinud.
- Údaje, které nejsou nezbytné pro vznik profilu.

## 4. Role AI agentů

Žádný z agentů nikdy nepublikuje, neodesílá zprávy podnikům ani nemění data v produkci. Vše vrací jako návrh k lidskému schválení. Detaily v [`docs/agents/`](../agents/) a [`docs/launch-system/model-agnostic-agents.md`](../launch-system/model-agnostic-agents.md).

| Agent | Role |
|---|---|
| **Intake Agent** | Zpracuje první zprávu od podniku — z e-mailu vytáhne kdo, odkud, jaký typ podniku, co chce; připraví krátké briefing zakladateli; navrhne, jestli odpovědět hned, nebo se nejdřív zeptat doplňujícím dotazem. Nic neodesílá. |
| **Profile Draft Agent** | Z poskytnutých informací sestaví strukturovaný návrh profilu (vizitka, jídlo dne, doporučení kuchaře, příběh, sezónní nabídka). Pracuje jen s tím, co podnik aktivně dodal — nedoplňuje fakta z internetu, nevymýšlí. |
| **Food Safety Guard** | Kontroluje alergenní, zdravotní a dietní tvrzení (vegan / vegetarián / bez lepku / detox / posiluje imunitu …). Pravidla jsou v [`docs/agents/safety-guard-agent.md`](../agents/safety-guard-agent.md) a [`docs/food-data-safety.md`](../food-data-safety.md). Bez výjimky pro prémiové profily. |
| **Tone & Brand Agent** | Hlídá jazyk a styl Mám hlad: klidný, lidský, krátké české texty, žádný marketingový tlak, žádné superlativy („nejlepší“, „světoznámý“), žádné cizí buzzwordy. Vrací redline návrhy, ne hotový text. |
| **Human Reviewer** | Poslední lidská kontrola před tím, než návrh jde podniku. Pravdivost, kontext, vhodnost. Tento krok nelze přeskočit. |
| **Business Approval Gate** | Podnik **musí** explicitně schválit. Není to agent, je to fáze: bez schválení žádná publikace. Druhá zeď, kterou nelze obejít. |

Žádný agent nepřepisuje verdikt jiného. Pokud Food Safety Guard řekne „blok“, profil nejde ven, dokud se problém nevyřeší.

## 5. Zakázané věci

Tvrdá pravidla. Bez výjimky.

- ❌ **Žádné automatické publikování.** Publikuje jen člověk po Business Approval Gate.
- ❌ **Žádné fake fotky.** Žádný stock, žádné AI-generované fotky jídel, žádné fotky převzaté odjinud bez souhlasu.
- ❌ **Žádné neověřené zdravotní claimy.** Žádné „vhodné pro celiaky“, „detox“, „vyléčí“, „posiluje imunitu“. Viz `docs/food-data-safety.md`.
- ❌ **Žádné falešné recenze.** Mám hlad recenze nesbírá; pokud někdy přibudou, partnerství je neovlivní.
- ❌ **Žádné „sponsored top of the list“.** V seznamu doporučení neexistuje placená pozice nad výsledky.
- ❌ **Žádné slibování umístění ve výsledcích jen za peníze.** Pořadí dělá recommendation engine podle relevance.
- ❌ **Žádné publikování bez schválení podniku.** Žádné implicitní schválení mlčením.

## 6. Budoucí implementace

Tato sekce je orientační. **V této fázi vše běží ručně přes e-mail** a strukturovanou interní evidenci u zakladatele.

### Fáze A — Ruční (teď)

- Příjem zájmu: e-mail na `wolf.bep@gmail.com`.
- Evidence leadů: jednoduchá strukturovaná tabulka (spreadsheet) u zakladatele.
- AI agenti běží ad-hoc přes Claude Code / chat — nikoli na pozadí.
- Schválení podniku: screenshot/PDF e-mailem nebo WhatsAppem.

Tahle fáze stačí, dokud nemáme řádově desítky leadů týdně.

### Fáze B — Webový formulář

- Krátký formulář v microsite jako alternativa k mailto:
  - jméno, podnik, město, telefon (volitelně), krátká zpráva,
  - explicitní souhlas se zpracováním kontaktu.
- Formulář **nedělá nic víc** než pošle e-mail / zapíše lead. Žádný auto-listing.
- CTA „Chci přidat podnik“ může vést buď na mailto (jako teď), nebo na formulář — podle toho, co bude lépe fungovat.

### Fáze C — Interní dashboard + Supabase

Až bude objem, postavit lehký interní dashboard nad Supabase. **Není uživatelská appka pro podniky — je to provozní nástroj Mám hlad týmu.**

**Tabulka `partner_leads` (návrh schématu):**

| Sloupec | Typ | Poznámka |
|---|---|---|
| `id` | uuid (PK) | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `business_name` | text | |
| `city` | text | |
| `region` | text | nullable |
| `contact_email` | text | |
| `contact_phone` | text | nullable |
| `source` | text | `microsite_mailto`, `microsite_form`, `referral`, `direct` |
| `inbound_message` | text | původní zpráva podniku |
| `status` | text | viz níže |
| `assigned_to` | text | kdo lead drží (zatím vždy zakladatel) |
| `notes` | text | interní poznámky |
| `business_approval_at` | timestamptz | nullable — kdy podnik explicitně schválil |
| `published_at` | timestamptz | nullable |

**Stav leadu (`status`):**

```
new            → přijatý zájem, ještě jsme neodpověděli
contacted      → odpověděli jsme, čekáme na informace
draft_ready    → AI připravila návrh profilu, čeká na lidskou kontrolu
business_review → návrh je u podniku ke schválení
approved       → podnik explicitně schválil, ještě nepublikováno
rejected       → lead nepokračuje (z jakékoli strany)
published      → profil je live
```

Možné přechody jsou jednosměrné v happy path (`new → contacted → draft_ready → business_review → approved → published`), s libovolným přechodem do `rejected`. Žádný automatický posun do `approved` — pouze ručně po obdržení souhlasu.

**Možnost připojit fotky:** ke každému leadu lze připojit soubory v Supabase Storage. Bucket je **private**, default přístup jen pro interní tým. Žádné veřejné URL bez explicitního zapnutí pro daný profil.

**Audit log schválení:**

Samostatná tabulka `partner_approval_log` zaznamenává každé schválení / odmítnutí:

| Sloupec | Typ |
|---|---|
| `id` | uuid |
| `lead_id` | uuid (FK → partner_leads) |
| `at` | timestamptz |
| `actor` | text — `business` / `human_reviewer` / `food_safety_guard` / `tone_brand_agent` |
| `decision` | text — `approved` / `redline` / `rejected` |
| `evidence` | text — kde je důkaz (screenshot, e-mail, dashboard akce) |
| `notes` | text |

Audit log je **append-only** — žádné editace, žádné mazání. Když někdo později řekne „já jsem to neschválil“, máme doklad.

## 7. Vztah k prémiovým profilům

Onboarding flow je **stejný** pro běžný i prémiový profil. Detaily prémiového profilu řeší [`premium-partner-profiles.md`](./premium-partner-profiles.md).

Pravidla, která platí napříč oběma dokumenty:

- **Prémiový status nesmí ovlivnit relevance ranking.** Žádný „prémiový boost“ v engine.
- **Recommendation engine nesmí znát prémiový status.** Vstupy zůstávají: chuť, čas, situace, lokace, dietní preference, otevírací doba, vzdálenost, tagy. Konec.
- **Žádné „sponsored top of the list“.** Platí jak pro onboarding, tak pro prezentaci.
- **Food Safety Guard prochází každý profil**, prémiový i ne.

Pokud někdy v budoucnu vznikne tlak prolomit kterékoli z těchto pravidel, správná odpověď je nejdřív **přepsat tento dokument a [`premium-partner-profiles.md`](./premium-partner-profiles.md)** — předem, otevřeně. Ne to obejít implementací.

## Pravidlo poslední instance

Onboarding není kanál, kterým by někdo mohl něco propašovat. Mám hlad stojí na tom, že hladový člověk dostane užitečné doporučení, a podnik, že to, co je o něm napsané, schválil. Kdyby přišel den, kdy by se kvůli rychlosti nebo objemu chtělo „jen tentokrát“ něco z těchto kroků vynechat, je odpověď: ne. Důvěra hladového člověka i podniku je věc, kterou nelze koupit zpět.

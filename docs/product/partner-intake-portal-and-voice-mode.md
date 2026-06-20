# Partner Intake Portal & Voice Mode

Produktový a technický koncept pro **budoucí onboarding partnera** v Mám hlad. Definuje, jak má vypadat zápis nového podniku, až se posuneme od „dočasného mailto fallbacku“ k cílovému řešení s formulářem, hlasovým vstupem a AI agenty.

> **Status:** koncept + cílový stav. Nemění aktuální [`landing-site/join.html`](../../landing-site/join.html). Implementace přijde, až bude validovaný objem a workflow. Doplňuje [`partner-onboarding-system.md`](./partner-onboarding-system.md), [`partner-intake-templates.md`](./partner-intake-templates.md), [`premium-partner-profiles.md`](./premium-partner-profiles.md) a [`docs/food-data-safety.md`](../food-data-safety.md). Při sporu platí ony.

---

## 1. Problém

Aktuální onboarding stojí na tom, že podnik nám napíše e-mail. To je v pořádku pro prvních pár desítek partnerů — zakladatel si přečte, osobně odpovídá, sbírá informace v dialogu. Není to ale udržitelné cílové řešení.

Co reálně víme o lidech, které chceme oslovit:

- **Kuchaři a provozní nemají čas psát dlouhé e-maily.** Pracují na nohou, večer doma jsou vyčerpaní. Strukturovaný text s 14 odrážkami pro ně není přirozený formát.
- **Lidé jsou unavení a nechtějí vyplňovat dlouhé formuláře.** Zejména ne formuláře, které vypadají jako registrace do služby.
- **Pokud je onboarding složitý, kvalitní podniky odpadnou.** Paradoxem je, že nejlepší kuchaři jsou typicky nejvíc vytížení — bariéra vstupu odsekává přesně ty, které nejvíc chceme.
- **Současné mailto řešení je dočasný první krok, ne cílový systém.** Funguje pro Fázi A onboardingu (viz [`partner-onboarding-system.md`](./partner-onboarding-system.md) §6); cíl je něco jiného.

### Co tím chceme říct

> Cílový onboarding má být co nejjednodušší pro kuchaře, provozní a majitele podniků. Nemají psát dlouhé e-maily. Mají buď vyplnit krátký formulář, nebo nahrát / nadiktovat informace hlasem. AI agent z toho připraví návrh profilu.

Tento dokument popisuje, jak tam pojďme dojít.

---

## 2. Cílový flow

```
Podnik klikne „Přidat podnik“ (landing-site/join.html)
  │
  ▼
Krátké vysvětlení: co se stane, mlčení není souhlas
  │
  ▼
Volba jedné ze 3 cest:
  ├── a) Krátký formulář   ── low friction, vyplní co stihne
  ├── b) Hlasová zpráva    ── 1–3 min, mluví přirozeně
  └── c) E-mail (fallback) ── pro lidi, kteří preferují volný text
  │
  ▼
AI Intake Agent     ── normalizuje vstup, vyrobí pracovní záznam
  │
  ▼
AI Profile Draft Agent ── návrh profilu (vizitka, jídlo dne, slovo kuchaře…)
  │
  ▼
Food Safety Guard   ── alergeny, dietní a zdravotní tvrzení
  │
  ▼
Tone & Brand Agent  ── styl Mám hlad (klid, vykání, žádné superlativy)
  │
  ▼
Human Reviewer      ── zakladatel projde návrh (pravdivost, kontext)
  │
  ▼
Business Approval Gate ── návrh jde podniku
  │
  ▼
Podnik potvrdí / upraví / odmítne
  │
  ▼
Až po výslovném schválení → profil jde ven
```

Tři pravidla, která platí pro **každou** cestu (formulář / hlas / e-mail):

1. **AI připravuje, člověk schvaluje, podnik potvrzuje.** ([`docs/agents/README.md`](../agents/README.md))
2. **Mlčení není souhlas.** Bez výslovného „v pořádku, můžete zveřejnit“ se nic nepublikuje.
3. **AI nevymýšlí.** Pokud podnik něco neřekl, AI to nedoplní z internetu „aby to bylo úplné“.

---

## 3. Krátký formulář

### Design intent

Formulář **nesmí působit jako administrativa**. Musí působit jako:

> „Řekněte nám pár věcí, my z toho připravíme návrh.“

Pro to je nutné:

- **Málo polí.** Méně než deset viditelných na úvodu, zbytek volitelně.
- **Vše volitelné kromě 2–3 minimálních identifikačních polí.** Nikdy nezablokovat submit kvůli prázdnému poli „cenová hladina“.
- **Volný text místo dropdownů**, kde to dává smysl (popisy jídla, slovo kuchaře). Lidský jazyk je hodnota.
- **Bez „registrace“, hesla, povinné autentizace.** Žádný účet. Jen e-mail jako kontakt.
- **Bez „captchy“ na první verzi.** Pokud přijde spam, řešíme jinde (rate limit, e-mail verification later).
- **Mobile-first.** Většina vyplnění proběhne na telefonu mezi obědem a večerem.

### Pole

| Pole | Typ | Povinné | Poznámka |
|---|---|---|---|
| Název podniku | text | ✅ | |
| Město | text | ✅ | autocomplete CZ města později |
| Typ kuchyně | text (volný) | — | bistro, kavárna, restaurace, street food… |
| Kontakt (jméno + e-mail) | text + email | ✅ | telefon volitelně |
| Web / Instagram / Google Maps | text (libovolný odkaz) | — | jedno, dvě, tři — co podnik má |
| 3 jídla, která stojí za doporučení | 3× text | — | každé pole 0–200 znaků |
| Jedno jídlo, na které jsou hrdí | text | — | signature dish, „kdyby jen jedno“ |
| Co by řekl kuchař hostovi | textarea | — | 2–3 věty stačí, volný jazyk |
| Vegetariánská / veganská / rychlá volba | 3× text | — | „nemáme“ je v pořádku |
| Fotky | upload (volitelně) | — | „přidat fotky později“ jako jasná alternativa |
| Alergeny | text / checkbox **jen pokud podnik výslovně potvrdí** | — | default „nezadáno“ |

### Co formulář NEdělá

- ❌ Nezveřejňuje profil okamžitě. **Tlačítko se nejmenuje „Publikovat“.** Jmenuje se „Poslat zájem“.
- ❌ Nevynucuje „kompletnost“. Polovinu polí vynechat je v pořádku.
- ❌ Nevynucuje vlastnictví. Podnik nepotvrzuje, že je „oprávněn zastupovat“ — jednání s vlastníkem řešíme v lidském review.
- ❌ Nepřidává ToS check box před submitem. Aplikace v této fázi nemá ToS. Co podnik souhlasí, je „my připravíme návrh a pošleme vám ho ke schválení“ — to je v textu nad tlačítkem.

### Texty kolem tlačítka

Nad submit:
> Pošleme Vám zpátky návrh profilu ke schválení. Bez Vašeho výslovného souhlasu nic nezveřejníme.

Tlačítko:
> Poslat zájem

Pod tlačítkem:
> Mlčení není souhlas. Profil publikujeme pouze po Vašem výslovném schválení.

---

## 4. Hlasový mód

### Koncept

Pro mnoho lidí je rychlejší **mluvit** než psát. Hlasový mód proto nabízíme jako rovnocennou alternativu k formuláři.

- Podnik nahraje **1–3 minuty hlasu** přímo z telefonu (`<input type="file" accept="audio/*" capture>` nebo `MediaRecorder API`).
- Může mluvit přirozeně — žádná struktura, žádné odrážky. Jen odpoví na pár otázek, které mu portál ukáže.
- AI hlas přepíše na text (transkripce), vytáhne strukturovaná data a vytvoří první návrh profilu.
- Člověk / agent označí nejasnosti k ověření a vrátí podniku doplňující otázky.
- **Audio se nepoužije veřejně bez souhlasu.** Slouží jen jako interní vstup pro draft. Pokud chceme někdy publikovat (např. „slovo kuchaře audio“), je to **samostatné** rozhodnutí podniku, ne automaticky.

### Příklady otázek pro hlas (prompty na obrazovce)

Portál ukáže během nahrávání postupně tyto otázky (jako titulky, neruší řeč):

1. **Co vaříte nejraději?**
2. **Kvůli čemu se k vám lidé vrací?**
3. **Jaké jedno jídlo byste doporučili člověku, který je u vás poprvé?**
4. **Co by o tom jídle řekl kuchař?**
5. **Máte rychlou, vegetariánskou nebo cestovatelskou volbu?**

Podnik nemusí odpovědět na všechny. AI z toho, co řekl, vytáhne, co jde.

### Pravidla pro hlasový vstup

- **Stop kdykoli.** Krátký kontrolní přehled „nahrávám 0:42“, tlačítko stop, možnost znovu.
- **Žádné rozpoznávání řečníka.** Voiceprint, identifikace osoby, biometrie — **nic z toho**.
- **Žádné uložení mimo nás.** Audio se ukládá do našeho privátního úložiště (Supabase Storage, bucket private). Žádný third-party transcription service, který by si nahrávku ponechal pro trénink — viz §5 (Voice Transcript Agent — co nesmí).
- **Retention podle nutnosti.** Po vyrobení draftu se audio drží **max 90 dnů**, pak se mažou (lze prodloužit jen pokud podnik výslovně potvrdí).
- **AI nesmí napodobit hlas.** Nevyrábíme syntetický „hlas kuchaře“ ze sebraného materiálu. Pokud někdy bude prémiový profil chtít audio od kuchaře, je to reálná nahrávka se schválením, ne klon.

---

## 5. AI agenti

Konzistentní s rolemi v [`partner-onboarding-system.md`](./partner-onboarding-system.md) §4 a [`docs/launch-system/model-agnostic-agents.md`](../launch-system/model-agnostic-agents.md). Žádný agent nezveřejňuje ani neodesílá podniku — vše prochází lidským reviewem a Business Approval Gate.

### Intake Agent

- **Vstup:** odeslaný formulář / surová audio nahrávka / e-mailová zpráva.
- **Výstup:** strukturovaný `partner_intake_responses` záznam s normalizovanými poli + flag, který kanál to byl.
- **Smí:** detekovat zjevně duplicitní lead, navrhnout assignee, vyrobit briefing pro zakladatele.
- **Nesmí:** odpovídat podniku, posílat potvrzovací e-maily, mazat lead.

### Voice Transcript Agent

- **Vstup:** audio soubor.
- **Výstup:** textový transkript + případně timestamps + flag jazyka.
- **Smí:** používat self-hosted nebo on-device transcription (Whisper lokálně nebo přes hostovaný endpoint v naší kontrole). Pokud používáme externí API, musíme mít smlouvu, kde provider **nepoužije** audio pro trénink.
- **Nesmí:** uložit audio k třetí straně bez nutnosti, sdílet s providery LLM (mimo náš pipeline), používat „free tier“ služby, jejichž ToS dovoluje trénink na našich datech.

### Structured Extraction Agent

- **Vstup:** transkript / formulářová pole / e-mailový text.
- **Výstup:** strukturovaný JSON s poli (název podniku, jídla, slovo kuchaře, dietní volby, atd.) + confidence per pole + seznam nejasností.
- **Smí:** označit prázdná pole, navrhnout doplňující otázky podniku.
- **Nesmí:** doplňovat fakta, která podnik neřekl. Když podnik nezmínil cenovou hladinu, agent ji **nehádá** z typu kuchyně. Default je „nezadáno“.

### Profile Draft Agent

- **Vstup:** strukturovaný JSON z Extraction Agenta.
- **Výstup:** návrh profilu v cílovém formátu (vizitka, jídlo dne, slovo kuchaře, vegetariánská/veganská/rychlá volba, příběh, …).
- **Smí:** přeformulovat na editorial styl Mám hlad, navrhnout pořadí jídel, vyrobit krátký „důvod přijít“.
- **Nesmí:** vymyslet nová jídla, citovat kuchaře větami, které neřekl, doplnit fotky odjinud.

### Food Safety Guard

- **Vstup:** návrh profilu.
- **Výstup:** verdikt `pass` / `needs_redline` / `hard_block` + redline návrhy.
- **Smí:** redline-ovat zdravotní claimy, alergenní tvrzení, dietní booleany.
- **Nesmí:** schválit profil. Pravidla z [`docs/food-data-safety.md`](../food-data-safety.md) platí bez výjimky pro běžný i prémiový profil.

### Tone & Brand Agent

- **Vstup:** návrh profilu po Food Safety Guard.
- **Výstup:** redline návrhy na styl (klid, vykání, žádné superlativy, žádný marketingový tlak, žádné anglické buzzwordy).
- **Smí:** navrhnout přeformulace.
- **Nesmí:** přepsat fakta. Pokud kuchař řekl „peče se 6 hodin“, agent to nepřepisuje na „pomalu připravované“ jen kvůli stylu.

### Human Reviewer

- **Vstup:** návrh profilu po Tone & Brand.
- **Výstup:** „připraveno poslat podniku“ nebo zpět ke konkrétnímu agentovi s poznámkou.
- **Smí:** ručně přepsat cokoli, zavolat podniku, vrátit lead do `needs_clarification`.
- **Nesmí:** publikovat. Není to Approval Gate.

### Business Approval Gate

- **Vstup:** návrh profilu schválený Human Reviewerem.
- **Výstup:** explicitní souhlas / úprava / odmítnutí od podniku, zaznamenané v audit logu.
- **Smí:** být reprezentován různými technikami (link s tlačítkem, e-mail s textovou odpovědí, telefonát zaznamenaný v poznámce).
- **Nesmí:** být obejit. **Mlčení není souhlas.** Žádný „pokud do 7 dnů neodpovíte, bereme to jako schválení“.

---

## 6. Datový model (pro budoucí Supabase)

### Tabulky

#### `partner_leads`

Hlavní záznam o zájmu, jeden řádek na podnik.

| Sloupec | Typ | Poznámka |
|---|---|---|
| `id` | uuid (PK) | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `business_name` | text | |
| `city` | text | |
| `contact_email` | text | |
| `contact_name` | text | nullable |
| `contact_phone` | text | nullable |
| `source` | text | `form` / `voice` / `email` / `referral` / `direct` |
| `status` | text | viz §6 stavy |
| `assigned_to` | text | zakladatel v Pilotu 0 |
| `notes` | text | interní |

#### `partner_intake_responses`

Surové vstupy od podniku — co poslal v každé interakci. Lead může mít víc responses (formulář + doplňující e-mail).

| Sloupec | Typ |
|---|---|
| `id` | uuid (PK) |
| `lead_id` | uuid (FK → partner_leads) |
| `received_at` | timestamptz |
| `channel` | text — `form` / `voice` / `email` |
| `raw_payload` | jsonb — pole formuláře / e-mailový text / metadata |
| `transcript` | text — pro hlas, null jinak |
| `language` | text — `cs` default |

#### `partner_profile_drafts`

Verze návrhu profilu. Append-only — nikdy se nemažou ani nepřepisují, novou verzí se přidává řádek.

| Sloupec | Typ |
|---|---|
| `id` | uuid (PK) |
| `lead_id` | uuid (FK) |
| `version` | int — 1, 2, 3, … |
| `created_at` | timestamptz |
| `created_by` | text — `profile_draft_agent` / `human_reviewer` / `business_revision` |
| `payload` | jsonb — celá vizitka |
| `safety_verdict` | text — `pass` / `needs_redline` / `hard_block` |
| `tone_verdict` | text — `pass` / `needs_redline` |
| `notes` | text |

#### `partner_approval_log`

Audit log každé schvalovací akce. Append-only, žádné editace.

| Sloupec | Typ |
|---|---|
| `id` | uuid (PK) |
| `lead_id` | uuid (FK) |
| `draft_id` | uuid (FK → partner_profile_drafts) |
| `at` | timestamptz |
| `actor` | text — `business` / `human_reviewer` / `food_safety_guard` / `tone_brand_agent` |
| `decision` | text — `approved` / `redline` / `rejected` |
| `evidence` | text — kde je důkaz (screenshot, e-mail, link) |
| `notes` | text |

#### `partner_media_assets`

Fotky, audio, případně video. **Bucket je privátní.** Veřejně přístupné jen explicitně přepnuté.

| Sloupec | Typ |
|---|---|
| `id` | uuid (PK) |
| `lead_id` | uuid (FK) |
| `kind` | text — `photo` / `voice_recording` / `video` |
| `storage_path` | text |
| `provided_by` | text — `business` / `team_with_consent` |
| `consent_for_publication` | boolean — default `false` |
| `retention_days` | int — default 90 pro voice, ∞ pro photo |
| `created_at` | timestamptz |
| `deleted_at` | timestamptz nullable |

### Stavy leadu (`partner_leads.status`)

```
new              → přijatý zájem (jakkoli), ještě jsme neodpověděli
intake_started   → podnik začal vyplňovat formulář / nahrávku, ještě neodeslal
intake_submitted → kompletní vstup přijat (kterýmkoli kanálem)
ai_draft_ready   → AI připravila návrh, čeká na Food Safety Guard / Tone & Brand
needs_clarification → AI nebo human reviewer chtějí od podniku doplnění
human_review     → návrh prošel agenty, čeká na finální lidský pohled
business_review  → návrh je u podniku ke schválení
approved         → podnik schválil; ještě nepublikováno
rejected         → lead skončil (z jakékoli strany), důvod v notes
published        → profil je live
```

Happy path: `new → intake_submitted → ai_draft_ready → human_review → business_review → approved → published`.
Možné odbočky kdykoli: `needs_clarification` (zpět k podniku), `rejected` (konec).
**Žádný automatický přechod do `approved`.** Pouze ručně po doložení souhlasu v `partner_approval_log`.

---

## 7. Etické a bezpečnostní zásady

Tato pravidla platí napříč formulářem, hlasem i e-mailem. Bez výjimky.

- ❌ **Nic se nepublikuje bez výslovného souhlasu podniku.**
- ❌ **Mlčení není souhlas.** Žádné implicitní schválení „když do 7 dnů neodpoví“.
- ❌ **AI nesmí vymýšlet fakta.** Když podnik něco neřekl, agent to nedoplní.
- ❌ **Nejasnosti se musí označit.** Confidence < N → vrátit na `needs_clarification`, ne hádat.
- ❌ **Žádné fake fotky.** Žádné stock, žádné AI-generované „food porn“ mockupy, žádné cizí fotky.
- ❌ **Žádné fake recenze.** Mám hlad recenze nesbírá; pokud někdy přibudou, intake je neovlivní.
- ❌ **Žádné neověřené alergeny.** Default „nezadáno“. Viz [`docs/food-data-safety.md`](../food-data-safety.md).
- ❌ **Žádné zdravotní claimy.** Žádné „detox“, „posiluje imunitu“, „vhodné pro celiaky“.
- ❌ **Prémiový status nesmí ovlivnit recommendation engine.** Engine nezná, kdo je prémiový. Viz [`premium-partner-profiles.md`](./premium-partner-profiles.md).

A pro hlasový mód navíc:

- ❌ Žádné rozpoznávání řečníka, voiceprint, biometrie.
- ❌ Žádné syntetické klonování hlasu.
- ❌ Žádný third-party transcription provider, který si nahrávku ponechá pro trénink.
- ✅ Retention 90 dnů pro voice, mazat automaticky po expiraci.

---

## 8. Dopad na současnou `landing-site/join.html`

- **`join.html` zůstává jako vstupní stránka.** Není potřeba ji rušit, naopak — je to dobrý kontext (vysvětluje, co se stane).
- **Teď může mít e-mail fallback.** Aktuální mailto CTA jsou v pořádku jako Fáze A.
- **Další implementační krok bude změnit ji na form-first / voice-friendly vstup.** E-mail zůstane jako třetí možnost.
- **E-mail nesmí být dlouhodobě hlavní cesta.** Cíl je, aby více než půlka leadů přicházela přes formulář nebo hlas.

### Implementační milníky (orientačně)

1. **Tento dokument** schválen → zarámujeme vizi.
2. **Validace zájmu** — počkat na prvních 10–20 leadů přes mailto, ověřit, kolik kuchařů reálně odpovídá a co píší. Pokud se ukáže „píšou tři věty“, formulář je správný směr.
3. **Form-first verze `join.html`** — nahradit primary CTA „Poslat zájem“ formulářem inline, mailto degraduje na alternativní odkaz pod formulářem.
4. **Voice mód** — přidat tlačítko „Raději mluvit než psát“, otevře záznamník v prohlížeči. Vyžaduje Supabase Storage + transcription pipeline.
5. **Interní dashboard** — vidět leadů, draftů, stavů, audit logu na jednom místě.

---

## Pravidlo poslední instance

Onboarding portál a hlasový mód mají **udělat vstup snazší**, ne obejít pravidla. Když by se kdykoli v budoucnu řeklo „pro rychlost přeskočíme Business Approval Gate, máme přece audio“, je odpověď: ne. Hlas a formulář jsou kanály vstupu, ne zkratky kolem souhlasu. Mlčení není souhlas. Audio není souhlas. Vyplněný formulář není souhlas. Souhlas je explicitní „v pořádku, můžete zveřejnit“ od podniku.

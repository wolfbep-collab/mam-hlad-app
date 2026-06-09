# Pilot 0 — Agentní workflow

Krok-po-kroku, kdo (člověk / agent / podnik) dělá co. Vše v duchu pravidla: **AI připravuje, člověk schvaluje, podnik potvrzuje.**

## Mapa rolí

| # | Krok | Provádí | Žádný auto-pass dál |
|---|---|---|---|
| 1 | Výběr podniku z target-list | **Člověk (zakladatel)** | — |
| 2 | Příprava první zprávy (varianta A) | **Outreach Agent** | ⛔ ne, k schválení |
| 3 | Odeslání zprávy | **Člověk** (manuálně z telefonu) | — |
| 4 | Odpověď podniku | **Podnik** | — |
| 5 | 10minutový rozhovor + voice memo + foto | **Člověk** | — |
| 6 | Přepis voice memo + draft profilu | **Onboarding Agent** | ⛔ ne, k Safety Guard |
| 7 | Bezpečnostní kontrola (alergeny, claims) | **Safety Guard Agent** | ⛔ ne, k QA |
| 8 | Kontrola úplnosti a kvality | **QA Agent** | ⛔ ne, k člověku |
| 9 | Lidská revize draftu | **Člověk** | — |
| 10 | Příprava screenshot zprávy (varianta C) | **Outreach Agent** | ⛔ ne, k schválení |
| 11 | Odeslání screenshotu podniku | **Člověk** | — |
| 12 | Podnik schválí / požádá o úpravu | **Podnik** | — |
| 13 | Případná oprava (1–2 kola) | **Člověk + Onboarding Agent** | — |
| 14 | Push profilu live | **Člověk** (PR do `demoPlaces.ts`) | — |

Symbol ⛔ = **human-in-the-loop gate**. Žádný agentní výstup nepřechází k dalšímu kroku bez výslovné akce zakladatele.

---

## Detail krok po kroku

### 1. Výběr podniku (člověk, 5 min)

- Otevřít `docs/pilot-0/target-list-template.csv`.
- Vybrat řádek se statusem `new` a vysokou prioritou.
- Update status → `contacted` (až po odeslání zprávy v kroku 3).

### 2. Outreach Agent → draft zprávy (agent, ~30 vteřin)

- Vstup: řádek z CSV + veřejný kontext (IG bio, web).
- Výstup: draft varianty A (první kontakt) podle pravidel v `outreach-agent.md`.
- Agent flaguje risk signals (např. „je to franchise, doporučuji vyřadit").

**Lidský gate:** zakladatel přečte, případně edituje, kopíruje do WhatsApp / IG.

### 3. Odeslání zprávy (člověk, 1 min)

- Manuálně z osobního telefonu nebo IG účtu.
- Žádná automatická integrace.
- Update CSV: `last_contacted_at`, `next_action` = „čekat 48 h".

### 4. Odpověď podniku (externí, 0–7 dnů)

Možné scénáře:
- **Ano, přijďte** → krok 5.
- **Ne** → CSV status `rejected`, Outreach Agent připraví variantu D (poděkování), zakladatel pošle.
- **Žádná odpověď do 48 h** → Outreach Agent připraví follow-up (varianta B), zakladatel pošle.
- **Žádná odpověď do 7 dnů** → CSV status `rejected`, posun na další podnik.

### 5. Rozhovor + voice memo + foto (člověk, 10–15 min)

- Použít `docs/pilot-0/onboarding-script.md` (10 otázek).
- Nahrávat voice memo (se souhlasem podniku).
- Vyfotit menu (papírové i web) a 3 jídla.
- Uložit GPS pin (Google Maps share).
- Update CSV: status → `interview_done`.

### 6. Onboarding Agent → draft profilu (agent, ~5 min)

- Vstup: voice memo transcript, fotky, GPS, veřejná data.
- Výstup: vyplněný `business-data-template.md`:
  - 3 jídla s popisy, cenami, tagy
  - Návrh chef card (pokud z rozhovoru vyplynula)
  - Návrh denního doporučení (otázka 4)
  - Návrh popisu podniku (40 slov)
  - FLAGY pro nejasná pole
- Agent **nesmí** vyplnit alergeny.

### 7. Safety Guard Agent → redline (agent, ~1 min)

- Vstup: profile draft.
- Výstup: pass / needs_redline / hard_block + konkrétní seznam redlines.
- Kontroluje:
  - Žádné strukturované alergeny / glutenInfo
  - Žádné implicitní health claims
  - Konzistence dietary booleanů s popisem
  - Žádné texty typu „bez lepku", „bezpečné pro celiaky"

**Lidský gate (jen v případě hard_block):** zakladatel buď opraví / pošle zpět do Onboarding Agenta, nebo si vysvětlí s podnikem.

### 8. QA Agent → completeness check (agent, ~1 min)

- Vstup: profile draft po Safety Guardovi.
- Výstup: pass A/B/C nebo fail + seznam co opravit.
- Kontroluje úplnost povinného checklistu + kvalitu textu + číselné konzistence.

### 9. Lidská revize draftu (člověk, 5–10 min)

- Zakladatel projde profil, přečte popisy nahlas.
- Zhodnotí, jestli zní jako podnik mluví.
- Provede úpravy (drobné texty, výběr varianty popisu).
- Připraví screenshot 1–2 obrazovek z aplikace (na reálném telefonu).
- Update CSV: status → `profile_draft`.

### 10. Outreach Agent → screenshot zpráva (agent, ~30 vteřin)

- Vstup: profile draft + screenshoty.
- Výstup: draft varianty C (screenshot ke schválení) podle `whatsapp-messages.md`.
- Vrátí text personalizovaný na základě obsahu profilu.

**Lidský gate:** zakladatel zkontroluje, případně edituje, kopíruje do WhatsApp / IG.

### 11. Odeslání screenshotu podniku (člověk, 2 min)

- Připojit 2 screenshoty + text varianty C.
- Posílat mezi 14–16 h.
- Update CSV: status → `waiting_approval`.

### 12. Podnik schválí (externí, 0–48 h)

Možné scénáře:
- **Schvaluje** → krok 14.
- **Žádá o úpravu** → krok 13.
- **Neodpovídá 48 h** → jeden follow-up: „Stačí 1 věta, jestli něco upravit nebo můžu zveřejnit?" Pak ticho.
- **Vrací zpět („nakonec ne")** → CSV status → `rejected`, variant D.

### 13. Oprava (člověk + Onboarding Agent, 5–15 min)

- Zakladatel přečte feedback podniku.
- Pokud drobná úprava textu: zakladatel udělá ručně.
- Pokud větší úprava (nový popis, jiné jídlo): vrátit Onboarding Agentovi s update vstupem.
- Po opravě znovu Safety Guard + QA → zpět na krok 9 → krok 11.
- Maximum 2 kola oprav. Třetí kolo = osobní zastavení v podniku.

### 14. Push live (člověk, 10 min)

- Update `src/data/demoPlaces.ts` (nebo později admin formulář).
- Lokální typecheck + expo export.
- Commit + PR + merge do main.
- Update CSV: status → `live`, datum live.
- Pošlete podniku zprávu: „Jste live, podívejte se → [odkaz]".

---

## Tvrdá pravidla agentního workflow

1. **Žádný agent nikdy nepřejde sám do dalšího kroku.** Mezi každými agentními kroky stojí buď další agent (jako gatekeeper), nebo zakladatel.
2. **Žádný agent neposílá zprávy.** Outreach Agent připravuje text, zakladatel posílá.
3. **Žádný profil nejde live bez explicitního schválení podniku.** Schválení musí být v písemné formě (WhatsApp / IG zpráva s textem typu „v pořádku, zveřejněte"). Voice schválení neplatí.
4. **Žádný profil se nepushne do `main` bez QA passu.** Pokud zakladatel override-uje fail, musí to zapsat do CSV `notes` proč.
5. **Žádná zdravotní garance nikde.** Safety Guard pravidla jsou absolutní.
6. **Zakladatel může kdykoli zastavit pipeline.** I uprostřed kroku 11, pokud podnik napíše „už mě nezajímá".

---

## Časový rozpočet per podnik

| Krok | Agent / člověk | Cílový čas |
|---|---|---|
| 1 | Člověk | 5 min |
| 2 | Outreach Agent | 30 s |
| 3 | Člověk | 1 min |
| 4 | Podnik | 0–7 dnů (mimo budget) |
| 5 | Člověk | 10–15 min |
| 6 | Onboarding Agent | 5 min |
| 7 | Safety Guard Agent | 1 min |
| 8 | QA Agent | 1 min |
| 9 | Člověk | 5–10 min |
| 10 | Outreach Agent | 30 s |
| 11 | Člověk | 2 min |
| 12 | Podnik | 0–48 h (mimo budget) |
| 13 | Člověk + Onboarding Agent | 5–15 min (volitelné) |
| 14 | Člověk | 10 min |
| **Suma aktivního času** | | **45–65 min per podnik** |

Cíl: time-to-profile **≤ 10 dnů** kalendářně, ≤ 1 hodina aktivního času zakladatele per podnik.

Pro srovnání: bez agentů byl plán „≤ 2 h aktivního času per podnik". Agentní workflow má za cíl **2× zrychlení**.

---

## Kdy zastavit a vyhodnotit

Po 5 podnicích (přibližně den 14):

- Sednout k retro.
- Projít každý profil: kde agent ušetřil čas, kde naopak přidal frikci?
- Update agentních promptů, pokud něco systematicky drhne.
- Pak pokračovat na zbylých 5.

Po Pilotu 0 (den 30):

- Vyhodnotit, jestli agenti reálně splnili 2× zrychlení.
- Identifikovat top 3 friction body.
- Rozhodnout, jestli to opravit přes admin formulář (3 dny engineeringu) nebo vyladit promptingem.

---

## Vazba na ostatní dokumenty

| Dokument | Jak ho používá workflow |
|---|---|
| `docs/pilot-0/target-list-template.csv` | Vstup pro krok 1 |
| `docs/pilot-0/pitch-a5.md` | Tištěný materiál pro krok 5 (po osobním pitchi) |
| `docs/pilot-0/whatsapp-messages.md` | Šablony pro Outreach Agenta |
| `docs/pilot-0/onboarding-script.md` | 10 otázek pro krok 5 |
| `docs/pilot-0/business-data-template.md` | Cílový tvar pro krok 6 |
| `docs/pilot-0/decision-rules.md` | Kdy zastavit / zpomalit (platí i v agentním kontextu) |
| `docs/food-data-safety.md` | Principy, které Safety Guard vynucuje |

---

## Co tento workflow NEDĚLÁ

- ❌ Neposílá zprávy automaticky.
- ❌ Nepush-uje profily automaticky.
- ❌ Nepřebírá vztah s podnikem.
- ❌ Negarantuje alergeny.
- ❌ Nevytváří fotky (Midjourney / DALL-E).
- ❌ Nezahrnuje žádný backend ani databázi nad rámec existujícího `demoPlaces.ts`.
- ❌ Nepřidává chatbota pro hosty ani pro podniky.

Vše agentní v Pilotu 0 je **lokální nástroj zakladatele** (Cursor, Claude Code, případně samostatný Notion / Linear pracovní prostor). Nikdo z venku agenta nevidí.

# Model-Agnostic Agents

Specifikace 11 agentů Mám hlad. Každý má **primární** a **záložní** model/nástroj. Pokud primární vypadne (exportní omezení, výpadek, cena), záložní převezme bez nutnosti přepisovat prompt.

## Společná pravidla pro všechny agenty

Tato pravidla platí pro každého agenta níže a nepovtarují se v jednotlivých sekcích:

- **AI připravuje, člověk schvaluje, podnik / Google / Apple potvrzuje.** Agent nikdy nic neodesílá, nepublikuje, ani neutrácí peníze sám.
- **Prompt žije v `docs/`**, ne v aplikaci. Lze ho přepnout do jiného providera bez code change.
- **Output je strukturovaný text** (markdown nebo JSON), který umí kterýkoli model vrátit. Žádné proprietární tool-use only formáty.
- **Žádné zdravotní garance**, žádné alergeny strukturovaně (viz `docs/food-data-safety.md`).
- **Bezpečné selhání:** když si agent není jistý, vrátí `escalate` na zakladatele, nikdy nehádá.

## Konvence: primární vs. záložní

- **Primární** = co používáme dnes a co je nejlepší pro daný úkol.
- **Záložní 1** = první volba, když primární není k dispozici.
- **Záložní 2** = pojistka pro případ, že vypadne celá rodina (Anthropic, OpenAI).

Lokální záloha (Llama 3.x přes Ollama, Mistral) je u agentů, kde výpadek cloudu nesmí zastavit provoz. U agentů, kde se výpadek dá přečkat dnem-dvěma, lokální záloha není povinná.

---

## 1. Strategy Agent

**Účel:** Drží přehled o launch flow, hlídá závislosti mezi agenty, navrhuje další krok pro zakladatele. Není to „agent, který rozhoduje" — je to plánovací nástroj.

**Vstupy:**
- Stav Pilotu 0 (CSV target listy, statusy podniků).
- Stav store listingu (checklist).
- Týdenní cíle z `30-day-launch-plan.md`.
- Volné texty zakladatele („dnes mám 2 h, co dělat").

**Výstupy:**
- Strukturovaný `next 3 actions` markdown.
- Risk register (co se může pokazit do 7 dnů).
- Připomínky deadlinů (Apple review okno, Google closed testing minimum, atd.).

**Primární:** Claude Opus / Sonnet (dobré reasoning, dlouhý kontext na dokumenty).
**Záložní 1:** GPT-4 class.
**Záložní 2:** Gemini Pro.

**Smí:** Číst všechny docs ve `docs/`, navrhovat priority, upozorňovat na rozpor mezi plánem a stavem.
**Nesmí:** Spouštět ostatní agenty, měnit dokumenty, posílat cokoli ven.

**Human approval gate:** Každý jeho výstup je doporučení. Zakladatel si vybírá, co udělá.

---

## 2. Outreach Agent

**Účel:** Drafty zpráv pro podniky. Detailní specifikace v `docs/agents/outreach-agent.md` — tato sekce ji jen doplňuje o model-agnostic vrstvu.

**Vstupy:** Viz `docs/agents/outreach-agent.md`.
**Výstupy:** Viz tamtéž.

**Primární:** Claude Sonnet (krátké, lidské texty, dobrý český registr).
**Záložní 1:** GPT-4 class.
**Záložní 2:** Mistral Large nebo Gemini Pro.

**Smí / nesmí:** Viz `docs/agents/outreach-agent.md` — všechny zákazy platí beze změny napříč modely.

**Human approval gate:** Zakladatel zkopíruje text do svého telefonu a odešle ručně. Žádná WhatsApp/IG API integrace.

---

## 3. Onboarding Agent

**Účel:** Voice memo (10minutový rozhovor) + materiály → strukturovaný profile draft. Detail v `docs/agents/onboarding-agent.md`.

**Vstupy:**
- Voice memo (audio) → transcript.
- Fotky menu / interiéru.
- Případně web podniku.

**Výstupy:**
- Profile draft ve tvaru `business-data-template.md`.

**Primární transcription:** Whisper (large-v3) lokálně nebo přes OpenAI API.
**Záložní transcription:** Deepgram, Google Speech-to-Text, případně lokální Whisper na CPU (pomalejší, ale offline).

**Primární generation:** Claude Sonnet (zachycuje lidský tón rozhovoru).
**Záložní 1:** GPT-4 class.
**Záložní 2:** Mistral Large.

**Smí:** Vyplnit textová pole profilu, navrhnout chef card, denní doporučení.
**Nesmí:** Vyplňovat alergenní pole, gluten info, nastavit `glutenInfo` na cokoli jiného než `not_set`.

**Human approval gate:** Profile draft jde přes Safety Guard, pak QA, pak zakladatel, pak podnik (screenshot review). Nepublikuje se bez explicitního souhlasu podniku.

---

## 4. Safety Guard Agent

**Účel:** Hlídá zdravotní a alergenní claims. Detail v `docs/agents/safety-guard-agent.md`.

**Vstupy:** Profile draft z Onboarding Agenta.
**Výstupy:** Strukturovaná review (`pass` / `needs_redline` / `hard_block`).

**Primární:** Claude Sonnet (konzistentní s konzervativním tone, dobře detekuje implicitní health claims).
**Záložní 1:** GPT-4 class. **Pozor:** prompt musí být explicitnější u GPT (snadněji propustí marketingový vzorec).
**Záložní 2:** Lokální Llama 3.x / Mistral — fungují, ale s regression test setem (sada známých „špatných" textů, na kterých validujeme každý nový model před nasazením).

**Smí:** Redline-ovat text, vymazat zakázaná pole, escalate.
**Nesmí:** Schválit profil. Žádný model sám nerozhodne, že je profil bezpečný.

**Human approval gate:** I když Safety Guard vrátí `pass`, zakladatel + podnik mají poslední slovo. Safety Guard chrání před hrubou chybou, ne před všemi.

**Regression test set:** `docs/launch-system/safety-regression-cases.md` (do vytvoření v týdnu 2) — soubor 20+ známých vstupů s očekávaným verdiktem. Spouští se při každé změně modelu.

---

## 5. QA Agent

**Účel:** Kontrola úplnosti profilu před tím, než jde podniku ke schválení. Detail v `docs/agents/qa-agent.md`.

**Vstupy:** Profile draft po Safety Guard.
**Výstupy:** Checklist „připraveno k podnikovému review" / „chybí X, Y".

**Primární:** Claude Sonnet (i Claude Haiku stačí — úkol je strukturovaný).
**Záložní 1:** GPT-4 class nebo GPT-4 mini.
**Záložní 2:** Lokální Llama 3.x — pro QA je vhodné, protože je to převážně rule-checking.

**Smí:** Označit chybějící pole, formátové chyby, příliš dlouhé/krátké texty.
**Nesmí:** Schválit publikaci. Měnit text profilu (to dělá Onboarding Agent).

**Human approval gate:** Profile review podnikem je explicitní akce zakladatele (screenshot → WhatsApp).

---

## 6. Landing Page Agent

**Účel:** Generovat copy a strukturu pro dvě landing pages — pro hladového uživatele (`mamhlad.cz`) a pro podnik (`mamhlad.cz/podniky`).

**Vstupy:**
- `docs/PRODUCT_BRIEF.md`, `docs/MVP_SCOPE.md`.
- Pilot 0 výsledky (kolik podniků, ohlasy zakladatele).
- Tonalita: klidná, lidská, žádné startup buzzwordy.

**Výstupy:**
- Markdown s wireframem + copy pro každou sekci.
- Alt texty pro obrázky.
- Meta tagy (title, description, OG).
- Návrhy CTA (např. „Zapojit můj podnik" → kontaktní formulář, ne self-service signup v této fázi).

**Primární:** Claude Sonnet (český registr, krátké věty).
**Záložní 1:** GPT-4 class.
**Záložní 2:** Mistral Large.

**Smí:** Generovat copy, navrhovat strukturu, navrhovat technické SEO.
**Nesmí:** Deployovat. Spravovat doménu. Posílat cokoli na produkční hosting.

**Human approval gate:** Zakladatel commit-uje copy do repa landing page projektu a deployuje ručně (nebo přes CI s manuálním approval).

---

## 7. Video Script Agent

**Účel:** Scénáře pro 15–60 sekundové AI vygenerované video klipy (Instagram Reels, TikTok, YouTube Shorts).

**Vstupy:**
- Téma (z brief banky, viz `ai-video-pipeline.md`).
- Cílová persona (hladový uživatel × majitel podniku).
- Tonalita: viz `docs/agents/README.md`.

**Výstupy:**
- Scénář ve formátu `shot list + voiceover + on-screen text`.
- Návrhy hudby / atmosféry (popis, ne konkrétní track — copyright riziko).
- Disclosure věta („AI generated visual") doporučená v každém scénáři.

**Primární:** Claude Sonnet (kreativní, ale zdrženlivý — neslibuje to, co produkt neumí).
**Záložní 1:** GPT-4 class.
**Záložní 2:** Mistral Large.

**Smí:** Navrhovat scénáře, varianty, persuasive copy v rámci `docs/agents/` pravidel.
**Nesmí:** Slibovat funkce, které appka nemá. Předstírat dokumentární záběr. Zmínit konkrétní podnik bez výslovného souhlasu.

**Human approval gate:** Scénář → zakladatel → Safety Guard (na text) → Video Production Agent.

---

## 8. Video Production Agent

**Účel:** Z hotového scénáře vyrábí video. Pracuje s několika nástroji.

**Vstupy:**
- Schválený scénář z Video Script Agent.
- Brand kit (barvy `#F97316`, `#FFF7ED`, logo).

**Výstupy:**
- MP4 / MOV soubor.
- Stručný brief pro lidskou kontrolu („tento záběr je AI-generovaný stock, tento je b-roll z volného archivu, tento je text-only").

**Primární:** Fable 5 / Sora-class video model + ElevenLabs (voiceover).
**Záložní 1:** Runway Gen-3, Pika 1.x, Luma Dream Machine — alespoň jeden účet vždy aktivní.
**Záložní 2:** Pure text-only / Kinetic typography motion graphics (Canva, CapCut, Premiere) — nepotřebuje žádný video AI model, kdyby vypadly všechny. Tento mód musí existovat jako fallback pro případ, že Fable 5 zmizí a my potřebujeme do týdne vydat video.

**Smí:** Generovat scény, voiceover, stříhat, dělat motion text.
**Nesmí:** Generovat tváře reálných lidí (zakladatel, majitelé podniků) bez explicitního písemného souhlasu. Generovat fake záběry konkrétního podniku (interiér, logo). Generovat fake recenze / testimonialy.

**Human approval gate:** Každý finální cut prochází lidskou kontrolou (viz `ai-video-pipeline.md` step „lidská kontrola"). Publikace je manuální upload zakladatele.

---

## 9. Google Places Agent

**Účel:** Stahuje a normalizuje seed data z Google Places API pro nové město. Detail v `google-places-seed-plan.md`.

**Vstupy:**
- Cíl: město, čtvrť, polygon nebo radius.
- Kategorie (restaurant, cafe, bakery, …).
- Limit (kolik míst stahujeme, kvůli ceně API).

**Výstupy:**
- JSON / CSV s normalizovanými fields (`name`, `address`, `lat`, `lng`, `phone`, `website`, `hours`, `place_id`, `categories`).
- Flag `source: google_places_seed`, `verified_by_owner: false`.

**Primární:** Google Places API (oficiální, žádná AI v této vrstvě — jde o data ingest).
**Záložní 1:** OpenStreetMap / Overpass API (méně dat, ale zdarma a bez ekosystémové závislosti).
**Záložní 2:** Manuální seed z veřejných seznamů (Mapy.cz export, listy z radnice).

**Smí:** Stahovat veřejně dostupná data v rámci ToS Google Places.
**Nesmí:** Stahovat fotky a republikovat je v Mám hlad (ToS Google). Cache-ovat data déle, než povolí Places ToS (typicky 30 dní). Vyplňovat z Google Places obsah, který se tváří jako vlastní hodnota Mám hlad (chef card, denní doporučení).

**Human approval gate:** Seed se nahraje do staging tabulky, ne přímo do produkce. Zakladatel rozhoduje, která místa povýšit na `verified` (typicky po concierge onboardingu).

---

## 10. Store Launch Agent

**Účel:** Připravuje store listing artefakty pro Google Play a Apple App Store / TestFlight.

**Vstupy:**
- Screenshoty z buildu (vygenerované přes `npx expo export` + emulátor screenshot pipeline).
- Texty z PRODUCT_BRIEF.
- Pilot 0 výsledky (jako proof do popisu, ne jako marketing claim).

**Výstupy:**
- App description (CZ + EN).
- Short description, feature graphic copy.
- Promo text / what's new.
- Návrh kategorií a tagů.
- Privacy policy draft (k revizi člověkem, ne k auto-publikaci).
- Review notes pro Apple reviewera (co je v appce, co testovací login, co kontakt).

**Primární:** Claude Sonnet.
**Záložní 1:** GPT-4 class.
**Záložní 2:** Gemini Pro / Mistral Large.

**Smí:** Generovat copy, navrhovat tagy, kompilovat checklist.
**Nesmí:** Submit-ovat build do Play / App Store. Měnit app.json / eas.json. Měnit production privacy policy live URL.

**Human approval gate:** Submit dělá zakladatel z vlastního developer účtu, ručně přes web konzoli nebo `eas submit` ze svého stroje.

---

## 11. Analytics Agent

**Účel:** Shrnuje data z týdenních metrik (otevření profilů, completion rate hunger → results, retention) a navrhuje hypotézy pro next iteration.

**Vstupy:**
- Export z PostHog / Plausible / vlastní logování.
- Anekdotický feedback z Pilotu 0 (zakladatelovy poznámky).

**Výstupy:**
- Týdenní summary (top 3 metriky, top 3 surprise findings, top 3 hypotézy).
- Návrhy A/B testů (jen návrhy, nikoli implementace).

**Primární:** Claude Sonnet.
**Záložní 1:** GPT-4 class.
**Záložní 2:** Lokální Llama 3.x — pro číselné shrnutí stačí.

**Smí:** Analyzovat exportovaná data, navrhovat hypotézy.
**Nesmí:** Mít přímý read-only přístup k produkční databázi (jde přes export). Tvrdit kauzalitu z malých vzorků (Pilot 0 = 10 podniků, statistická významnost nepřichází v úvahu — agent musí explicitně psát „pozorování, ne důkaz").

**Human approval gate:** Žádné kroky vyplývající z analytiky nejsou auto-implementovány. Zakladatel rozhoduje, co testovat.

---

## Operační pravidla

### Přepnutí na záložní model

Spouštěč přepnutí na záložní model:

1. Primární model nedostupný déle než 24 h.
2. Cena primárního modelu skočí o víc než 3× proti rozpočtu.
3. Exportní / geopolitické omezení (přesně tento scénář s Fable 5 / Mythos 5).
4. Quality regression: na regression test setu (zatím připravujeme pro Safety Guard) propadne pod 90 % shody.

V každém z těchto případů zakladatel rozhoduje, ne agent.

### Regression test sety

Pro každého agenta budovat soubor `docs/launch-system/<agent>-regression-cases.md` s 10–20 vstupy + očekávaným výstupem. Před přepnutím modelu nebo upgrade modelu se na nich validuje. Priorita stavby:

1. Safety Guard (P0, blokuje publikaci).
2. Onboarding Agent (kvůli false negatives na alergenních polích).
3. Outreach Agent (kvůli tonalitě).
4. Ostatní později.

### Logging

Každý spuštěný agent loguje: vstup hash, použitý model, output hash, čas, kdo schválil. Logy slouží post-mortem analýze, ne tréninku. **Nesdílíme logy s providery modelů** (žádný „improve the model" toggle).

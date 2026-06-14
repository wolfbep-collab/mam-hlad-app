# Launch System — Model-Agnostic

CEO směr, srpen 2026. Tento dokument je zastřešující — detaily v ostatních souborech této složky.

## Proč tento dokument vzniká

Až dosud jsme stavěli na předpokladu, že Mám hlad poběží na jednom AI ekosystému (Fable 5 / Mythos 5 přes Anthropic / Claude Code). To se ukázalo jako riziko: exportní omezení mohou kdykoli odříznout přístup k jednomu modelu nebo jedné firmě, a Mám hlad pak stojí.

**Nové pravidlo:** žádná část produktu ani provozu Mám hlad nesmí být závislá na jednom modelu ani jedné firmě. Pokud Fable 5 zítra zmizí, do týdne běžíme dál.

## Tři nové pilíře

### 1. Modelově nezávislý agentní systém

Každý agent v `docs/agents/` a v `docs/launch-system/model-agnostic-agents.md` má:

- **Primární model/nástroj** — co používáme dnes (Claude Opus / Sonnet, Fable 5).
- **Záložní model/nástroj** — co nasadíme, když primární vypadne (GPT-4 class, Gemini, lokální Llama 3.x, Mistral).
- **Prompt v plain textu** — nesmí být uzamčený ve specifickém SDK ani v proprietárních toolech.
- **Human approval gate** — agent nikdy nic neodešle, nepublikuje, neutratí peníze.

Prakticky to znamená: prompty žijí v `docs/`, ne v aplikaci. Spuštění agenta je question of `cat prompt.md | <jakýkoli model>` nebo wrapper, který umí přepnout providera v jednom configu.

### 2. Oficiální důvěryhodnost přes landing page + store listing

Mám hlad se nesmí prezentovat jen jako „appka v Expo Go". Pro podniky a uživatele je důvěryhodnost závislá na:

- Vlastní landing page (`mamhlad.cz` / `mamhlad.app`) — pro podniky i pro hladové uživatele, dvě různé stránky.
- Listing v Google Play (closed → open testing → production).
- Listing v Apple TestFlight, potom App Store.
- Veřejný kontakt, privacy policy, support email — vše, co podnik nebo Apple/Google reviewer očekává.

Bez tohoto cokoli, co Mám hlad podniku napíše (i přes osobní WhatsApp zakladatele), zní jako amatérský pokus. Detaily v [`app-store-readiness.md`](./app-store-readiness.md).

### 3. Google Places jako seed, vlastní databáze jako hodnota

Nepostavíme Mám hlad jako copy Google Maps. Google Places API použijeme jen:

- Jako **seed** při startu v novém městě — abychom měli základní fakta (otevírací doba, adresa, telefon).
- Jako **fallback** pro podniky, které ještě nemají vlastní ověřený profil.

**Hodnota Mám hlad** je v datech, která Google nemá:

- Co kuchař dnes doporučuje.
- Krátký lidský popis („spíš snídaňové místo", „chodí sem hodně lidí z kanceláří").
- Mood / situation tagy navázané na recommendation engine.
- Chef card a denní doporučení.
- Ověřený souhlas podniku s tím, že profil reprezentuje jeho vůli.

To Google nikdy mít nebude. Detail v [`google-places-seed-plan.md`](./google-places-seed-plan.md).

## Co tento směr **nemění**

- Pravidla z `docs/agents/README.md` (AI připravuje, člověk schvaluje, podnik potvrzuje) platí beze změny.
- Pravidla z `docs/food-data-safety.md` (žádné garance alergenů) platí beze změny.
- Pilot 0 v Liberci běží podle `docs/pilot-0/` — tento dokument jen rozšiřuje horizont za den 30 Pilotu 0.
- AGENTS.md (typecheck, expo export, klidný styl, žádné účty/platby) zůstává.

## Co tento směr **mění**

- Přestáváme používat výraz „Claude udělá X" v interních plánech. Říkáme „agent X udělá Y", model je implementační detail.
- Přidáváme vrstvu Strategy Agent, která řídí celkový launch flow a nehoví závislosti na jednom toolu.
- Landing page a store listing se posouvají z „někdy v0.5" na souběžnou prioritu s Pilotem 0.
- Začínáme plánovat AI video pipeline jako samostatnou stopu — ne jako sub-úkol marketingu.

## Mapa dokumentů

| Soubor | K čemu |
|---|---|
| [`model-agnostic-agents.md`](./model-agnostic-agents.md) | Specifikace 11 agentů s primárním i záložním modelem |
| [`30-day-launch-plan.md`](./30-day-launch-plan.md) | Týden 1–4 prakticky |
| [`app-store-readiness.md`](./app-store-readiness.md) | Checklist pro Google Play + Apple |
| [`google-places-seed-plan.md`](./google-places-seed-plan.md) | Co z Places brát, co nebrát |
| [`ai-video-pipeline.md`](./ai-video-pipeline.md) | Bez klamání, že je to dokument |
| [`budget-options.md`](./budget-options.md) | Low / practical / aggressive |

## Vztah k existujícím dokumentům

| Pokud je rozpor | Platí |
|---|---|
| `docs/launch-system/` vs. `docs/pilot-0/` | `docs/pilot-0/` (terén je nadřazený plánu) |
| `docs/launch-system/` vs. `docs/agents/` | `docs/agents/` pro pravidla agentů, `docs/launch-system/` rozšiřuje seznam agentů |
| `docs/launch-system/` vs. `AGENTS.md` | `AGENTS.md` (nezávislé na ekosystému) |
| `docs/launch-system/` vs. `docs/food-data-safety.md` | `docs/food-data-safety.md` (žádná zdravotní garance) |

## Severní hvězda (nezměněna)

> **Time-to-decide pod 30 sekund od otevření aplikace po výběr.**

Vše ostatní — agenti, landing page, AI video, store listing — slouží tomu, aby tato uživatelská zkušenost byla k mání pro reálné lidi v reálných městech s reálnými podniky. Ne pro testovací zařízení v Liberci a Expo Go.

# Multi-agent Repo Workflow

Provozní dokument pro režim, ve kterém Mám hlad **nestojí na jednom AI nástroji**. Claude, Codex/OpenAI a další agenti sdílejí práci přes GitHub repo — branche, commity, PR.

> **Status:** závazná pracovní šablona pro denní provoz. Doplňuje [`docs/agents/README.md`](../agents/README.md), [`docs/launch-system/model-agnostic-agents.md`](../launch-system/model-agnostic-agents.md), [`AGENTS.md`](../../AGENTS.md). Při sporu platí ony.

---

## 1. Princip

- **GitHub repo je jediný zdroj pravdy.** Co není v `main`, neexistuje. Co je v `main`, je závazné.
- **Žádný agent není single point of failure.** Pokud Claude vypadne, pokračuje Codex. Pokud Codex vypadne, pokračuje Claude. Pokud vypadnou oba, pokračuje člověk ručně v GitHubu.
- **Claude může pracovat jako technická ruka** — implementace, refaktory, dokumentace, testy.
- **Codex / OpenAI může pracovat jako druhá technická ruka** — paralelní implementace, code review, fallback.
- **Každý agent pracuje přes branch + commit + PR.** Žádné přímé pushe na `main`. Žádné amend-ování merge commitů.
- **Strategické rozhodnutí schvaluje Jaroslav (Pupíček).** Co a kdy, ne jen jak.
- **Finální vibe check u brandu a produktu dělá člověk.** Žádný agent neodhadne, co je „v duchu Mám hlad“ líp než zakladatel.

---

## 2. Role

| Role | Co dělá | Co nedělá |
|---|---|---|
| **Jaroslav / Pupíček** | Vlastník vize. Strategické rozhodnutí. Vibe check brand + produkt. Finální „merge ano / ne“. | Neimplementuje detaily, pokud nechce. Neschvaluje cokoli mlčením. |
| **ChatGPT / CEO mode** | Řízení, zadání, kontrola směru, rozpad úkolů. Konzistence napříč PR. | Nepíše kód do repa přímo. Nemá poslední slovo v brandu. |
| **Claude Code** | Implementace, refaktory, dokumentace, testy. Drží konvence repa. | Neodesílá zprávy podnikům. Nemění strategický směr. Nemění věci mimo scope zadání. |
| **Codex / OpenAI** | Paralelní implementace, kontrola, fallback, technická alternativa. | Stejné zákazy jako Claude. |
| **GitHub** | Sdílená paměť projektu. Branche, PR, audit log. | Neprovádí merge sám. |
| **Vercel** | Veřejné deploye `landing-site/`. Production branch = `main`. | Nedeployuje nic mimo `landing-site/`. |
| **Expo** | Mobilní app build/test. Lokální dev + EAS Build. | Nepoužívá se pro web. Web řeší samostatný microsite. |

Drobné rozhraní:

- **CEO → agent:** zadání s jasným scope, jasným commit messagem, jasnou definicí „hotovo“.
- **Agent → CEO:** report po každém PR (viz §5).
- **Pupíček → CEO:** „merge“ / „nemerge“ / „uprav takhle“.
- **Pupíček → agent:** přes CEO mode. Přímý kontakt jen v krajních případech.

---

## 3. Pravidla práce

Tvrdá pravidla, bez výjimky:

- ❌ **Nikdy nepracovat přímo na `main`.** Žádné `git commit` na `main` bez PR.
- ✅ **Vždy vytvořit branch** podle konvence v §4.
- ✅ **Každý úkol má jasný scope.** Když agent uprostřed úkolu zjistí, že je třeba změnit něco mimo scope, **zastaví se a zeptá**, ne to udělá „mimochodem“.
- ✅ **Každý PR musí mít report** (viz §5).
- ✅ **Před merge ověřit diff.** Co se mění, kde. Žádný blind merge.
- ✅ **Merge jen po výslovném schválení.** Pupíček nebo CEO mode v jeho zastoupení.
- ✅ **Po merge přepnout `main` na nový HEAD** (lokálně i mentálně). Další úkol vychází z aktualizovaného `main`.
- ✅ **Smazat lokální pracovní branch** po merge.
- ⚠️ **Remote branch mazat jen pokud to jde bezpečně.** V tomto kontejneru git proxy odmítá `git push --delete` (HTTP 403) → remote branch zůstává a smaže ji člověk přes GitHub UI. To je v pořádku — mergnutý branch je neškodný.

### Nutné kontroly před PR

- `npm run typecheck` — pokud se měnil TS kód.
- `npx expo export --platform android` — pokud se měnil sdílený soubor (např. `app/_layout.tsx`).
- Statická kontrola HTML / odkazů — pokud se měnil `landing-site/`.
- Žádné kontroly nutné — pokud je PR čistě dokumentační (jen `docs/`).

### Co se v PR nikdy nedělá

- ❌ Žádný „while we're at it" refactor mimo scope.
- ❌ Žádné `package-lock.json` změny, které nejsou výsledkem vědomé úpravy `package.json`.
- ❌ Žádné `--no-verify` git commity (s výjimkou výslovného pokynu).
- ❌ Žádný amend mergnutých commitů.
- ❌ Žádný `git push --force` na sdílené branche.

---

## 4. Branch naming

Konvence pro pojmenování pracovních branchí:

| Prefix | Pro koho / co | Příklad |
|---|---|---|
| `claude/<short-task>` | Branch vytvořený Claudem | `claude/landing-premium-redesign` |
| `codex/<short-task>` | Branch vytvořený Codexem / OpenAI | `codex/recommendation-engine-bench` |
| `docs/<short-task>` | Čistě dokumentační PR (jakýkoli agent / člověk) | `docs/pilot-1-retro` |
| `fix/<short-task>` | Bugfix bez ohledu na autora | `fix/results-screen-flicker` |
| `feature/<short-task>` | Větší vlastnost (pokud agent prefix nedává smysl) | `feature/geo-distance-filter` |

Pravidla:

- **Krátké, anglické, kebab-case.** `claude/partner-intake-landing`, ne `claude/Stránka_Pro_Podniky_v2`.
- **Jeden úkol = jedna branch.** Ne „grab bag“ branch.
- **Pokud agent navazuje na vlastní rozdělaný úkol**, použije ten samý branch (viz §6 handoff). Druhý agent navazuje typicky vlastní branchí z `main` po merge.

---

## 5. PR report template

Každý PR má v popisu / chat reportu obsahovat tyto sekce. Pomáhá to Pupíčkovi i druhému agentovi rychle pochopit, co se stalo.

```markdown
## PR

- **PR link:** <url>
- **Branch:** <branch>
- **Commit:** <short sha> <subject>

## Změny

- **Změněné soubory:** <list / count>
- **Co se změnilo:** <2–4 věty, věcně>
- **Co se NEzměnilo:** <co bylo úmyslně mimo scope — typicky `app/`, `landing-site/`, engine, data, deps, config>

## Ověření

- [ ] `npm run typecheck` — výsledek
- [ ] `npx expo export --platform android` — výsledek (jen pokud sahalo do sdíleného TS)
- [ ] Statická kontrola HTML / odkazů — výsledek (jen pro `landing-site/`)
- [ ] Obsahová kontrola (klíčové fráze, citlivá pravidla) — výsledek (pro `docs/`)

## Rizika

<3–5 bodů. Co se může pokazit, co je nejisté, co se příště musí zkontrolovat.>

## Doporučení

`merge` / `nemerge` / `uprav takhle`. **Žádné slepé „GTM“** — agent doporučuje, Pupíček rozhoduje.
```

Krátký formát je v pořádku pro malé PR. Důležitý je **stejný hlavičkový tvar**, aby šel report rychle přečíst.

---

## 6. Handoff prompt template

Když jeden agent předává práci druhému (nebo když sám CEO mode přebírá kontext po výpadku), použijte tuto šablonu. Cíl: druhý agent může pokračovat **bez čtení celé historie**.

```markdown
## Handoff

- **Repo:** wolfbep-collab/mam-hlad-app
- **Aktuální HEAD `main`:** <sha> <subject>
- **Pracovní branch:** <claude|codex>/<task>
- **Poslední commit na branchi:** <sha> <subject>

## Stav

- **Hotovo:** <bodový seznam změn, které už jsou v branchi>
- **Zbývá:** <bodový seznam, co ještě udělat>

## Hranice

- **Co se nesmí měnit:** <typicky `app/`, `src/data/`, recommendation engine, configy, deps; +specifické pro úkol>
- **Co se nesmí publikovat / odeslat:** <typicky nic ven z repa>

## Testy / ověření

- <přesné příkazy + očekávaný výstup>
- <pokud existují obsahové pojistky, vyjmenuj je (např. „Mlčení není souhlas“ musí být v `join.html`)>

## Otevřené otázky

<co potřebuje rozhodnout Pupíček / CEO mode před dalším krokem>
```

Když má agent dostat handoff, doslova mu pošli takový blok. Není to formalita — chrání to před tím, aby druhý agent začal řešit problém, který už je vyřešený, nebo aby smazal něco, co je tam záměrně.

---

## 7. Když jeden nástroj vypadne

Stane se. Klidně několikrát do měsíce. Postup:

1. **Nezastavujeme projekt.** Výpadek jednoho AI nástroje není konec.
2. **Ověříme, co je pushnuté.** `git ls-remote origin <branch>` nebo `gh pr view <n>` přes druhý kanál.
3. **Pokud branch existuje** na remote, druhý agent ji checkoutne a navazuje. Použije handoff šablonu z §6.
4. **Pokud PR existuje**, druhý agent ji může reviewnout (`gh pr view <n>`, `git diff main..<branch>`).
5. **Pokud PR není**, vytvoří se ručně přes GitHub UI (`Compare & pull request` z dané branche) nebo přes druhého agenta s funkčním GitHub API.
6. **Žádná práce se nepovažuje za hotovou, dokud není v `main`.** Branch + commity = rozdělaná práce, ne hotová.

### Specificky pro Claude Code (tato session)

- GitHub MCP server se občas odpojí. ToolSearch ho znovu načte, jakmile je zpět. Mezitím lze pushovat přes git CLI (autoritativní data).
- Git proxy v kontejneru odmítá `git push --delete` (HTTP 403). Remote branche smazat člověk přes GitHub UI.
- Vercel Preview build se rozjede automaticky po push. URL je stabilní pro celou branch.

### Specificky pro Codex / OpenAI

- Stejné pravidlo: branch + PR, žádný přímý push na `main`.
- Pokud používá vlastní GitHub integraci (jiný PAT než Claude), označí PR / branch prefixem `codex/<task>`.

---

## 8. Bezpečnostní pravidla

Tvrdá pravidla. Bez výjimky pro žádného agenta.

- ❌ **Agent nesmí posílat zprávy podnikům bez výslovného pokynu.** Žádný outbound e-mail, WhatsApp, IG DM, formulářový submit od agenta.
- ❌ **Agent nesmí měnit produkční data bez schválení.** Žádný UPDATE / DELETE proti Supabase produkci. Žádný `git push` do produkčního Vercel projektu mimo `main`.
- ❌ **Agent nesmí přidávat tracking bez schválení.** Žádný Google Analytics, Plausible, Meta pixel, atd. — i kdyby si „myslel“, že se to bude hodit.
- ❌ **Agent nesmí měnit recommendation engine při dokumentačním úkolu.** Striktní scope per PR. Když zadání říká `docs/`, sahá jen do `docs/`.
- ✅ **Agent musí hlásit, pokud si není jistý.** „Tohle by mohlo měnit engine, je to OK?“ — odpověď je rychlá, oprava je drahá.
- ❌ **Žádné fake fotky, fake reference, fake recenze.** Pravidlo platí pro web, dokumenty, drafty profilů, marketingové texty.
- ❌ **Prémiový status nesmí ovlivnit recommendation engine.** Engine nezná, kdo je prémiový. Viz [`docs/product/premium-partner-profiles.md`](../product/premium-partner-profiles.md).

A specificky pro některé typy úkolů:

- **Alergeny / dietní claims:** vždy přes [`docs/food-data-safety.md`](../food-data-safety.md), bez výjimky.
- **Hlasový vstup od podniku:** žádný voiceprint, žádné klonování hlasu, žádné third-party API s tréninkem na datech. Viz [`docs/product/partner-intake-portal-and-voice-mode.md`](../product/partner-intake-portal-and-voice-mode.md).

---

## 9. Doporučený denní rytmus

Jeden den = několik takových smyček. Není potřeba dělat víc.

```
1. Vybrat 1 úkol
   ↓
2. Vytvořit branch (claude/<task> nebo codex/<task>)
   ↓
3. Udělat malý PR (10–500 řádků, jasný scope)
   ↓
4. Ověřit (typecheck / expo export / statická kontrola / obsah)
   ↓
5. Report Pupíčkovi (viz §5)
   ↓
6. Merge (až po explicitním schválení)
   ↓
7. Uklidit (přepnout main na nový HEAD, smazat lokální branch)
   ↓
8. Zapsat další krok
```

### Pravidla rytmu

- **Malý PR > velký PR.** Když úkol roste, **rozdělte ho**.
- **Jeden úkol = jeden PR.** Když zadání dává smysl rozdělit, dělejte to.
- **Nepokoušet se rebase historie.** Squash merge řeší většinu.
- **Konec dne = vše hotové je v `main`.** Pokud něco zbylo na branchi, dokumentujte v handoff (§6) pro pokračování.

---

## Vazba na ostatní dokumenty

- [`AGENTS.md`](../../AGENTS.md) — základní pravidla pro práci na Mám hlad (typecheck, expo export, klidný styl, žádné alergeny / účty / platby bez zadání).
- [`docs/agents/README.md`](../agents/README.md) — Tři pravidla agentního systému: AI připravuje, člověk schvaluje, podnik potvrzuje.
- [`docs/launch-system/model-agnostic-agents.md`](../launch-system/model-agnostic-agents.md) — specifické agentní role v launchi (Strategy, Outreach, Onboarding, …).
- [`docs/product/partner-onboarding-system.md`](../product/partner-onboarding-system.md) — onboarding flow partnerských podniků.
- [`docs/product/partner-intake-portal-and-voice-mode.md`](../product/partner-intake-portal-and-voice-mode.md) — budoucí intake portál a hlasový mód.

---

## Pravidlo poslední instance

Tento dokument není formalita. Když cokoli z těchto pravidel přijde někomu „zbytečné“, je to znamení, že se chystá zkratka, která projekt poškodí. Kvalita kódu, dokumentace i důvěra Pupíčka v agenty stojí na tom, že **každý malý PR projde stejným rituálem**. Když to projdeme dnes pomalu, zítra to zvládneme rychle.

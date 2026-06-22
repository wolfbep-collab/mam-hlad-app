# NEXT_CODEX_TASK

> **Co je tento soubor:** šablona pro **jeden** aktuální úkol pro Codex. Jaroslav sem vždy vepíše konkrétní zadání. Codex pak v rozhraní napíše jen krátkou věc:
>
> `Read docs/operations/NEXT_CODEX_TASK.md and execute it. Follow docs/operations/multi-agent-repo-workflow.md.`
>
> Detaily viz [`codex-handoff-system.md`](./codex-handoff-system.md).

---

## Název úkolu

<!-- Krátký, výstižný — jednou větou, anglicky pokud bude i jako PR titulek. -->

(zatím prázdné)

## Repo

`wolfbep-collab/mam-hlad-app`

## Aktuální HEAD `main` (z jakého commitu vycházet)

<!-- Doplň při zadání. Codex by měl ověřit, že je sync. -->

`<sha> <subject>`

## Branch name

<!-- Konvence z multi-agent-repo-workflow.md §4: codex/<short-task>, fix/, docs/, feature/ -->

`codex/<short-task>`

## Scope

<!-- Které soubory/složky se MOHOU měnit. Vše ostatní je mimo scope. -->

- (např. `landing-site/`)
- (např. `docs/product/<file>.md`)

## Co změnit

<!-- Konkrétně: jaké soubory, jaké sekce, jaký obsah. Body, ne odstavce. -->

- 
- 
- 

## Co neměnit

<!-- Tvrdá negativní omezení. Mimo scope se nesmí sáhnout, i kdyby to "dávalo smysl". -->

- ❌ App kód (`app/`, `src/`)
- ❌ Data podniků (`src/data/*`)
- ❌ Recommendation engine (`src/lib/recommendationEngine.ts`)
- ❌ Expo config (`app.json`, `eas.json`)
- ❌ Dependencies (`package.json`, `package-lock.json`)
- ❌ Ostatní stránky microsite (pokud nejsou v scope)
- ❌ Nic neposílat podnikům, nic nepublikovat mimo repo

## Ověření před PR

<!-- Vyber jen to, co se týká scope úkolu. -->

- [ ] `npm run typecheck` (pokud se měnil TS kód)
- [ ] `npx expo export --platform android` (pokud se měnil sdílený soubor jako `app/_layout.tsx`)
- [ ] Statická kontrola HTML / mailto / odkazů (pokud se měnil `landing-site/`)
- [ ] Obsahová kontrola — klíčové fráze, pojistky (pokud `docs/` nebo veřejný text):
  - Mlčení není souhlas
  - AI nesmí vymýšlet fakta
  - Bez výslovného schválení nezveřejníme
  - Prémiový status nesmí ovlivnit recommendation engine
  - Žádné fake fotky / recenze / reference
- [ ] Žádné externí obrázky, fonty, skripty ani tracking
- [ ] Žádné nové dependencies

## Commit message

<!-- Konvenční prefix: feat: / fix: / docs: / chore: / refactor: -->

`<type>: <imperative summary>`

## PR title

<!-- Typicky stejné jako commit message. -->

`<type>: <imperative summary>`

## Report požadovaný po dokončení

Codex po vytvoření PR pošle Jaroslavovi (přes ChatGPT / CEO mode) zprávu s těmito body:

- **PR link**
- **Branch + poslední commit (sha + subject)**
- **Změněné soubory** (autoritativní seznam, ne odhad)
- **Co se změnilo** (2–4 věty)
- **Co se NEzměnilo** (potvrzení negativních omezení ze sekce „Co neměnit")
- **Ověření** — checklist výše, výsledek každého bodu
- **Rizika** (3–5 bodů, co je nejisté)
- **Doporučení**: `merge` / `nemerge` / `uprav takhle`

Codex **nemerguje sám**. Merge dělá Jaroslav po výslovném schválení.

---

## Jak na to (krátce)

1. **Ověř stav:** přepni na `main`, `git pull origin main`, `git status` čistý, HEAD odpovídá tomu, co je nahoře v tomto souboru.
2. **Branch:** `git switch -c <branch_name_z_šablony>`.
3. **Práce ve scope:** dělej **jen** co je v §Scope a §Co změnit. Když narazíš na věc mimo scope, **zastav se a zeptej** přes report, ne to udělej „mimochodem".
4. **Commit + push:** commit message z §Commit message, push s `-u origin <branch>`.
5. **PR:** vytvoř PR proti `main` s titulem z §PR title. V PR popisu doplň §Co změnit, §Co neměnit, výsledky §Ověření.
6. **Report:** pošli zprávu Jaroslavovi podle §Report. Nemerguj.

> **Pravidlo:** co není v `main`, neexistuje. Branch + commity + PR jsou rozdělaná práce, ne hotová.

---

## Vazba na ostatní dokumenty

- [`codex-handoff-system.md`](./codex-handoff-system.md) — proč tento soubor existuje a jak ho používat.
- [`multi-agent-repo-workflow.md`](./multi-agent-repo-workflow.md) — provozní pravidla pro všechny agenty (Claude, Codex, OpenAI). Při sporu s tímto souborem platí ono.
- [`AGENTS.md`](../../AGENTS.md) — základní pravidla pro práci na Mám hlad.
- [`docs/agents/README.md`](../agents/README.md) — Tři pravidla agentního systému.
- [`docs/food-data-safety.md`](../food-data-safety.md) — bezpečnostní pravidla pro alergeny a zdravotní claims.

---

## Aktuální obsah šablony

> Pokud sekce „Název úkolu" výše říká „(zatím prázdné)", **nic nedělej** — žádný úkol pro Codex teď není připravený.

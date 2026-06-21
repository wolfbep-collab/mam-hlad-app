# Codex Handoff System

Jednoduchý způsob, jak předávat Codexu úkoly bez kopírování dlouhých promptů do jeho rozhraní. **Repo je transportní vrstva** — zadání žije v souboru, ne ve zprávě.

> **Status:** provozní systém pro denní práci. Doplňuje [`multi-agent-repo-workflow.md`](./multi-agent-repo-workflow.md) (při sporu platí ono).

---

## Problém, který tohle řeší

Codex (i jiní agenti) přijímá pokyny v chat rozhraní. Když má Jaroslav předat dlouhé zadání:

- buď ho zkopíruje celé jako prompt (dlouhé, snadno se ztratí, nikde se to neuloží),
- nebo ho zkrátí (a agent dostane neúplné zadání).

Obojí je špatné. Lepší je mít zadání **v repu** a do chatu napsat jen krátkou větu, která agentovi řekne, kde si pro něj sáhnout.

---

## Systém

### 1. Dlouhé zadání žije v repu

Aktuální úkol pro Codex je vždy v souboru:

```
docs/operations/NEXT_CODEX_TASK.md
```

Šablona má pevnou strukturu: název úkolu, repo, aktuální HEAD, branch name, scope, co změnit, co neměnit, ověření, commit message, požadovaný report. Detaily a vzor v samotné šabloně.

**Jeden soubor = jeden aktivní úkol.** Soubor se přepisuje při každém novém zadání. Historii nesleduje sám soubor; sleduje ji git (přes commity / mergnuté PR).

### 2. Do Codexu se napíše jen krátká věta

V chat rozhraní Codexu Jaroslav napíše doslova:

> `Read docs/operations/NEXT_CODEX_TASK.md and execute it. Follow docs/operations/multi-agent-repo-workflow.md.`

Případně česky:

> `Přečti docs/operations/NEXT_CODEX_TASK.md a proveď, co tam je. Drž se docs/operations/multi-agent-repo-workflow.md.`

To je celé. Codex si sám vytáhne plný kontext z repa.

### 3. Codex pracuje přes branch + commit + PR

Stejná pravidla jako pro Clauda — viz [`multi-agent-repo-workflow.md`](./multi-agent-repo-workflow.md) §3 a §4:

- ❌ **Codex nesmí pracovat přímo na `main`.** Žádný `git commit` na `main` bez PR.
- ✅ Vždy vytvořit branch dle konvence (`codex/<short-task>`).
- ✅ Jasný scope per PR (z §Scope v `NEXT_CODEX_TASK.md`).
- ✅ Před PR ověření (typecheck / expo export / statická kontrola / obsah — to, co dává smysl pro daný úkol).
- ✅ Push branche, vytvořit PR proti `main`.

### 4. Codex musí hlásit změněné soubory, testy a rizika

Po vytvoření PR Codex pošle Jaroslavovi report (přes ChatGPT / CEO mode), který obsahuje **přesně** to, co je v `NEXT_CODEX_TASK.md` v sekci **„Report požadovaný po dokončení"**:

- PR link
- Branch + poslední commit (sha + subject)
- Změněné soubory (autoritativní seznam)
- Co se změnilo (2–4 věty)
- Co se NEzměnilo (potvrzení negativních omezení)
- Ověření — checklist a výsledek každého bodu
- Rizika (3–5 bodů)
- Doporučení: `merge` / `nemerge` / `uprav takhle`

### 5. Codex nemerguje

**Merge dělá Jaroslav** (po explicitním schválení) — nebo to za něj přes squash provádí Claude jako koordinační ruka, ale jen na výslovný pokyn. **Co není v `main`, neexistuje.**

---

## Co se předává jak

| Informace | Kde žije | Jak ji Codex dostane |
|---|---|---|
| Dlouhé zadání úkolu | `docs/operations/NEXT_CODEX_TASK.md` | čte ze repa |
| Provozní pravidla (branch, PR, ověření) | `docs/operations/multi-agent-repo-workflow.md` | čte ze repa |
| Bezpečnostní pravidla | `docs/food-data-safety.md`, `docs/agents/README.md` | čte ze repa |
| Pokyn ke startu | krátká věta v chatu | „Read NEXT_CODEX_TASK.md and execute it." |

V chatu zůstává **jen pokyn**, ne zadání. Tím:

- není riziko ztráty kontextu při zavření okna,
- je úkol verzovaný (git zná historii `NEXT_CODEX_TASK.md`),
- druhý agent může okamžitě převzít přes [handoff template](./multi-agent-repo-workflow.md#6-handoff-prompt-template) — všechno potřebné je v repu.

---

## Cyklus jednoho úkolu

```
Jaroslav vyplní docs/operations/NEXT_CODEX_TASK.md
  → commit + push do main (nebo do branche zadání)
  ↓
Krátká věta v Codexu:
  „Read docs/operations/NEXT_CODEX_TASK.md and execute it."
  ↓
Codex čte zadání + pravidla
  → ověří stav repa (main / pull / HEAD / status)
  → vytvoří branch (codex/<short-task>)
  → udělá změny ve scope
  → ověření (typecheck / export / statická kontrola)
  → commit + push
  → otevře PR proti main
  ↓
Codex pošle report Jaroslavovi (přes ChatGPT / CEO mode)
  ↓
Jaroslav rozhodne: merge / nemerge / uprav takhle
  ↓
Po merge: Jaroslav (nebo Claude na jeho pokyn) uklidí pracovní branch,
přepne main na nový HEAD, zapíše další úkol do NEXT_CODEX_TASK.md
```

---

## Specifické zákazy pro Codex

Konzistentní s [`multi-agent-repo-workflow.md`](./multi-agent-repo-workflow.md) §8:

- ❌ **Nesmí posílat zprávy podnikům** bez výslovného pokynu (žádný outbound e-mail, WhatsApp, IG DM, formulářový submit).
- ❌ **Nesmí měnit produkční data** bez schválení (žádný UPDATE / DELETE proti Supabase produkci, žádný push do produkčního Vercel projektu).
- ❌ **Nesmí přidávat tracking** bez schválení (žádný GA, Plausible, Meta pixel, …).
- ❌ **Nesmí měnit recommendation engine při dokumentačním úkolu** (striktní scope per PR).
- ❌ **Nesmí přidávat fake fotky, fake reference ani fake recenze.**
- ❌ **Prémiový status nesmí ovlivnit recommendation engine.**
- ✅ **Musí hlásit, pokud si není jistý.** „Toto by mohlo měnit X, je to OK?" — odpověď je rychlá, oprava je drahá.

---

## Když Codex skončí

Codex po dokončení **vždy** pošle PR report (viz §4). Bez reportu se úkol nepovažuje za dokončený — i kdyby byl PR otevřený. Cyklus se uzavírá až tím, že Jaroslav zná stav.

### Co dělat, když Codex narazí na blokující problém

Pokud Codex nemůže pokračovat (vyžaduje rozhodnutí, scope je nejasný, hraje to s pravidlem):

1. **Nedělá to „mimochodem".**
2. Pushne to, co má hotové (rozdělaná práce na branchi je v pořádku).
3. V reportu uvede sekci „Otevřené otázky" — co potřebuje rozhodnout, než pokračovat.
4. Čeká na odpověď. Nepouští další scope.

---

## Když Codex vypadne

Stejný postup jako u Clauda — viz [`multi-agent-repo-workflow.md`](./multi-agent-repo-workflow.md) §7:

1. Ověřit, co je pushnuté na remote (`git ls-remote origin codex/<task>`).
2. Pokud branch existuje, druhý agent (Claude) může navázat přes handoff template ze `multi-agent-repo-workflow.md` §6.
3. Pokud PR existuje, je možné ho reviewnout přímo přes GitHub MCP nebo `gh pr view`.
4. Pokud PR není a všechno je hotové, vytvoří se ručně přes GitHub UI / druhého agenta.

---

## Pravidlo poslední instance

Účel tohoto systému není „rychlejší předávání úkolů". Účel je **mít zadání zachycené někde, kde se nemůže ztratit**, a kde i druhý agent (nebo Jaroslav za měsíc) pochopí, co bylo zadané a proč.

Když by se kdykoli v budoucnu řeklo „pro tentokrát to napíšu rovnou do chatu", je odpověď: ne. Krátký pokyn v chatu + dlouhé zadání v repu. Vždy.

# Workflow s Claude Code

Tento projekt je vyvíjen ve dvou rolích:

- **Produktový architekt / projektový vedoucí** — ChatGPT (vysokoúrovňové rozhodnutí, scope, brief).
- **Technická exekuce** — Claude Code (kód, build, commit, PR, deploy).

Tento dokument popisuje, jak ty dvě role interagují s repem.

## Co dělá Claude Code

1. **Zakládá strukturu projektu.** Bootstrapuje Expo, instaluje deps, definuje složky, theme, types.
2. **Píše kód obrazovek a logiky.** Komponenty, screeny, doporučovací engine, AsyncStorage, Supabase wiring.
3. **Spouští kontrolu kvality.** `npm run typecheck`, manuální průchod přes `npm start`.
4. **Commit + push.** Strukturované zprávy, tematické dávky.
5. **Připravuje PR / EAS build / Play Store submit.**

## Co Claude Code NEdělá bez vyžádání

- Nezakládá nové GitHub repozitáře (pokud není výslovně řečeno — viz `mam-hlad-app` repo).
- Nepushuje force, neamenduje již publikované commity, nemaže větve.
- Negeneruje produkční builds (EAS) bez explicitního pokynu — `eas build` stojí kredity.
- Nesahá do `.env` / secrets bez pokynu.

## Branch strategy

- `main` — vždy zelená, deploy-ready.
- Feature práce v `feat/*` nebo `fix/*` větvích, mergeováno přes PR.
- Pro samostatné kratší experimenty: `claude/<topic>` větev (analogie s `includ-mvp1`).

## Commit zprávy

Používáme prefixy:

- `feat:` nová funkčnost
- `fix:` oprava bugu
- `chore:` build, dependencies, konfigurace
- `docs:` dokumentace
- `refactor:` přestavba bez funkční změny
- `style:` čistě vizuální

Zpráva v češtině nebo angličtině podle obsahu (UI texty / produktové = CZ; technické = EN je OK).

## Smyčka „přidej feature"

1. ChatGPT pošle brief s akceptačními kritérii.
2. Claude Code:
   - prozkoumá repo,
   - navrhne změny v 1–2 větách,
   - implementuje (TypeScript strict, žádný dead code),
   - spustí `npm run typecheck`,
   - manuálně ověří v dev serveru, kde to dává smysl,
   - commitne s jasnou zprávou,
   - pushne, případně otevře PR přes `gh pr create`.
3. ChatGPT shrne změny pro lidského stakeholdera.

## Smyčka „oprav bug"

1. Reprodukce — najít minimum kroků pro chybu.
2. Najít root cause (ne symptom).
3. Opravit + ověřit, že to neodbouralo nic jiného (typecheck + ruční průchod).
4. Commit `fix: …` s krátkým popisem proč.

## Co reportovat zpět po každé úloze

- **Co bylo změněno** (1–2 věty + seznam souborů).
- **Jak ověřeno** (typecheck, manuální průchod, …).
- **Další doporučené kroky** (krátký bullet list).
- **Odkaz** na branch / commit / PR.

## Pravidla pro UI text

- Vše v češtině.
- Krátké, lidské, žádný marketing-speak.
- Žádné „klikni zde". Tlačítka jsou slovesa: „Mám hlad", „Vybrat znovu", „Detail".
- Žádný emoji-spam — emoji slouží jako vizuální kotva, max 1–2 v jednom kontextu.

## Pravidla pro kód

- TypeScript `strict` zapnutý, žádný `any` v aplikační logice (povolené v interop boundaries).
- Komponenty malé, bez vnořených megakomponent.
- Stylování přes `StyleSheet.create`, bez inline objektů kromě dynamických hodnot.
- Theme tokeny (`colors`, `spacing`, `radius`) místo magických čísel.
- Žádný `console.log` v commitnutém kódu.

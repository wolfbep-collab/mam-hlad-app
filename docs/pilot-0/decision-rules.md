# Rozhodovací pravidla pro Pilot 0

Praktická pravidla typu „pokud platí X, udělej Y". Cíl: nedovolit, aby pilot bez vyhodnocení visel dál.

---

## Hlavní rozhodovací body

### ✅ Kdy pokračovat plnou rychlostí

Všechny tři musí platit:

- Do **konce týdne 1** máte ≥ 4 podniky se zájmem (`interested` nebo `interview_done`).
- Průměrný čas od prvního kontaktu k draftu profilu je **≤ 5 dnů**.
- V rozhovorech zatím **nezazněla žádná blokující obavu** (např. „nepotřebuju další aplikaci", „musíte si promluvit s majitelem v Praze").

→ Akce: pokračovat dle plánu, cílit na **10 podniků live do konce dne 30**.

---

### ⏸️ Kdy zpomalit

Aspoň jeden bod platí:

- Do **konce týdne 1** máte < 3 podniky se zájmem.
- Time-to-profile vychází na 7+ dnů (workflow je pomalejší než plán).
- 2+ podniky odmítly screenshot bez schválení.
- Vám osobně dochází energie nebo čas (důležitější než metriky — pilot neuteče).

→ Akce:
1. **Pauznout obchůzky na 24–48 h.**
2. Krátká retro: co konkrétně brzdí? (pitch, lokalita, čas, kvalita profilů).
3. Upravit jednu věc, dál jen 1–2 podniky denně.
4. Znovu vyhodnotit v dnu 14.

---

### 🔻 Kdy snížit cíl z 10 na 6

Aspoň jeden bod platí:

- Do **dne 14** máte < 5 podniků live nebo v `waiting_approval`.
- Časová kapacita zakladatele se nečekaně zmenšila (nová práce, rodina, zdraví).
- 6 podniků vypadá kvalitněji než snaha o všech 10.

→ Akce:
1. Veřejně si v rámci retro **přepsat cíl: 6 podniků live**.
2. Vybrat **6 nejsilnějších** kandidátů z aktuálního seznamu — odložit zbytek do follow-up listu.
3. Pokračovat dle plánu, vyhodnotit v dnu 30 stejnými metrikami.

**Pravidlo:** lepší 6 podniků plně dotažených než 10 polovičních. Concierge model je o kvalitě dat, ne o počtu řádků v databázi.

---

### ❌ Kdy NE do Pilotu 1

Aspoň jeden bod platí na konci dne 30:

- < 4 podniky live (i po snížení cíle).
- < 3 podniky chtějí pokračovat dál.
- < 50 unikátních otevření profilů za 30 dnů celkem (poptávková strana nereaguje).
- Time-to-profile průměr > 14 dnů (workflow je rozbitý).
- Zakladateli pilot zabral 2× víc času, než plánoval (300 % over budget).

→ Akce:
1. **Nezvyšovat sample.** Pilot 1 (30 podniků) by zhoršil ekonomiku, ne zlepšil.
2. Retro v dokumentu `docs/pilot-0/post-mortem.md`:
   - Co konkrétně nefungovalo?
   - Je problém v pitchi, lokalitě, modelu, produktu?
   - Co by se muselo změnit?
3. **Vrátit se k zadání produktu**, ne škálovat.
4. Po retro: mini-pilot 5 podniků s opraveným workflow → teprve pak Pilot 1.

---

### 🛠️ Kdy začít stavět admin formulář

Všechny tři musí platit:

- Pilot 0 splnil **úspěšná kritéria** (≥ 7 podniků live, ≥ 6 chce pokračovat, ≥ 200 otevření).
- V Pilotu 0 jste **identifikovali ≥ 2 konkrétní friction body**, které admin formulář vyřeší (např. „PR do JSON za změnu denního menu", „překlep v ceně vyžaduje deploy").
- Máte v hlavě **konkrétní cílový scope** Pilotu 1 (30 podniků v Liberci, 6 týdnů, brigádník nebo druhý onboarder).

→ Akce:
1. **2–3 dny engineering** s Cursor / Claude Code.
2. Tech rozsah:
   - CRUD nad existující strukturou (`Place`, `MenuItem`).
   - Auth: heslo nebo Supabase magic link, jen pro zakladatele a brigádníka.
   - UI: reuse existing tokens, žádný custom design.
   - Žádný vendor self-edit (to je až fáze 3).
3. Cíl: snížit time-to-profile z 2 h na 30–45 min.

**Co NESTAVĚT po Pilotu 0:**
- WhatsApp onboarding bot (žádné ROI bez admin tooling).
- Vendor self-edit / profile editor pro majitele.
- Google Places import (předčasné).
- Statistiky pro podniky (potřebuje ≥ 100 podniků, aby dávaly smysl).
- Cizojazyčná verze / Tourist Pack.

---

## Tvrdé limity

Nepodléhej těmto pokušením:

| Pokušení | Pravidlo |
|---|---|
| „Jen ještě 5 dalších podniků, pak vyhodnotím" | NE. Vyhodnotit v den 30, ne za 35 nebo 40. |
| „Můžu rovnou v Pilotu 1 zkusit Prahu" | NE, dokud Liberec není uzavřený. |
| „Vyplním alergeny, podnik si to chce" | NE. Existující bezpečnostní text zůstává. |
| „Postavím malý admin form, ať mám rychlejší update" | NE před koncem Pilotu 0. Bottleneck je první ověření, ne efektivita. |
| „Pošlu screenshot bez schválení, jen ať je to live" | NE. Žádný profil bez explicitního souhlasu. |
| „Nechám podnik vyplnit data sám, ať šetřím čas" | NE v Pilotu 0. Concierge je vědomá volba. |
| „Slíbím rozvoz / rezervaci / chat, ať mě nevyhodí" | NE. Lepší žádný podnik než falešný slib. |

---

## Týdenní check-in

Každý pátek (nebo neděli, podle režimu zakladatele) projít 4 otázky:

1. **Kolik podniků se posunulo o jeden status výš?**
   (např. z `contacted` → `interested`, z `interview_done` → `profile_draft`)
2. **Které podniky jsou „mrtvé" — neodpovídají 7+ dnů?**
   → posunout na `rejected` a zapomenout. Žádné natahování.
3. **Co bylo největší blok tohoto týdne?**
   → 1 věta do retro.
4. **Co změním příští týden?**
   → max 1 změna. Ne 5 najednou.

---

## Konec Pilotu 0 — finální check

Den 30. Sednout, projít 4 otázky:

- Splnil pilot 4 úspěšná kritéria (≥ 7 live, ≥ 6 pokračuje, ≥ 200 otevření, ≥ 2 identifikované friction body)? **ANO/NE**
- Kolik hodin zakladatele Pilot 0 reálně zabral? Bylo to udržitelné? **___**
- Co se naučilo o tomto modelu, co jste nevěděli den 0? **3 věty.**
- Doporučení: Pilot 1, mini-pilot 5, nebo stop? **JEDEN ŘÁDEK.**

Toto rozhodnutí v dnu 30 určuje, co se s aplikací stane v následujících 90 dnech. Nepřeskakovat.

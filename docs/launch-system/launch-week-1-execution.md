# Launch Week 1 — Execution

Konkrétní první týden launch fáze po strategickém rozhodnutí (model-agnostic směr, viz `README.md` v této složce). Krátký, použitelný. Žádná teorie navíc.

**Předpoklad:** zakladatel pracuje, má ~2–3 h denně + jedno víkendové odpoledne. Tři proudy běží paralelně, ale reálnou prioritu má **proud 3 (reálný trh)** — ten už má vlastní detailní plán v `docs/pilot-0/first-week-plan.md` a tento dokument ho neduplikuje, jen na něj navazuje.

## Role — zkratky

- **Z** = zakladatel (jediný, kdo odesílá, publikuje, schvaluje, utrácí).
- **C** = Claude (Strategy / copy drafty v Claude Code / chatu).
- **A** = konkrétní agent dle `model-agnostic-agents.md` (Outreach, Landing Page, Store Launch, Onboarding…).
- **Codex** = později, až bude admin/landing v kódu — **v týdnu 1 se nepoužívá**.

## Cíl týdne (3 věty)

1. Mít hotové **texty** pro obě landing pages + privacy policy + „co je Mám hlad" — jako návrhy, ne nasazené stránky.
2. Mít hotový **store checklist a popisy** pro Google Play, a vědět přesně, co Z musí udělat ručně.
3. Mít **25 podniků zkontrolovaných, prvních 5 vybraných a oslovení připravené** — ale nic neodeslané automaticky.

---

## Proud 1 — Důvěryhodnost

> Výstup proudu 1 jsou **texty v repu / dokumentech**, ne živé stránky. Landing page v kódu se v týdnu 1 nestaví.

| Den | Co má být hotové | Kdo | Výstup | Co se NESMÍ |
|---|---|---|---|---|
| Po | Hrubý text „Co je Mám hlad" (5–6 vět, bez buzzwords) | C draft → Z schválí | `docs/launch-system/copy/what-is-mam-hlad.md` (návrh) | Žádné sliby features, co appka nemá |
| Út | Copy pro landing **pro hladové lidi** (hero, 3 sekce, CTA „brzy v Google Play") | A: Landing Page Agent → Z | Markdown návrh copy | Nestavět HTML/JSX, jen text |
| St | Copy pro landing **pro podniky** (jak to funguje, žádný self-service, kontakt na Z) | A: Landing Page Agent → Z | Markdown návrh copy | Neslibovat cenu/monetizaci |
| Čt | Draft **privacy policy** (CZ, „nesbíráme nic" verze) | A: Store Launch Agent → Z | Markdown draft k revizi | Nepublikovat, nenasazovat URL |
| Pá | **Support kontakt** rozhodnut (`ahoj@mamhlad.cz`) + auto-reply text | Z (rozhodnutí), C (text) | Email forward nastaven, auto-reply text | Nezakládat firemní účty zbytečně |

**Co proud 1 v týdnu 1 NEdělá:** nedeployuje doménu, nepíše frontend kód, nepublikuje privacy policy na veřejnou URL (to je týden 2 dle `30-day-launch-plan.md`).

---

## Proud 2 — Oficiální distribuce

> Výstup proudu 2 je **checklist + hotové texty/screenshoty připravené k uploadu**, ne odeslaný build.

| Den | Co má být hotové | Kdo | Výstup | Co se NESMÍ |
|---|---|---|---|---|
| Po | Projít `app-store-readiness.md`, označit, co chybí | Z + C | Vyplněný checklist (stav) | Nezakládat účty pod tlakem |
| Út | **Google Play** část: kategorie, data safety odpovědi, package name potvrzen | Z (účet), C (odpovědi) | Seznam přesných odpovědí pro Play konzoli | Nesubmitovat build |
| St | **Store popis** CZ (short 80 zn. + full) | A: Store Launch Agent → Z | Návrh popisu (Safety Guard pass) | Žádné health claims, žádné superlativy |
| Čt | **Apple/TestFlight** část: rozhodnout individual účet, spustit registraci (trvá dny) | Z | Registrace Apple Dev rozběhnutá | Nečekat s registrací — je to bottleneck |
| Pá | **Screenshoty** plán: které obrazovky, čím se pořídí (reálný telefon/emulátor) | Z + C | Seznam 4–6 screenshotů + postup | Nepoužít reálný podnik bez souhlasu |

**Co musí udělat zakladatel ručně (nikdo jiný nemůže):**
- Založit Google Play Developer účet ($25) ze svého jména.
- Spustit Apple Developer registraci ($99/rok) — start hned, verifikace trvá dny.
- Nastavit support email forward.
- Jakýkoli build / submit (`eas build`, `eas submit`) ze svého stroje.

**Co proud 2 v týdnu 1 NEdělá:** žádný `eas submit`, žádný production track, žádný iOS build (jen rozjetá registrace).

---

## Proud 3 — Reálný trh

> Tento proud má **přednost** a detailní denní plán už existuje v `docs/pilot-0/first-week-plan.md`. Zde jen launch-relevantní výřez: **zkontrolovat 25, vybrat 5, připravit oslovení, nic neodeslat automaticky.**

| Den | Co má být hotové | Kdo | Výstup | Co se NESMÍ |
|---|---|---|---|---|
| Po | **25 podniků** zkontrolováno proti `liberec-real-business-candidates.csv` (existuje, aktuální?) | Z + C | Aktualizovaný seznam 25, status `new` | Neoslovovat řetězce/franchisy |
| Út | **Prvních 5** vybráno (mix typů dle Pilot 0) | Z (rozhodnutí), C (shortlist návrh) | Označených 5 `high` priority | Nevybírat jen podle ratingu |
| St | **Oslovení připraveno** pro těch 5 (varianta A, personalizace) | A: Outreach Agent → Z | 5 unikátních draftů zpráv | Agent NEODESÍLÁ |
| Čt | Z **ručně** odešle 5 zpráv ze svého telefonu (dle vlastního uvážení) | Z | 5 podniků `contacted` | Žádné hromadné rozeslání, žádná API |
| Pá | Týdenní check dle `decision-rules.md` (kolik se posunulo o status výš) | Z + C | 4 odpovědi z check-inu | Nenatahovat mrtvé kontakty |

**Klíčové pravidlo proudu 3:** Outreach Agent **připravuje drafty, neodesílá**. Odeslání je vždy manuální akt zakladatele z jeho telefonu (viz `docs/agents/outreach-agent.md`). „Nic neposílat automaticky" = žádná WhatsApp/IG API integrace, žádný scheduler.

---

## Co je celý týden 1 zakázáno (napříč proudy)

- ❌ Měnit kód aplikace (`app/`, `src/`).
- ❌ Stavět landing page v kódu (jen copy/plán).
- ❌ Publikovat cokoli veřejně (privacy policy, store build, video).
- ❌ Odeslat cokoli podnikům automaticky — vždy ruční akt Z.
- ❌ Slibovat features, co appka nemá (rozvoz, rezervace, alergeny, účet).
- ❌ Mluvit s podniky o ceně.
- ❌ Nasazovat Codex / engineering — to je pozdější fáze.

## Definice hotového týdne 1

- [ ] Copy pro 2 landing pages + „co je Mám hlad" + privacy policy draft — hotovo jako text.
- [ ] Store checklist vyplněný, popisy CZ hotové, Apple registrace běží.
- [ ] 25 podniků zkontrolováno, 5 vybráno, 5 draftů oslovení připraveno (a Z je případně odeslal ručně).
- [ ] Žádný kód appky se nezměnil, nic se nepublikovalo, nic se neodeslalo automaticky.

## Návaznost

Týden 2 (landing deploy, Play closed testing, první AI video) řídí `30-day-launch-plan.md`. Tento dokument pokrývá jen týden 1 a po jeho konci se dál pracuje podle 30denního plánu.

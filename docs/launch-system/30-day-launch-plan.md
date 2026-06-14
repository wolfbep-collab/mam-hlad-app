# 30denní Launch Plán

Pracovní plán na 4 týdny po dokončení Pilotu 0 v Liberci (nebo souběžně s jeho druhou polovinou). Cíl: na konci dne 30 mít první veřejnou důvěryhodnou verzi Mám hlad — landing page, store listing v closed testingu, 5–10 reálných podniků live, první AI video venku.

## Předpoklady

- Pilot 0 běží podle `docs/pilot-0/` — neměníme jeho běh, jen napojujeme launch infrastrukturu.
- Zakladatel věnuje launch ~2 h denně v pracovní dny + víkend (cca 15–20 h týdně).
- Žádný extra člověk v týmu, žádná externí agentura.
- Rozpočet podle [`budget-options.md`](./budget-options.md), výchozí varianta **practical**.

## Severní hvězda těchto 30 dnů

> **Den 30: Mám hlad je v Google Play closed testing, má dvě veřejné landing pages, 5+ reálných podniků live, první AI video venku, a žádná z těchto věcí nestojí na jediném modelu.**

---

## Týden 1 — Landing pages + store checklist + reálný seznam podniků

**Cíl týdne:** Mít dvě statické stránky online (vlastní doména) a hotový store checklist, ze kterého se týden 2 řídí.

### Pondělí–úterý

- [ ] Doména `mamhlad.cz` / `mamhlad.app` registrace (pokud ještě není).
- [ ] DNS nastavení na hosting (Vercel / Netlify / GitHub Pages).
- [ ] Landing Page Agent: brief → wireframe → copy v0.
- [ ] Statický web (Next.js / Astro / čistý HTML — co je rychlejší pro zakladatele).

### Středa–čtvrtek

- [ ] Dvě stránky:
  - `/` — pro hladového uživatele (co appka dělá, screenshoty, „brzy v Google Play" CTA).
  - `/podniky` — pro majitele podniků (jak to funguje, žádný self-service signup, kontakt na zakladatele).
- [ ] Privacy policy v0 publikovaná (musí být veřejně dostupná pro Play Store).
- [ ] Support email aktivní (`ahoj@mamhlad.cz` nebo `podpora@`).
- [ ] OG image + favicon.

### Pátek–víkend

- [ ] Store Launch Agent: vygenerovat checklist pro Google Play (viz [`app-store-readiness.md`](./app-store-readiness.md)).
- [ ] Real business list — Pilot 0 už má `docs/pilot-0/liberec-real-business-candidates.csv`. Validovat, že je up-to-date, doplnit kontakty.
- [ ] Strategy Agent: review týdne 1, navrhnout úpravy plánu pro týden 2.

**Výstup týdne:** dvě URL veřejně dostupné, store checklist v `docs/launch-system/app-store-readiness.md` (už hotový), Pilot 0 reálný seznam aktuální.

**Co se NEdělá v týdnu 1:** žádné video, žádný outreach mimo Pilot 0, žádný store submit.

---

## Týden 2 — Google Play closed testing + TestFlight příprava + první AI video

**Cíl týdne:** Mít build v Play closed testingu s 12+ testery, mít plán pro Apple, a první AI video hotové (ne nutně publikované).

### Pondělí–úterý

- [ ] Google Play Console účet ($25 one-time).
- [ ] `eas build -p android --profile production` → AAB.
- [ ] Naplnit store listing podle `app-store-readiness.md`:
  - Screenshoty (4–8 ks).
  - Krátký a dlouhý popis (Store Launch Agent draft, zakladatel finální).
  - Privacy policy URL (z týdne 1).
  - Kategorie: Food & Drink.
- [ ] `eas submit -p android` → closed testing track.
- [ ] Sehnat 12+ testerů (rodina, kamarádi, Pilot 0 podniky).

### Středa–čtvrtek

- [ ] Apple Developer účet ($99/rok) — registrace.
  - **Pozor:** Apple registrace může trvat několik dní (verifikace). Spustit hned v pondělí.
- [ ] iOS build pipeline draft v `eas.json` (zatím nedeployovat, jen připravit).
- [ ] Video Script Agent: scénář pro první 30s video „Mám hlad, mám 30 sekund".
- [ ] Safety Guard pass na scénář.
- [ ] Video Production Agent: vyrobit video. Pokud Fable 5 funguje, použít. Pokud ne, fallback na kinetic typography (viz [`ai-video-pipeline.md`](./ai-video-pipeline.md)).

### Pátek–víkend

- [ ] Lidská kontrola videa: zakladatel + 2 testeři odpovědí na: „je jasné, že je to AI/grafika a ne dokumentární záběr?". Pokud ne → re-cut.
- [ ] Video je hotové, ale **ještě nepublikujeme**. Publikace v týdnu 4 po vyhodnocení.
- [ ] Analytics Agent: založit measurement plan (PostHog / Plausible / co se zvolí).
- [ ] Strategy Agent: review týdne 2.

**Výstup týdne:** Closed testing track aktivní s 12+ testery, iOS účet v procesu, video v0 v archivu.

**Co se NEdělá v týdnu 2:** žádný outreach k novým podnikům mimo Pilot 0, žádný production push do Play, žádná publikace videa.

---

## Týden 3 — Google Places seed návrh + první outreach kampaň

**Cíl týdne:** Mít seed databázi pro 1–2 čtvrti druhého města (typicky Praha-Vinohrady jako záloha P0, nebo Liberec rozšířený) a první kontaktní vlnu mimo Pilot 0.

### Pondělí–úterý

- [ ] Google Places Agent: stáhnout seed pro vybraný polygon (cíl: 80–150 míst).
- [ ] Validace: žádné fotky z Places se neukládají, žádné review texty, jen základní fakta.
- [ ] Staging tabulka v Supabase (`places_seed`) — oddělená od `places` (která drží jen ověřené profily).
- [ ] Schéma: `source` (`google_places_seed` / `osm_seed` / `manual`), `verified_by_owner` (bool), `last_synced_at`.

### Středa–čtvrtek

- [ ] Outreach Agent: vyrobit drafty pro prvních 10 podniků z nového seznamu (mimo Liberec).
- [ ] Zakladatel: ručně poslat 5–10 zpráv (z vlastního telefonu).
- [ ] Sledovat odezvu — žádný hromadný blast.

### Pátek–víkend

- [ ] Druhé AI video — tentokrát zaměřené na podniky („Mám hlad pomáhá, ne nahrazuje").
- [ ] Strategy Agent: review týdne 3 + příprava na týden 4 (rozhodnutí o publikaci).
- [ ] Případně iOS build, pokud Apple účet už schválil.

**Výstup týdne:** Seed databáze v stagingu (80–150 míst), 5–10 nových kontaktovaných podniků, druhé video v archivu.

**Co se NEdělá v týdnu 3:** žádné published seed profily v Mám hlad (seed je staging, ne produkce), žádný production track v Play.

---

## Týden 4 — Vyhodnocení + první veřejná důvěryhodná verze

**Cíl týdne:** Posunout closed testing na open testing (nebo rovnou production track) v Play, publikovat první video, mít 5–10 reálných live profilů.

### Pondělí–úterý

- [ ] Analytics Agent: 30-day summary.
- [ ] Pilot 0 retrospektiva podle `docs/pilot-0/decision-rules.md`.
- [ ] Strategy Agent: go/no-go pro veřejné spuštění:
  - **Go**: ≥ 5 live podniků, žádná open Safety Guard issue, store listing schválen Play.
  - **No-go**: < 5 live podniků nebo open Safety Guard issue → zůstat v closed testingu, prodloužit Pilot 0.

### Středa–čtvrtek

- [ ] Pokud Go: přepnout Play track na open testing (jednodušší než production, ale veřejně dostupný).
- [ ] Publikovat první AI video (Instagram, TikTok) s explicitní disclosure větou.
- [ ] Druhé video připravit na publikaci za 1 týden.

### Pátek–víkend

- [ ] Veřejně sdělit (LinkedIn / osobní kanály zakladatele): „Mám hlad je v open testingu, podívejte se."
- [ ] **Žádný** plošný PR výpad, žádný startup launch theatre.
- [ ] Strategy Agent: plán dnů 31–60 (rozšíření do druhého města, iOS).

**Výstup týdne:** Open testing v Play, ≥ 5 live podniků, první video venku, plán dalších 30 dnů.

---

## Co se v 30denním plánu **nikdy** nedělá

- ❌ Hromadný cold-email blast podnikům.
- ❌ Slibování features, které appka nemá (rozvoz, rezervace, alergeny).
- ❌ Publikace AI videa bez disclosure.
- ❌ Spuštění iOS bez schválené Apple Developer registrace.
- ❌ Production track v Play bez 12+ aktivních testerů v closed testingu (Play to v praxi vyžaduje).
- ❌ Nákup followerů, fake recenze, paid placement v early phase.
- ❌ Cokoli, co by porušilo `docs/agents/README.md` nebo `docs/food-data-safety.md`.

## Rizika a fallbacky

| Riziko | Fallback |
|---|---|
| Fable 5 / Mythos 5 nedostupné v týdnu 2 | Kinetic typography video, viz `ai-video-pipeline.md` |
| Apple registrace zdrží iOS | Apple posunout na dny 31–60, Android pokračuje samostatně |
| Google Play zamítne build | Iterovat podle review notes, držet closed testing |
| < 5 live podniků v Pilotu 0 | Prodloužit Pilot 0 o 14 dní, neposouvat na druhé město |
| Hosting domény vypadne | DNS na druhého providera (záloha už registrovaná) |
| Anthropic / OpenAI API limit | Záložní model dle `model-agnostic-agents.md` |

## Týdenní rituály

- **Pondělí ráno (30 min):** Strategy Agent — co je priorita tento týden.
- **Středa večer (15 min):** mini-check, jestli plán drží.
- **Pátek večer (30 min):** Analytics Agent + Pilot 0 update.
- **Neděle (10 min):** ruční zápis do `docs/pilot-0/agent-retro.md` (až vznikne).

## Co znamená „první veřejná důvěryhodná verze"

- Vlastní doména, oba landing pages live.
- Privacy policy publikovaná.
- Support email odpovídá do 48 h.
- Google Play open testing track (testFlight / App Store až později).
- Min. 5 reálných podniků live (s explicitním souhlasem).
- Min. 1 AI video venku s jasnou disclosure.
- Žádný open Safety Guard issue.
- Stav repa pushnutý, žádný „temporary" hack ve store buildu.

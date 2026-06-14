# Budget Options

Tři varianty rozpočtu pro 30denní launch fázi (souběžně s druhou polovinou Pilotu 0). Čísla v CZK + USD orientačně k 2026-06; aktualizovat při změnách ceníků.

> **Předpoklad:** zakladatel pracuje sám, žádný zaměstnanec, žádná agentura. Rozpočty pokrývají **provozní náklady**, ne čas zakladatele.

## Společné fixní položky (vždy)

Tyto výdaje má každá varianta — bez nich není „launch".

| Položka | Cena | Frekvence | Poznámka |
|---|---|---|---|
| Doména `mamhlad.cz` | ~250 CZK | ročně | Forpsi / Wedos / Cloudflare Registrar |
| Google Play Developer | ~625 CZK ($25) | jednorázově | Životnost účtu |
| Apple Developer Program | ~2 500 CZK ($99) | ročně | Až ve fázi iOS, dny 31+ |
| Hosting landing page | 0 CZK | měsíčně | Vercel / Netlify / GitHub Pages free tier |
| Support email | 0 CZK | měsíčně | Forward přes registrar nebo Cloudflare Email |

**Fixní subtotal 30 dnů:** cca **875 CZK** (bez Apple, který přijde po 30 dnech).

---

## Varianta 1: Low Budget — „minimum, ať to běží"

**Cíl:** Dostat Mám hlad veřejně viditelný za co nejméně peněz. Žádné AI video, žádné placené nástroje, maximální use of free tiers.

### Nástroje (AI / agenti)

| Co | Volba | Měsíční náklad |
|---|---|---|
| LLM pro Outreach / Onboarding / Strategy | Claude API pay-as-you-go, lehké použití | ~500 CZK |
| Transcription (Whisper) | OpenAI Whisper API nebo lokálně na CPU | ~200 CZK / 0 CZK |
| Safety Guard / QA Agent | Stejný Claude account | součástí výše |
| Záložní model | Bez aktivního účtu, nasadit ad-hoc | 0 CZK |

**LLM subtotal:** ~500–700 CZK / měsíc.

### Reklama

| Co | Volba | Měsíční náklad |
|---|---|---|
| Paid social | **Žádný** | 0 CZK |
| Organic posts (osobní účty) | Ručně, žádné nástroje | 0 CZK |
| Influencer marketing | Žádný | 0 CZK |

### Store účty

| Co | Cena |
|---|---|
| Google Play | 625 CZK jednorázově |
| Apple (odložit na den 31+) | — |

### Video nástroje

| Co | Volba | Měsíční náklad |
|---|---|---|
| Video generation | **Žádné AI video** — jen kinetic typography v CapCut free | 0 CZK |
| Voiceover | Vlastní hlas zakladatele nebo CapCut TTS free | 0 CZK |
| Stock footage | Pexels / Pixabay zdarma | 0 CZK |
| Hudba | YouTube Audio Library zdarma | 0 CZK |

### Ostatní

| Co | Volba | Měsíční náklad |
|---|---|---|
| Hosting databáze (Supabase) | Free tier | 0 CZK |
| Analytics | Plausible free trial nebo žádný | 0 CZK |
| Google Places API | Free credit ($200), spotřeba ~100 CZK | ~100 CZK |
| Backup hosting | GitHub free | 0 CZK |

### Celkový měsíční náklad — Low

**~1 500–2 000 CZK / měsíc** + jednorázových ~875 CZK fixní.

### Co tím získáme

- Veřejný launch v Google Play closed → open testing.
- Landing page live.
- Pilot 0 dokončený.
- Žádné video s AI rizikem.
- Žádná závislost na premium AI nástroji.

### Co tím neztrácíme

- Hodnotu Pilotu 0 (concierge model je v podstatě zdarma na provozu).
- Důvěryhodnost (landing page + store listing nestojí na video produkci).

### Co tím **ztrácíme**

- Rychlost akvizice (žádný viralní pull bez videa).
- Brand awareness za hranicemi Liberce / blízkého okolí.

---

## Varianta 2: Practical Budget — „prakticky, ne luxusně"

**Cíl:** Solidní launch s rezervou na vyladění. Mix AI + ruční práce. Toto je **default volba pro Mám hlad**.

### Nástroje (AI / agenti)

| Co | Volba | Měsíční náklad |
|---|---|---|
| LLM primární (Claude) | Claude API pay-as-you-go, středně intenzivní | ~1 500 CZK |
| LLM záložní (OpenAI) | GPT-4 mini accounty aktivní, sporadicky | ~400 CZK |
| Transcription | OpenAI Whisper API | ~500 CZK |
| Lokální Llama 3.x na zakladatelově stroji | Pro emergency mode | 0 CZK (hw už mám) |

**LLM subtotal:** ~2 400 CZK / měsíc.

### Reklama

| Co | Volba | Měsíční náklad |
|---|---|---|
| Meta Ads (FB / IG) test campaign | Smal-budget retargeting na Liberec | ~2 000 CZK |
| Google Ads / Search | Žádné v early phase (drahé, low intent na Mám hlad keywords) | 0 CZK |
| Influencer | 1 micro-influencer v Liberci (barter nebo ~3 000 CZK / post) | ~3 000 CZK |

**Reklama subtotal:** ~5 000 CZK / měsíc.

### Store účty

| Co | Cena |
|---|---|
| Google Play | 625 CZK jednorázově |
| Apple | $99 = ~2 500 CZK ročně (start dny 31+) |

### Video nástroje

| Co | Volba | Měsíční náklad |
|---|---|---|
| AI video generation | Runway nebo Pika basic plan | ~750 CZK ($30) |
| Voiceover (ElevenLabs) | Starter | ~250 CZK ($10) |
| Editor (CapCut / Premiere) | CapCut zdarma nebo Premiere existing | 0 CZK |
| Stock footage / hudba | Epidemic Sound (volitelně) | ~500 CZK |

**Video subtotal:** ~1 500 CZK / měsíc.

### Ostatní

| Co | Volba | Měsíční náklad |
|---|---|---|
| Hosting databáze | Supabase free → Pro pokud roste | 0 / ~600 CZK |
| Analytics | Plausible self-host nebo PostHog free | 0 CZK |
| Google Places API | Aktivní pull při rozšíření | ~300 CZK |
| Doménové extras (privacy email) | Cloudflare workers | 0 CZK |

**Ostatní subtotal:** ~300–900 CZK / měsíc.

### Celkový měsíční náklad — Practical

**~9 000–10 000 CZK / měsíc** + jednorázových ~875 CZK.

### Co tím získáme

- AI video pipeline funkční s fallback chain.
- Schopnost rozšířit do druhého města.
- Reálný feedback z paid testů.
- 1 micro-influencer = social proof v Liberci.

### Co tím **ztrácíme**

- Měsíční náklady musí někdo platit. V early stage = zakladatel.
- Komplexitu — víc nástrojů, víc accountů, víc fakturací.

---

## Varianta 3: Aggressive Small Launch — „push, ať to chytne"

**Cíl:** Rychlý ramp-up po validaci Pilotu 0. Více paid kanálů, více video kontentu, plně redundantní AI stack.

### Nástroje (AI / agenti)

| Co | Volba | Měsíční náklad |
|---|---|---|
| LLM primární (Claude) | Vyšší volume | ~4 000 CZK |
| LLM záložní (OpenAI + Gemini) | Aktivní accounty na obou | ~1 500 CZK |
| Transcription (Whisper + Deepgram fallback) | Oba | ~1 000 CZK |
| Vector store (pgvector v Supabase) pro budoucí semantic search | Free tier zatím | 0 CZK |

**LLM subtotal:** ~6 500 CZK / měsíc.

### Reklama

| Co | Volba | Měsíční náklad |
|---|---|---|
| Meta Ads test → scale | Retargeting + lookalike Liberec/Praha | ~10 000 CZK |
| Google Ads (search „kam na oběd Liberec") | Test | ~3 000 CZK |
| Influencer | 2–3 micro-influencers + 1 mid-tier food blogger | ~15 000 CZK |
| Lokální PR (Liberec.cz, denik.cz) | Případně placené článek | ~5 000 CZK |

**Reklama subtotal:** ~33 000 CZK / měsíc.

### Store účty

| Co | Cena |
|---|---|
| Google Play | 625 CZK jednorázově |
| Apple | $99 = ~2 500 CZK ročně (start hned na začátku) |

### Video nástroje

| Co | Volba | Měsíční náklad |
|---|---|---|
| AI video premium (Runway + Pika) | Pro plány obou | ~2 500 CZK |
| ElevenLabs | Creator plan | ~700 CZK |
| Editor (Premiere Pro / DaVinci Studio) | Subscription | ~600 CZK |
| Stock + hudba (Epidemic Sound + Artlist) | Oba | ~1 500 CZK |
| Externí video editor (1 freelance edit / měsíc) | Volitelně | ~5 000 CZK |

**Video subtotal:** ~5 300–10 300 CZK / měsíc.

### Ostatní

| Co | Volba | Měsíční náklad |
|---|---|---|
| Supabase Pro | Větší limity | ~600 CZK |
| PostHog cloud | Aktivní | ~600 CZK |
| Google Places API | Rozšíření do 3+ měst | ~1 500 CZK |
| Vlastní domain email (Fastmail) | Profesionalita | ~250 CZK |

**Ostatní subtotal:** ~3 000 CZK / měsíc.

### Celkový měsíční náklad — Aggressive

**~48 000–55 000 CZK / měsíc** + jednorázové.

### Co tím získáme

- Rychlý awareness v Liberci + první vlna v Praze.
- Vlastní content engine.
- Externí editor = víc videí za stejný čas zakladatele.
- Redundantní LLM stack (žádný single point of failure).

### Co tím **ztrácíme**

- Hodně cash. ~600 000 CZK / rok jen na operativu.
- Riziko, že vypálíme rozpočet dřív, než najdeme PMF.
- Pressure scale = pokušení porušit pravidla (slibovat features, hromadný outreach).

---

## Co bych vybral jako CEO

**Practical budget.** Důvody:

1. **Mám hlad není mass market launch.** Severní hvězda je 30s decision time, ne CAC pod 50 CZK. Aggressive scale by tlačil na metriky, které nejsou pro tento produkt klíčové.
2. **Pilot 0 ještě nedoběhl.** Bez validace, že concierge model funguje za hranicemi Liberce, je aggressive plán hazard.
3. **Practical má AI video pipeline.** Low budget ji nemá → ztrácíme schopnost iterovat kreativně.
4. **Model-agnostic stack v practical je realistický** — Claude primární + GPT záložní + lokální Llama emergency = pokud Fable 5 / Anthropic exportně padne, nestojí ani den.
5. **9–10 tisíc / měsíc je obhájitelné** i bez investora. Solo founder s prací to ustojí.

**Co konkrétně doporučuji v practical zachovat:**
- LLM primární + záložní účet od první chvíle (ne čekat na výpadek).
- Whisper přes API + lokálně připravené (emergency mode).
- 1 micro-influencer v Liberci = social proof, ne CAC kanál.
- Žádné Google Ads dokud nemáme ≥ 20 live podniků.
- AI video produkce začíná v týdnu 2, ale kinetic typography fallback ready od dne 1.

**Co bych v practical změnil podle průběhu:**
- Pokud Pilot 0 selže → spadnout zpět na Low budget pro další 30 dnů.
- Pokud open testing v Play získá > 500 instalací organicky → posílit reklamní subtotal o ~2 000 CZK / měsíc na retargeting.
- Pokud Apple registrace zdrží > 14 dní → posunout iOS výdaje na měsíc 2.

**Co bych v aggressive nedělal vůbec:**
- Externí video editor — zatím to není botleneck.
- Mid-tier food blogger — drahé a snadno authentic-killing pro Mám hlad brand.
- Lokální PR placený článek — víc škodí důvěryhodnosti než pomáhá.

## Rozpočet a Fable 5 výpadek

Pro každou variantu platí: pokud Fable 5 / Mythos 5 zítra zmizí, **rozpočet se nemění**. Záložní modely jsou v každé variantě počítané (LLM primární + záložní). Náklad může mírně narůst (~10–20 %) protože GPT-4 class typicky dražší než Claude Sonnet na ekvivalentní úkol, ale není to katastrofa.

Co se mění, je **velocity** — záložní model může chvíli generovat horší český registr, dokud nepřeladíme prompty. Strategy Agent musí v takovém případě navrhnout 1–2 týdny zpomalení outreach, ne ztracenou kampaň.

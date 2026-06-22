# Resumable business intake first form UX

UX specification for the first real resumable Mám hlad business intake form. This is not a UI implementation, form build, backend plan, database migration, app code change, landing-site change, dependency change, or business outreach.

Based on:

- [`business-intake-data-contract.md`](./business-intake-data-contract.md)
- [`business-intake-schema-draft.md`](./business-intake-schema-draft.md)
- [`business-intake-ui-field-mapping.md`](./business-intake-ui-field-mapping.md)
- [`resumable-business-intake-readiness-checklist.md`](./resumable-business-intake-readiness-checklist.md)
- [`../technical/resumable-business-intake-ui-design.md`](../technical/resumable-business-intake-ui-design.md)
- [`partner-intake-portal-and-voice-mode.md`](./partner-intake-portal-and-voice-mode.md)
- [`partner-onboarding-system.md`](./partner-onboarding-system.md)

Hard rules:

- The form creates a private lead only.
- No profile may be published without explicit business approval of the exact profile draft.
- Mlčení není souhlas.
- Incomplete submissions are allowed where safe.
- AI must never invent photos, reviews, references, allergens, health claims, opening hours, addresses, contact details, or consent.
- Premium status must not affect recommendation logic, ranking, scoring, filtering, fallback placement, or visibility rules.
- A form submit, autosave, uploaded photo, voice note, or resume-link action is not approval to publish.

## 1. First Form Purpose

The first form should feel like a calm first contact, not registration, a contract, or a CMS.

Purpose:

- Let a restaurant, street-food seller, small kitchen, individual cook, or manager send a few useful details quickly.
- Allow incomplete submissions and private unfinished leads.
- Save progress safely so the business can continue later.
- Collect enough information for human follow-up or, later, a private profile draft.
- Make it clear that nothing becomes public without explicit approval.

Primary user promise:

> Pošlete pár věcí. Uložíme je jako soukromý rozpracovaný zájem a případný návrh profilu vám pošleme ke schválení. Bez vašeho výslovného souhlasu nic nezveřejníme.

The form must optimize for:

- Low-friction first contact.
- Mobile use during a busy day.
- Short Czech copy.
- Clear private/public boundary.
- Safe skipped fields.
- No pressure to complete everything at once.

## 2. Proposed Screen and Section Order

The first form should be one lightweight flow with optional sections. The user should be able to save after the first section.

| Order | Screen or section | Purpose | Required for first submit? |
|---|---|---|---|
| 1 | Intro / trust note | Set expectations: private lead, no publication without approval. | yes |
| 2 | Kdo jste | Identify business/cook and contact path. | mostly yes |
| 3 | Co u vás stojí za jídlo | Capture useful food signal without requiring a full menu. | yes if context is otherwise thin |
| 4 | Kde působíte | Capture city/area first, exact address later. | city/area yes |
| 5 | Fotky a podklady | Optional media, rights-aware, can complete later. | no |
| 6 | Hlasem místo psaní | Optional voice note, private by default. | no |
| 7 | Alergeny a dietní poznámky | Optional, cautious, no guarantees. | no |
| 8 | Další kontext | Optional local/tourist/story/language context. | no |
| 9 | Review before submit | Show what will be saved privately and what can be completed later. | yes |
| 10 | Confirmation | Confirm private submission, next steps, resume path. | yes |

Navigation rules:

- Users can skip optional sections with `Doplnit později`.
- Users can save a private unfinished lead before final submit.
- The form should show progress as readiness, not completion pressure.
- The primary submit button must never say `Publikovat`.

## 3. Czech Field Labels

### Kdo jste

| Field label | Schema field | Required | Complete later? | Notes |
|---|---|---|---|---|
| `Název podniku nebo jméno kuchaře` | `business_name_raw` | yes for normal submit | no | Public identity candidate, still verified later. |
| `Typ` | `business_type` | optional at first submit | yes | Restaurant, street food, small kitchen, individual cook, unknown. |
| `Město nebo oblast` | `city_or_area` | yes for normal submit | no | Can be city, district, market, region, festival. |
| `Země` | `country` | optional in Czech-first flow | yes | Must be explicit for international flow. |
| `Kontakt na vás` | `contact_email`, `contact_phone`, `contact_other` | yes for normal submit | no | Internal by default. |
| `Jméno kontaktní osoby` | `contact_person_name` | optional at first submit | yes | Needed before approval. |

### Co u vás stojí za jídlo

| Field label | Schema field | Required | Complete later? | Notes |
|---|---|---|---|---|
| `Co vaříte nebo nabízíte?` | `inbound_message`, `signature_dishes` | recommended | yes | Free text, not full menu. |
| `Jedno jídlo, na které jste hrdí` | `signature_dishes[0]` | optional | yes | Concrete dish only. |
| `Co byste doporučili někomu, kdo je u vás poprvé?` | `chef_recommendation`, `signature_dishes` | optional | yes | Not a quote unless explicitly provided. |
| `Typ kuchyně` | `cuisine_tags` | optional | yes | AI may suggest from text, human verifies. |

### Kde působíte

| Field label | Schema field | Required | Complete later? | Notes |
|---|---|---|---|---|
| `Město, čtvrť, trh nebo oblast` | `city_or_area`, `geo_hint` | yes for normal submit | no for broad area | Supports mobile or irregular businesses. |
| `Adresa` | `address_raw`, `public_address` | optional | yes | Never guessed; public only after approval. |
| `Kdy vás lidé najdou` | `opening_hours_text` | optional | yes | Text input, irregular schedules allowed. |
| `Jak fungujete` | `service_modes` | optional | yes | On site, takeaway, market, festival, catering. |

### Fotky a podklady

| Field label | Schema field | Required | Complete later? | Notes |
|---|---|---|---|---|
| `Fotky jídla nebo místa` | `business_media_assets` | optional | yes | Private until rights and approval. |
| `Popisek k fotce` | `public_caption` | optional | yes | AI may transform only from provided context. |
| `Máte k fotkám práva?` | `rights_status`, `provided_by` | optional before upload | yes | Must be clear before public use. |

### Hlasem místo psaní

| Field label | Schema field | Required | Complete later? | Notes |
|---|---|---|---|---|
| `Hlasová poznámka` | `business_voice_intake` | optional | yes | Private input only. |
| `Jazyk nahrávky` | `language_detected`, `locale_primary` | optional | yes | AI may suggest, human can correct. |

### Alergeny a dietní poznámky

| Field label | Schema field | Required | Complete later? | Notes |
|---|---|---|---|---|
| `Alergeny` | `allergen_notes` | optional | yes | Copy only; human review. |
| `Vegetariánská nebo veganská volba` | `dietary_notes`, `signature_dishes` | optional | yes | No safety guarantee. |
| `Bez lepku / celiakie` | `dietary_notes` | optional | yes | Cautious copy only; no guarantee. |
| `Zdravotní tvrzení` | `health_claims` | not requested | no | Block by default. |

### Další kontext

| Field label | Schema field | Required | Complete later? | Notes |
|---|---|---|---|---|
| `Krátký příběh` | `short_story` | optional | yes | True, calm, no marketing pressure. |
| `Pro místní` | `local_context` | optional | yes | Why locals return. |
| `Pro cestovatele` | `tourist_context` | optional | yes | Practical context for tourists. |
| `Jazyky, kterými se domluvíte` | `languages_supported_raw` | optional | yes | Needs verification before public use. |

## 4. Czech Helper Texts

### Intro

Primary text:

> Nemusíte vyplnit všechno najednou. Stačí pár věcí, uložíme je jako soukromý rozpracovaný zájem a můžete se k nim vrátit později.

Trust note:

> Nic se nezveřejní bez vašeho výslovného schválení. Nejde o publikaci profilu.

### Kdo jste

> Napište jen tolik, abychom věděli, komu se ozvat. Kontakt použijeme pro domluvu a schválení návrhu.

### Co u vás stojí za jídlo

> Nemusíte posílat celé menu. Stačí pár věcí, které byste doporučili člověku, který je u vás poprvé.

### Kde působíte

> Pokud nemáte pevnou adresu nebo pravidelnou otevírací dobu, nevadí. Stačí město, trh, akce nebo oblast.

### Fotky a podklady

> Fotky můžete dodat později. Veřejně použijeme jen fotky, ke kterým máte práva a které schválíte.

### Hlasem místo psaní

> Můžete nám to říct vlastními slovy. Audio je jen soukromý podklad pro návrh a bez souhlasu se nepoužije veřejně.

### Alergeny a dietní poznámky

> Pište jen to, co opravdu víte a můžete potvrdit. Tyto informace bereme opatrně a před zveřejněním je ověřujeme.

### Dalsi kontext

> Můžete doplnit příběh, sezónní věci nebo praktické info pro místní a cestovatele.

## 5. Required vs Optional Fields

Minimum normal submit:

| Field | Required? | Error if missing? | Notes |
|---|---|---|---|
| `business_name_raw` | yes | yes | Required for normal submit, but name-only can be private unfinished save. |
| `city_or_area` | yes | yes | Broad area is enough. |
| Contact method | yes | yes | E-mail, phone, or other channel. |
| `inbound_message` | conditional | yes only when context is thin | Helps avoid empty leads. |

Optional at first submit:

- `business_type`
- `country` in Czech-first flow
- `contact_person_name`
- exact address
- opening hours
- links
- photos
- audio
- signature dish
- chef recommendation
- story
- local/tourist context
- languages
- allergens and diet notes
- premium interest

UX rule:

- Missing optional fields should show `Doplnit později`, not an error.
- The form should not use a percent completion score that feels punitive.
- The form may show readiness labels: `Rozpracováno`, `Stačí pro ozvání`, `Stačí pro soukromý návrh`, `Čeká na schválení`.

## 6. Fields That Can Be Completed Later

Show `Doplnit později` for:

- Type of business.
- Country if Czech-first default is used.
- Exact address.
- Opening hours.
- Photos and captions.
- Full menu.
- Signature dishes beyond a short first note.
- Chef recommendation.
- Tourist/local context.
- Languages supported.
- Prices.
- Allergens and diet notes.
- Premium interest or commercial conversation.

Copy near skipped fields:

> To můžete doplnit později. Bez ověření to nepoužijeme ve veřejném profilu.

For sensitive skipped fields:

> Pokud si nejste jistí, nechte pole prázdné. Radši se doptáme, než abychom něco odhadovali.

## 7. Empty States

### Empty New Form

Message:

> Začněte pár větami. Nemusíte mít připravené fotky, menu ani otevírací dobu.

Primary action:

> Začít

Secondary action:

> Radši doplnit později

### Empty Optional Section

Message:

> Tahle část není povinná. Pomůže nám připravit lepší návrh, ale můžete ji přeskočit.

Action:

> Doplnit později

### Empty Media Section

Message:

> Fotky nejsou potřeba pro první odeslání. Můžete je přidat později.

### Empty Voice Section

Message:

> Pokud se vám nechce psát, můžete přidat krátkou hlasovou poznámku. Není povinná.

### Empty Resume Link Screen

Message:

> Odkaz je neplatný nebo už vypršel. Zkuste si poslat nový odkaz, nebo nám napište.

## 8. Error States

Errors should be clear and calm. They should not imply the business did something wrong.

| Situation | Message |
|---|---|
| Missing business name on normal submit | `Doplňte prosím název podniku nebo jméno, pod kterým vás lidé znají.` |
| Missing city/area on normal submit | `Doplňte prosím město, oblast, trh nebo místo, kde působíte.` |
| Missing contact on normal submit | `Doplňte prosím kontakt, abychom vám mohli poslat soukromý návrh ke schválení.` |
| Thin submission | `Přidáte ještě pár vět o tom, co vaříte nebo nabízíte? Stačí krátce.` |
| Invalid e-mail | `E-mail nevypadá správně. Můžete zadat e-mail, telefon nebo jiný kontakt.` |
| Autosave failed | `Nepodařilo se uložit změny. Zkuste to prosím znovu.` |
| Upload failed | `Soubor se nepodařilo nahrát. Můžete ho zkusit znovu nebo přidat později.` |
| Unsupported file | `Tenhle typ souboru teď neumíme přijmout. Fotky nebo audio můžete přidat později.` |
| Expired resume link | `Odkaz už vypršel. Můžete si poslat nový, nebo nám napsat.` |
| Revoked resume link | `Tenhle odkaz už nejde použít. Kvůli bezpečnosti si vyžádejte nový.` |
| Rate limited | `Zkuste to prosím za chvíli. Chráníme formulář před spamem.` |

Error rules:

- Do not show internal IDs.
- Do not reveal whether a specific lead exists on invalid token screens.
- Do not say `profil nejde publikovat` during first submit; say the lead can be saved privately.
- Do not block optional skipped fields.

## 9. Autosave States and User-Facing Messages

Autosave messages should be short and unobtrusive.

| State | UI label | Message |
|---|---|---|
| Saving | `Ukládám` | `Ukládáme změny...` |
| Saved | `Uloženo` | `Změny jsou uložené jako soukromý rozpracovaný zájem.` |
| Partial saved | `Rozpracováno` | `Máte uložený rozpracovaný zájem. Můžete pokračovat později.` |
| Save failed | `Nepodařilo se uložit` | `Změny se zatím nepodařilo uložit. Zkuste to znovu.` |
| Local only, if ever used | `Uloženo jen v tomto zařízení` | `Tyto změny ještě nejsou bezpečně uložené online.` |

Autosave must not say:

- `Schvaleno`
- `Publikovano`
- `Profil je hotovy`
- `Jste ve vysledcich`
- `Budete doporučováni`

## 10. Resume-Later Flow

Primary path:

1. User starts form.
2. User enters at least one meaningful field.
3. Autosave creates a private unfinished lead or local draft state.
4. User clicks `Uložit rozpracované`.
5. If contact exists, UI offers resume link delivery or shows a safe continuation message.
6. User returns through resume link.
7. UI loads private editable intake fields only.
8. User continues, submits, or saves again.

Resume-later copy:

> Rozpracovaný zájem je uložený soukromě. Můžete se k němu vrátit později.

If contact exists:

> Odkaz pro pokračování vám můžeme poslat na kontakt, který jste zadali.

If contact is missing:

> Bez kontaktu vám odkaz nepošleme. Můžete si ho uložit teď, nebo doplnit kontakt.

Security note:

> Odkaz je jen pro úpravu rozpracovaného zájmu. Nejde přes něj nic zveřejnit.

## 11. Resume-Link Screens and Messages

### Valid Resume Link

Title:

> Pokračovat v rozpracovaném zájmu

Message:

> Tohle je soukromý rozpracovaný zájem. Můžete upravit informace a uložit je. Nic se nezveřejní bez vašeho schválení.

Primary action:

> Pokračovat

Secondary action:

> Uložit a odejít

### Expired Resume Link

Title:

> Odkaz vypršel

Message:

> Kvůli bezpečnosti už tento odkaz nejde použít. Můžete si vyžádat nový odkaz nebo nám napsat.

Primary action:

> Poslat nový odkaz

Secondary action:

> Napsat nám

### Invalid Resume Link

Title:

> Odkaz nejde otevřít

Message:

> Odkaz je neplatný nebo byl změněn. Zkontrolujte ho, vyžádejte si nový, nebo nám napište.

### Revoked Resume Link

Title:

> Odkaz už není aktivní

Message:

> Tenhle odkaz byl z bezpečnostních důvodů zrušen. Můžete si vyžádat nový, pokud chcete pokračovat.

### Already Published Lead

Do not expose profile controls through the resume link. If a published lead is opened through an old resume link:

Title:

> Tenhle odkaz už nejde použít

Message:

> Rozpracovaná část je už uzavřená. Pokud chcete něco upravit, napište nám.

## 12. Confirmation Screen After First Submit

Title:

> Děkujeme, máme váš zájem

Primary message:

> Uložili jsme ho jako soukromý podklad. Pokud z toho připravíme návrh profilu, pošleme vám ho ke schválení.

Safety message:

> Nic se nezveřejní bez vašeho výslovného souhlasu.

Next steps:

- `Projdeme podklady.`
- `Když bude něco chybět, ozveme se.`
- `Návrh profilu uvidíte před jakýmkoli zveřejněním.`

Actions:

- Primary: `Doplnit další informace`
- Secondary: `Zavřít`
- Optional: `Poslat odkaz pro pokračování`

Do not say:

- `Profil je vytvořen`
- `Profil bude zveřejněn`
- `Brzy budete v aplikaci`
- `Získáte lepší pozici`

## 13. Required Copy Phrases

Use these phrases consistently.

### `Rozpracováno`

Use for saved but incomplete private lead.

Example:

> Rozpracováno. Můžete pokračovat teď nebo později.

### `Uloženo`

Use after successful private save.

Example:

> Uloženo jako soukromý rozpracovaný zájem.

### `Doplnit později`

Use on optional sections and non-critical fields.

Example:

> Doplnit později

Helper:

> Tohle není potřeba pro první odeslání.

### `Soukromý návrh profilu`

Use only for internal/private draft, never as public profile.

Example:

> Z podkladů můžeme připravit soukromý návrh profilu a poslat vám ho ke schválení.

### `Nic se nezveřejní bez vašeho schválení`

Use near submit, confirmation, resume screens, and trust notes.

Preferred full form:

> Nic se nezveřejní bez vašeho výslovného schválení.

## 14. Trust and Safety Copy

Trust copy should be plain, short, and repeated at key moments.

Near first submit:

> Odesláním posíláte zájem a podklady. Není to publikace profilu.

Near photo upload:

> Fotky použijeme veřejně jen tehdy, když k nim máte práva a schválíte jejich použití.

Near voice upload:

> Audio slouží jen jako soukromý podklad. Nepoužijeme ho veřejně bez samostatného souhlasu.

Near allergens:

> Alergeny a dietní informace bereme opatrně. Neuvádíme je jako záruku.

Near resume link:

> Odkaz slouží jen k pokračování v rozpracovaném zájmu. Nejde přes něj nic zveřejnit.

Near premium mention, if ever shown:

> Rozšířený profil ani placený vztah neovlivňují doporučení v aplikaci.

## 15. What the UI Must Not Imply

The UI must not imply:

- The profile is automatically published after submit.
- The business is guaranteed to appear in Mám hlad.
- The business is guaranteed promotion, reach, ranking, or traffic.
- Premium status affects recommendations.
- AI can fill missing facts automatically.
- Uploaded photos can be used publicly without rights and approval.
- A voice note is public content.
- A resume link is identity proof or approval.
- A checkbox during first submit is publication approval.
- Allergens, gluten-free claims, celiac suitability, or absence of allergens are guaranteed.

Forbidden button labels:

- `Publikovat`
- `Zveřejnit profil`
- `Schválit profil` in the first intake form
- `Získat lepší pozici`
- `Propagovat podnik`

Forbidden success messages:

- `Profil je online`
- `Jste v doporučeních`
- `AI doplnila chybějící informace`
- `Vaše fotky jsou zveřejněné`

## 16. Notes by Business Type

### Restaurants

UX notes:

- Address and opening hours are useful but should not block first submit.
- Public contact details must be separate from private contact details.
- Menu details should be narrowed to a few recommended dishes, not full menu entry.

Suggested helper:

> Pokud máte pevnou adresu a otevírací dobu, můžete je doplnit. Když ne, stačí zatím město a pár vět.

### Street-Food Sellers

UX notes:

- Do not force permanent address.
- Emphasize markets, events, seasons, weather, and flexible availability.
- Opening hours may be text, not structured weekly schedule.

Suggested helper:

> Pokud jezdíte po trzích nebo akcích, napište oblast, trh nebo typ místa. Pevná adresa není povinná.

### Small Kitchens

UX notes:

- Treat address and pickup/production details as sensitive.
- Make clear that private contact and private address are not public by default.
- Allow business to explain how ordering/pickup works later, not in first submit.

Suggested helper:

> Soukromé adresy nebo výdejní místa nemusíte zveřejňovat. Nejdřív si ujasníme, co má být veřejné.

### Individual Cooks

UX notes:

- Allow personal name, project name, pop-up name, or guest event identity.
- Do not imply permanent venue.
- Confirm what identity can be public.

Suggested helper:

> Můžete napsat svoje jméno, název projektu nebo pop-upu. Později potvrdíme, co se má ukazovat veřejně.

## 17. Czech and International Businesses

### Czech-First Flow

UX notes:

- Czech labels and helper texts are the default.
- Country can be prefilled internally as Czechia only if visibly confirmable later.
- Do not hide country forever.

Suggested country helper:

> Pokud působíte mimo Česko, doplňte prosím zemi. Pomůže nám správně chápat adresu, jazyk i místní kontext.

### International Flow

UX notes:

- Country should be visible early.
- Preserve original names and local address formats.
- Do not assume Czech legal, hygiene, payment, or opening-hour norms.
- Translation is a derived draft and needs verification.

Suggested helper:

> Názvy, adresy a místní zvyklosti můžete napsat tak, jak je běžně používáte. Překlad případně připravíme jako soukromý návrh.

## 18. Tourists and Locals

The first form should gather optional context for both locals and tourists without making it feel like extra homework.

For locals:

- Why people return.
- What is seasonal.
- What the place is known for.
- Who stands behind the food.

For tourists:

- What to order first.
- How to find the place.
- Which languages may work.
- Practical notes about payment, timing, or access, only if business provides them.

Suggested optional prompt:

> Je něco, co by měl vědět místní host nebo cestovatel, který je u vás poprvé?

AI may later suggest local/tourist copy from business-provided facts, but human review and business approval decide what can be public.

## 19. First-Form UX Acceptance Checklist

Before implementation, the UX should pass this checklist:

- [ ] First submit is possible with only minimum safe fields.
- [ ] Optional sections can be skipped with `Doplnit později`.
- [ ] Autosave copy says private save, not approval or publication.
- [ ] Resume screens do not reveal private data on invalid or expired links.
- [ ] Confirmation screen says private lead, not public profile.
- [ ] Photo copy mentions rights and approval.
- [ ] Voice copy says private input and no public use without consent.
- [ ] Allergen copy is cautious and not a guarantee.
- [ ] Premium copy, if shown, clearly says no recommendation influence.
- [ ] No button or success state implies automatic publication.
- [ ] No UI text says AI will invent or complete missing facts.

## 20. Explicit Non-Goals

This UX spec does not create:

- UI implementation.
- Forms.
- Backend endpoints.
- Database migrations.
- App code changes.
- Landing-site changes.
- Dependencies.
- Business outreach.
- Recommendation engine changes.
- Premium profile implementation.
- Voice transcription integration.

The first form should be gentle at the start and strict at the boundary: easy to send a private lead, impossible to publish without human review and explicit business approval.

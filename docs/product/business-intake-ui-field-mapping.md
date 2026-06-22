# Business intake UI field mapping

Product mapping from the future business intake schema to the first lightweight intake UI. This is not a UI implementation, form build, backend plan, database migration, or landing-site change.

Based on:

- [`business-intake-data-contract.md`](./business-intake-data-contract.md)
- [`business-intake-schema-draft.md`](./business-intake-schema-draft.md)
- [`partner-intake-portal-and-voice-mode.md`](./partner-intake-portal-and-voice-mode.md)
- [`partner-onboarding-system.md`](./partner-onboarding-system.md)

Hard rules:

- No profile may be published without explicit business approval.
- Mlčení není souhlas.
- AI must never invent photos, reviews, references, allergens, health claims, opening hours, addresses, or contact details.
- Premium status must not affect recommendation logic.
- The first UI must accept low-friction partial leads where safe.
- A submitted form, e-mail, or voice note is not approval to publish.
- This document does not create UI, forms, backend, migrations, dependencies, app code, landing-site code, or business outreach.

## Three gates

| Gate | Meaning | Product rule |
|---|---|---|
| Minimum submit fields | What a business can send with very little friction. | Accept partial leads if we can contact the submitter and understand the rough context. |
| Minimum profile draft fields | What must be present before AI/human prepares a private profile draft. | Enough confirmed business-provided information to draft without guessing. |
| Required before publishing | What must be verified and explicitly approved before public profile publication. | No public profile without human review and explicit business approval of the exact draft. |

## Gate 1: minimum submit fields

The first lightweight UI should feel like: "Pošlete pár věcí, připravíme návrh a ozveme se." It should not feel like registration, a contract, or a full CMS.

Minimum fields to allow submission:

| UI label | Schema field | Required to submit | Can be unknown yet | AI action | Human verification | Business approval before publishing | Helper text |
|---|---|---|---|---|---|---|---|
| Název podniku nebo jméno kuchaře | `business_name_raw` | yes | no | copy | yes | yes | Napište název, pod kterým Vás lidé znají. |
| Město nebo oblast | `city_or_area` | yes | no | copy | yes | yes | Stačí město, čtvrť, trh nebo oblast, kde působíte. |
| Kontakt na Vás | `contact_email`, `contact_phone`, `contact_other` | yes | no | copy | yes | no, unless public | E-mail, telefon nebo jiný kontakt. Použijeme ho jen pro domluvu. |
| Krátká zpráva | `inbound_message` | yes | no | transform | yes | no | Stačí pár vět. Co vaříte, kde jste, proč píšete. |
| Typ podniku | `business_type` | optional | yes | suggest | yes | yes | Restaurace, street food, malá kuchyně, kuchař, nebo zatím nevím. |
| Země | `country` | optional for first CZ UI, yes for international UI | yes | suggest | yes | yes | Pro Česko můžeme předvyplnit, u zahraničí potvrdit. |
| Web / Instagram / odkaz | `social_links`, `website_url` | optional | yes | copy | yes | yes if public | Pokud něco máte, pošlete odkaz. Není povinné. |

Submission copy:

- Nad tlačítkem: `Pošleme Vám zpátky návrh profilu ke schválení. Bez Vašeho výslovného souhlasu nic nezveřejníme.`
- Tlačítko: `Poslat zájem`
- Pod tlačítkem: `Mlčení není souhlas. Tohle není publikace profilu.`

Fields intentionally not required at submit:

- Address.
- Opening hours.
- Photos.
- Full menu.
- Allergens.
- Prices.
- Reviews or references.
- Premium interest.

Reason: first contact should be easy. Missing sensitive or factual fields can be collected later by human follow-up.

## Gate 2: minimum profile draft fields

A private profile draft can be prepared only when there is enough business-provided information to avoid guessing. Draft means internal/private, not public.

Minimum fields before draft:

| UI/source label | Schema field | Required before draft | Can be unknown yet | AI action | Human verification | Business approval before publishing | Notes |
|---|---|---|---|---|---|---|---|
| Název podniku nebo kuchaře | `display_name` | yes | no | transform | yes | yes | May clean punctuation, not rename. |
| Typ podniku | `business_type` | yes | no | suggest | yes | yes | Human confirms if AI inferred. |
| Město / oblast / kontext místa | `city_or_area`, `location_note` | yes | no | copy/transform | yes | yes | May be non-address location for street food. |
| Kontakt pro schválení | `contact_person_name`, `contact_email` or `contact_phone` | yes | no | copy | yes | no, unless public | Needed to send draft for approval. |
| Co vaříte / co stojí za doporučení | `signature_dishes`, `cuisine_tags`, `inbound_message` | yes | no | suggest/transform | yes | yes | AI can extract from business text, not invent dishes. |
| Jedna věta od člověka | `chef_recommendation` or `short_story` | optional but recommended | yes | transform | yes | yes | If missing, draft can contain a question instead of fake quote. |
| Pro koho je to užitečné | `local_context`, `tourist_context` | optional | yes | suggest/transform | yes | yes | AI may propose from supplied facts only. |
| Otevírací doba | `opening_hours_text` | optional | yes | copy | yes | yes | If unknown, draft says nothing or asks. |
| Fotky | `business_media_assets` | optional | yes | none/transform caption | yes | yes | No fake or borrowed photos. |
| Alergeny / dietní poznámky | `allergen_notes`, `dietary_notes` | optional | yes | copy | yes | yes | Default unknown; cautious language only. |

If a draft field is missing:

- AI may create an internal question.
- AI may leave the public-facing section out.
- AI must not fill the gap from vibes, assumptions, map listings, reviews, or generic cuisine knowledge.

## Gate 3: required before publishing

Publishing requires a specific approved draft version. It is not enough that a business submitted data.

Required before public profile:

| Requirement | Schema layer/field | Required before publishing | AI action | Human verification | Business approval | Notes |
|---|---|---|---|---|---|---|
| Exact approved draft | `business_profile_drafts.draft_id`, `business_approval_events.draft_id` | yes | none | yes | yes | Approval is tied to one version. |
| Explicit business approval | `business_approval_events.event_type = approved` | yes | none | yes | yes | Silence, form submit, or audio upload is not approval. |
| Approval evidence | `evidence_kind`, `evidence_location`, `approved_at` | yes | none | yes | yes | E-mail, dashboard action, signed form, or recorded call note. |
| Verified display name | `display_name` | yes | transform | yes | yes | No invented or embellished name. |
| Verified location context | `city_or_area`, optional `public_address`, `location_note` | yes | copy/transform | yes | yes | Public address only if approved. |
| Verified public contact, if shown | `public_contact` | optional | copy | yes | yes | Internal contact is not automatically public. |
| Verified opening hours, if shown | `opening_hours_text` | optional | copy | yes | yes | If not verified, omit or mark as not listed. |
| Verified dishes and descriptions | `signature_dishes`, `chef_recommendation`, `short_story` | yes | transform | yes | yes | AI can polish, not invent. |
| Media rights and consent | `business_media_assets.rights_status`, `consent_for_publication` | optional unless media is shown | none | yes | yes | Unknown rights block public media. |
| Allergen/diet safety | `allergen_notes`, `dietary_notes`, verification items | optional unless shown | copy | yes | yes | No guarantees. Use cautious wording. |
| No health claims | `health_claims` | yes | none | yes | yes | Default absent. Escalate any claim. |
| No fake reviews/references | `review_or_reference_notes`, verification items | yes | copy only | yes | yes | Use only sourced and approved references. |
| Publishing gate | `business_publication_status.publication_status` | yes | none | yes | yes | Must not become `published` before all gates pass. |
| Premium isolation | `premium_status` | yes | none | yes | no for ranking | Premium metadata must never feed recommendation logic. |

## Proposed first UI sections

The first UI should have few visible sections. Optional depth can expand after the minimum submit.

### 1. Kdo jste

Helper text: `Napište jen tolik, abychom věděli, komu se ozvat. Profil připravíme až jako návrh ke schválení.`

| UI label | Schema field | Submit | Draft | Publish | Unknown yet | AI may | Never invent | Human check | Business approval |
|---|---|---|---|---|---|---|---|---|---|
| Název podniku nebo jméno kuchaře | `business_name_raw` / `display_name` | required | required | required | no | copy/transform | yes | yes | yes |
| Typ | `business_type` | optional | required | required | yes | suggest | yes | yes | yes |
| Město nebo oblast | `city_or_area` | required | required | required | no | copy | yes | yes | yes |
| Země | `country` | optional in CZ-first UI | required | required | yes | suggest | yes | yes | yes |
| Kontakt na Vás | `contact_email`, `contact_phone`, `contact_other` | required | required | optional public | no | copy | yes | yes | only if public |

### 2. Co u Vás stojí za jídlo

Helper text: `Nemusíte posílat celé menu. Stačí pár věcí, které byste doporučili člověku, který je u Vás poprvé.`

| UI label | Schema field | Submit | Draft | Publish | Unknown yet | AI may | Never invent | Human check | Business approval |
|---|---|---|---|---|---|---|---|---|---|
| Co vaříte nejraději? | `inbound_message`, `signature_dishes` | optional | required in some form | required in final profile | yes | suggest/transform from text | yes | yes | yes |
| Jedno jídlo, na které jste hrdí | `signature_dishes[0]` | optional | recommended | optional | yes | transform | yes | yes | yes |
| Co by řekl kuchař hostovi? | `chef_recommendation` | optional | optional | optional | yes | transform | yes, as a quote | yes | yes |
| Typ kuchyně | `cuisine_tags` | optional | optional | optional | yes | suggest | yes as fact | yes | yes |

### 3. Kde a kdy Vás lidé najdou

Helper text: `Jestli nemáte pevnou adresu nebo pravidelnou otevírací dobu, nevadí. Napište to lidsky.`

| UI label | Schema field | Submit | Draft | Publish | Unknown yet | AI may | Never invent | Human check | Business approval |
|---|---|---|---|---|---|---|---|---|---|
| Adresa | `address_raw`, `public_address` | optional | optional | optional | yes | copy | yes | yes | yes |
| Trh, stánek, akce nebo oblast | `geo_hint`, `location_note` | optional | optional | optional | yes | transform | yes | yes | yes |
| Otevírací doba | `opening_hours_text` | optional | optional | optional | yes | copy | yes | yes | yes |
| Jak fungujete | `service_modes` | optional | optional | optional | yes | suggest from text | yes as fact | yes | yes |

### 4. Fotky a další podklady

Helper text: `Fotky můžete dodat později. Použijeme jen ty, ke kterým máte práva a které schválíte.`

| UI label | Schema field | Submit | Draft | Publish | Unknown yet | AI may | Never invent | Human check | Business approval |
|---|---|---|---|---|---|---|---|---|---|
| Fotky jídel nebo místa | `business_media_assets` | optional | optional | optional | yes | none | yes | yes | yes |
| Popisek fotky | `public_caption` | optional | optional | optional | yes | transform | yes | yes | yes |
| Krátké video | `business_media_assets.kind = video` | optional | optional | optional | yes | none | yes | yes | yes |

### 5. Alergeny a dietní poznámky

Helper text: `Pište jen to, co opravdu víte a můžete potvrdit. Tyto informace bereme opatrně a ověřujeme je.`

| UI label | Schema field | Submit | Draft | Publish | Unknown yet | AI may | Never invent | Human check | Business approval |
|---|---|---|---|---|---|---|---|---|---|
| Alergeny | `allergen_notes` | optional | optional | optional | yes | copy only | yes | yes | yes |
| Vegetariánská / veganská volba | `dietary_notes`, `signature_dishes` | optional | optional | optional | yes | suggest from explicit text | yes as guarantee | yes | yes |
| Bez lepku / celiakie | `dietary_notes`, verification item | optional | optional | optional | yes | copy only | yes as safety claim | yes | yes |
| Zdravotní tvrzení | `health_claims` | not requested | blocked by default | blocked by default | yes | none | yes | yes | yes |

### 6. Ještě něco důležitého?

Helper text: `Můžete doplnit příběh, sezónní věci nebo praktické info pro místní a cestovatele.`

| UI label | Schema field | Submit | Draft | Publish | Unknown yet | AI may | Never invent | Human check | Business approval |
|---|---|---|---|---|---|---|---|---|---|
| Krátký příběh | `short_story` | optional | optional | optional | yes | transform | yes | yes | yes |
| Pro místní | `local_context` | optional | optional | optional | yes | suggest/transform | yes | yes | yes |
| Pro cestovatele | `tourist_context` | optional | optional | optional | yes | suggest/transform | yes | yes | yes |
| Jazyky, kterými se domluvíte | `languages_supported_raw` | optional | optional | optional | yes | copy | yes | yes | yes |

## Fields AI may suggest from business-provided text

AI may suggest these only from explicit business-provided text, voice transcript, e-mail, or human notes:

- `business_type`
- `cuisine_tags`
- `service_modes`
- `signature_dishes`
- `local_context`
- `tourist_context`
- `field_label` and `risk_category` in verification items
- Follow-up questions for missing fields

Every suggestion must remain marked for human verification until reviewed.

## Fields AI must never invent

AI must never invent or guess:

- Photos or photo rights.
- Reviews, references, awards, citations, or guest quotes.
- Allergens, ingredient safety, celiac suitability, or absence of allergens.
- Health claims, treatment claims, detox claims, or disease/diet suitability.
- Opening hours, seasonal schedule, event schedule, or current availability.
- Addresses, exact location, phone, e-mail, social links, or public contact details.
- Names of owners, cooks, staff, or approving people.
- Prices, discounts, daily menus, or availability at a specific time.
- Premium status, commercial terms, or paid benefits.

## Business type notes

| Type | UI behavior |
|---|---|
| Restaurant | Address and opening hours are useful, but still optional at first submit and verified before publishing. |
| Street-food seller | Emphasize `geo_hint`, markets, events, weather/season changes, and "unknown yet" for fixed address/hours. |
| Small kitchen | Keep private address and pickup/production details separate from public profile fields. |
| Individual cook | Allow personal name, project name, pop-up name, guest event, or no permanent place. Confirm what can be public. |

## Czech and international notes

- First Czech UI can default country to Czechia internally, but should not hide country forever.
- International intake needs country visible early because legal, address, language, currency, and opening-hour context differ.
- Store original language; translations are derived and need verification.
- Do not normalize away local address formats, names, holidays, markets, or payment context.
- Tourist-facing copy can explain and translate, but must not change confirmed meaning.

## Tourists and locals

The UI should gather enough to serve both:

- Local context: why people nearby return, what is seasonal, what the place is known for.
- Tourist context: what to order first, how to find the place, whether language/payment/location is easy, and what practical friction exists.

These fields are useful but not required for the first submit. AI may suggest a draft from supplied facts, then human and business approval decide what can be public.

## Premium boundary

The first intake UI should not ask for premium status as a ranking or recommendation input.

If premium interest is ever collected later:

- Store it outside recommendation inputs.
- Treat it as business/presentation metadata only.
- Never use it for scoring, ranking, filtering, fallback placement, or "sponsored top" behavior.
- Keep the same approval, safety, photo, allergen, and truthfulness rules for premium and non-premium profiles.

## Explicit non-goals

- No UI implementation.
- No form creation.
- No backend implementation.
- No database migrations.
- No app code changes.
- No landing-site changes.
- No dependency changes.
- No business outreach.
- No recommendation engine changes.

# Business intake schema draft

Implementation-oriented draft for future Mám hlad business intake data. This is not a backend implementation, database migration, form spec, or production schema. It turns the product rules from [`business-intake-data-contract.md`](./business-intake-data-contract.md), [`partner-intake-portal-and-voice-mode.md`](./partner-intake-portal-and-voice-mode.md), [`partner-onboarding-system.md`](./partner-onboarding-system.md), and [`premium-partner-profiles.md`](./premium-partner-profiles.md) into a practical schema shape for later review.

Hard rules that apply to every layer:

- No profile may be published without explicit business approval.
- Mlčení není souhlas.
- AI must never invent photos, reviews, references, allergens, health claims, opening hours, addresses, or contact details.
- Premium status must not affect recommendation logic, ranking, scoring, filtering, or fallback placement.
- Allergens, diet notes, and health claims are always cautious, source-bound, and human-reviewed.
- This draft does not add backend, forms, migrations, app code, landing-site code, dependencies, or outreach to businesses.

## Layer overview

| Layer | Proposed record | Purpose |
|---|---|---|
| Lead intake | `business_intake_leads` | One row per inbound business/cook lead. |
| Profile draft | `business_profile_drafts` | Versioned private profile payloads prepared from lead data. |
| Business approval evidence | `business_approval_events` | Append-only approval, rejection, and revision evidence. |
| Media assets | `business_media_assets` | Photos, video, and other files with consent and source metadata. |
| Voice/audio intake and retention | `business_voice_intake` | Audio-specific metadata, transcription policy, and deletion tracking. |
| Verification status | `business_verification_items` | Field-level facts needing human or business verification. |
| Publishing status | `business_publication_status` | Publication gate for a specific approved draft. |

Suggested enums are descriptive strings in this draft. A future implementation can convert them to database enums, check constraints, or application-level constants.

## Field policy columns

Each layer below uses the same policy columns:

| Column | Meaning |
|---|---|
| Field | Proposed field name. |
| Type | Draft type, not a migration type. |
| Required | Required for that layer to be useful, not necessarily required to receive a lead. |
| Source of truth | Where the value must ultimately come from. |
| AI action | `copy`, `suggest`, `transform`, or `none`. |
| Human verification | Whether a human must verify before use. |
| Business approval before publishing | Whether the business must approve before this value appears publicly. |
| Notes | Practical notes and edge cases. |

AI actions:

- `copy` - AI may copy from explicit input without changing meaning.
- `suggest` - AI may propose a value or question, but it stays unverified.
- `transform` - AI may summarize, translate, normalize, or rewrite without adding facts.
- `none` - AI must not create or change this value.

## 1. Lead intake

Proposed record: `business_intake_leads`

Purpose: capture inbound interest from form, voice, e-mail, referral, or manual entry. A lead is not a public profile and not approval to publish.

| Field | Type | Required | Source of truth | AI action | Human verification | Business approval before publishing | Notes |
|---|---|---|---|---|---|---|---|
| `lead_id` | uuid/string | yes | System | none | no | no | Stable internal ID. |
| `created_at` | datetime | yes | System | none | no | no | Creation timestamp. |
| `updated_at` | datetime | yes | System | none | no | no | Last internal update. |
| `source_channel` | enum: `form`, `voice`, `email`, `referral`, `manual`, `other` | yes | Intake channel | copy | no | no | Helps route processing. |
| `business_name_raw` | string | yes | Business or submitter | copy | yes | yes | AI must not invent or "improve" the name. |
| `business_type` | enum: `restaurant`, `street_food`, `small_kitchen`, `individual_cook`, `other`, `unknown` | yes | Business, submitter, or human reviewer | suggest | yes | yes | AI may suggest from wording, but uncertain cases stay `unknown` or `other`. |
| `country` | string | yes | Business or submitter | copy | yes | yes | Use country as submitted; do not assume Czech context. |
| `city_or_area` | string | yes | Business or submitter | copy | yes | yes | Can be city, market, district, festival, region, or operating area. |
| `address_raw` | string | optional | Business or verified public source | copy | yes | yes | AI must never invent addresses. |
| `geo_hint` | string | optional | Business or submitter | transform | yes | yes | Useful for markets, pop-ups, trucks, and mobile sellers. |
| `contact_person_name` | string | yes | Business or submitter | copy | yes | no | Internal contact; public display requires separate approval. |
| `contact_email` | string | optional | Business or submitter | copy | yes | no | Internal by default. AI must not guess. |
| `contact_phone` | string | optional | Business or submitter | copy | yes | no | Internal by default. AI must not guess. |
| `contact_other` | string | optional | Business or submitter | copy | yes | no | Instagram DM, WhatsApp, or other channel. |
| `locale_primary` | string | yes | Submission metadata or human reviewer | suggest | yes | no | Example: `cs-CZ`, `en-US`, `de-DE`. |
| `languages_supported_raw` | array/string | optional | Business or submitter | copy | yes | yes | Tourist-facing language claims need verification. |
| `inbound_message` | text | optional | Business or submitter | copy | no | no | Raw private input. Not public. |
| `lead_status` | enum | yes | Operations | none | no | no | Suggested values: `new`, `intake_submitted`, `needs_clarification`, `draft_ready`, `rejected`. |
| `assigned_to` | string | optional | Operations | none | no | no | Internal owner, usually founder in early phase. |
| `internal_notes` | text | optional | Human reviewer | none | no | no | Never public. |

Notes:

- For restaurants, address may become important earlier.
- For street-food sellers, `geo_hint`, recurring markets, and event-based availability may be more useful than a fixed address.
- For small kitchens, public address can be sensitive; keep internal and public fields separate.
- For individual cooks, the public identity may be a personal name, project name, or pop-up name, and must be confirmed.
- For international businesses, preserve local address format, local naming, country, language, and currency context.

## 2. Profile draft

Proposed record: `business_profile_drafts`

Purpose: store private, versioned profile drafts. Drafts are not public. AI can help transform submitted facts into Mám hlad style, but cannot invent missing facts.

| Field | Type | Required | Source of truth | AI action | Human verification | Business approval before publishing | Notes |
|---|---|---|---|---|---|---|---|
| `draft_id` | uuid/string | yes | System | none | no | no | Stable draft ID. |
| `lead_id` | uuid/string | yes | Lead intake | none | no | no | Links to `business_intake_leads`. |
| `version` | integer | yes | System | none | no | no | Append-only versions. |
| `created_at` | datetime | yes | System | none | no | no | Draft creation timestamp. |
| `created_by` | enum: `profile_draft_agent`, `human_reviewer`, `business_revision`, `migration` | yes | System/human | none | no | no | Tracks authorship. |
| `display_name` | string | yes | Lead/business | transform | yes | yes | May normalize punctuation only if meaning stays intact. |
| `business_type` | enum | yes | Lead/business/human | suggest | yes | yes | Same supported types as the contract. |
| `country` | string | yes | Lead/business | copy | yes | yes | Do not infer country from language. |
| `city_or_area` | string | yes | Lead/business | copy | yes | yes | Required for usable recommendations, but not invented. |
| `public_address` | string | optional | Business-approved source | copy | yes | yes | Separate from internal address. |
| `location_note` | string | optional | Business or human reviewer | transform | yes | yes | Good for markets, pop-ups, hard-to-find places. |
| `cuisine_tags` | array | optional | Business plus human reviewer | suggest | yes | yes | AI may suggest tags from stated cuisine; human must verify. |
| `service_modes` | array | optional | Business | suggest | yes | yes | Examples: dine-in, takeaway, market, festival, catering. |
| `signature_dishes` | array of objects | optional | Business | transform | yes | yes | Concrete dishes only. No invented menu items. |
| `chef_recommendation` | text | optional | Business/cook | transform | yes | yes | AI may polish wording, not invent quotes. |
| `short_story` | text | optional | Business/human interview | transform | yes | yes | Editorial, true, calm, no fake origin story. |
| `local_context` | text | optional | Business/human reviewer | transform | yes | yes | Why locals might care. |
| `tourist_context` | text | optional | Business/human reviewer | transform | yes | yes | What a visitor needs to understand quickly. |
| `opening_hours_text` | string | optional | Business or verified source | copy | yes | yes | AI must never invent opening hours. Mark as changeable. |
| `price_notes` | string | optional | Business | transform | yes | yes | Orientační only; avoid precise claims unless confirmed. |
| `dietary_notes` | text | optional | Business | copy | yes | yes | Must be cautious and never a guarantee. |
| `allergen_notes` | text | optional | Business | copy | yes | yes | Business-confirmed only; human safety review required. |
| `health_claims` | array/text | optional | Business plus legal/human review | none | yes | yes | Default should be empty. Do not publish casual health claims. |
| `public_contact` | object | optional | Business | copy | yes | yes | Only contact details explicitly approved for public use. |
| `review_or_reference_notes` | array/text | optional | Source plus consent | copy | yes | yes | No fake reviews, no invented references. |
| `premium_profile_metadata` | object | optional | Business relationship/human | none | yes | yes | Presentation metadata only; never recommendation input. |
| `draft_payload` | json/object | yes | Draft builder | transform | yes | yes | Full draft snapshot. |
| `draft_notes` | text | optional | AI/human | suggest | yes | no | Internal notes, questions, uncertainty. |

Notes:

- Czech businesses can use Czech text as source of truth; translations are separate derived drafts.
- International businesses should keep original names, local address format, and local context.
- Tourist text may simplify, translate, and explain, but must not add facts.
- For individual cooks, avoid implying a permanent venue unless confirmed.
- For small kitchens, separate public profile content from private operational/contact data.

## 3. Business approval evidence

Proposed record: `business_approval_events`

Purpose: append-only evidence that a business approved, rejected, or requested changes to a specific profile draft. This is the publication gate.

| Field | Type | Required | Source of truth | AI action | Human verification | Business approval before publishing | Notes |
|---|---|---|---|---|---|---|---|
| `approval_event_id` | uuid/string | yes | System | none | no | no | Stable event ID. |
| `lead_id` | uuid/string | yes | Lead intake | none | no | no | Links to lead. |
| `draft_id` | uuid/string | yes | Profile draft | none | no | no | Approval is tied to one draft version. |
| `event_type` | enum: `sent_to_business`, `approved`, `rejected`, `changes_requested`, `approval_revoked` | yes | Human reviewer/business | none | yes | yes | Only `approved` can unlock publishing. |
| `actor_type` | enum: `business`, `human_reviewer`, `system` | yes | Operations | none | yes | no | `business` required for approval. |
| `actor_name` | string | optional | Business/human reviewer | copy | yes | no | Internal unless approved for public use. |
| `actor_contact` | string | optional | Business/human reviewer | copy | yes | no | Internal evidence. |
| `authority_note` | text | optional | Human reviewer | none | yes | no | Why this person can approve. |
| `evidence_kind` | enum: `email`, `signed_form`, `dashboard_action`, `recorded_call_note`, `message_screenshot`, `other` | yes | Human reviewer/system | none | yes | no | Store source securely. |
| `evidence_location` | string | yes | System/human reviewer | none | yes | no | Link/path/reference to proof. |
| `approved_scope` | array | optional | Business approval | copy | yes | yes | Example: text, photos, public contact, opening hours. |
| `approved_at` | datetime | optional | Evidence timestamp | none | yes | yes | Required for publishing. |
| `notes` | text | optional | Human reviewer | none | yes | no | Internal. |

Rules:

- Approval must be explicit and tied to `draft_id`.
- Silence, form submission, audio upload, or a general inbound message is not approval.
- Any material change after approval creates a new draft and needs new approval for changed fields.
- An approval event must not be edited to change its meaning; append a new event instead.

## 4. Media assets

Proposed record: `business_media_assets`

Purpose: track photos, video, and future profile media with source, rights, consent, and publication status. Raw audio belongs primarily in the voice/audio layer, with optional file linkage here only as private media.

| Field | Type | Required | Source of truth | AI action | Human verification | Business approval before publishing | Notes |
|---|---|---|---|---|---|---|---|
| `media_id` | uuid/string | yes | System | none | no | no | Stable asset ID. |
| `lead_id` | uuid/string | yes | Lead intake | none | no | no | Links to lead. |
| `draft_id` | uuid/string | optional | Profile draft | none | no | yes | Required before public use in a specific draft. |
| `kind` | enum: `photo`, `video`, `audio`, `document`, `other` | yes | Upload/system | copy | yes | yes | `audio` is private unless separately approved. |
| `storage_path` | string | yes | System | none | yes | no | Private storage by default. |
| `original_filename` | string | optional | Upload metadata | copy | no | no | Internal metadata. |
| `provided_by` | enum: `business`, `team_with_consent`, `third_party_with_rights`, `unknown` | yes | Human reviewer/business | none | yes | yes | `unknown` cannot be published. |
| `rights_status` | enum: `unknown`, `claimed_by_business`, `team_created`, `licensed`, `blocked` | yes | Human reviewer | none | yes | yes | Must not be `unknown` or `blocked` for public use. |
| `consent_for_publication` | boolean | yes | Business approval | none | yes | yes | Default false. |
| `public_caption` | string | optional | Business/human reviewer | transform | yes | yes | AI may rewrite, not invent context. |
| `contains_person` | boolean/unknown | optional | Human reviewer | suggest | yes | yes | Person photos need extra care. |
| `created_at` | datetime | yes | System | none | no | no | Upload timestamp. |
| `deleted_at` | datetime | optional | System | none | yes | no | For removal/retention tracking. |

Rules:

- No fake photos, stock photos presented as real business media, or AI-generated food images presented as real dishes.
- No photos from Google Maps, review sites, social media, or press pages unless rights and consent are clear.
- Media can be stored privately for review before approval, but public display requires explicit approval.

## 5. Voice/audio intake and retention

Proposed record: `business_voice_intake`

Purpose: separate raw audio, transcript, retention, provider constraints, and private draft usage. Audio is an input channel, not consent to publish.

| Field | Type | Required | Source of truth | AI action | Human verification | Business approval before publishing | Notes |
|---|---|---|---|---|---|---|---|
| `voice_intake_id` | uuid/string | yes | System | none | no | no | Stable audio intake ID. |
| `lead_id` | uuid/string | yes | Lead intake | none | no | no | Links to lead. |
| `media_id` | uuid/string | optional | Media storage | none | yes | no | Link to private audio asset. |
| `recorded_at` | datetime | optional | Upload/device metadata | none | no | no | Internal. |
| `duration_seconds` | integer | optional | Media metadata | none | no | no | Target future UX: 1-3 min. |
| `language_detected` | string | optional | Transcript process | suggest | yes | no | AI may suggest; human can correct. |
| `transcript_text` | text | optional | Transcription | transform | yes | no | Private draft input only. |
| `transcript_confidence` | number/string | optional | Transcription | none | yes | no | Low confidence creates verification items. |
| `transcription_provider` | string | optional | Operations | none | yes | no | Prefer self-hosted/on-device or provider with no-training terms. |
| `provider_training_opt_out` | boolean | yes | Provider contract/config | none | yes | no | Must be true when configurable. |
| `provider_retention_note` | text | optional | Provider contract/config | none | yes | no | Document whether provider stores audio and for how long. |
| `raw_audio_public_consent` | boolean | yes | Business approval | none | yes | yes | Default false. |
| `retention_days` | integer | yes | Policy | none | yes | no | Default 90 unless legally/operationally required otherwise. |
| `delete_after` | datetime | yes | Policy/system | none | yes | no | Should be calculated from receipt date. |
| `deleted_at` | datetime | optional | System | none | yes | no | Proof of deletion. |
| `use_scope` | enum: `private_draft_only`, `approved_public_clip`, `blocked` | yes | Business approval/human reviewer | none | yes | yes | Default `private_draft_only`. |

Voice/audio rules:

- No voiceprint, speaker recognition, biometric identification, or identity inference.
- No voice cloning, synthetic voice generation, or "voice of the cook" generated from intake audio.
- Raw audio must not be used publicly without explicit consent tied to that public use.
- Raw audio retention should be limited to 90 days unless legally or operationally required otherwise.
- A transcription provider must not use audio for training if avoidable or configurable.
- Free-tier or unclear provider terms are not acceptable for production voice intake.
- Transcript may be used only to prepare a private profile draft before business approval.
- Transcript text can produce verification questions, not public claims by itself.
- Uploading audio is not approval to publish a profile, quote, transcript, or sound clip.

## 6. Verification status

Proposed record: `business_verification_items`

Purpose: field-level tracking for facts that are copied, suggested, transformed, uncertain, blocked, or ready for business approval.

| Field | Type | Required | Source of truth | AI action | Human verification | Business approval before publishing | Notes |
|---|---|---|---|---|---|---|---|
| `verification_item_id` | uuid/string | yes | System | none | no | no | Stable verification ID. |
| `lead_id` | uuid/string | yes | Lead intake | none | no | no | Links to lead. |
| `draft_id` | uuid/string | optional | Profile draft | none | no | no | Field may relate to a draft. |
| `field_path` | string | yes | System/agent | suggest | yes | no | Example: `signature_dishes[0].name`. |
| `field_label` | string | optional | System/human | transform | yes | no | Human-readable field name. |
| `claim_text` | text | optional | Business/AI draft | copy/transform | yes | yes | The specific claim under review. |
| `source_kind` | enum: `business_input`, `voice_transcript`, `email`, `human_note`, `verified_public_source`, `unknown` | yes | System/human | none | yes | no | `unknown` cannot publish. |
| `risk_category` | enum: `identity`, `location`, `opening_hours`, `menu`, `price`, `photo`, `allergen`, `health_claim`, `review_reference`, `premium`, `translation`, `other` | yes | AI/human | suggest | yes | no | AI may classify risk. |
| `verification_status` | enum: `unverified`, `needs_human_review`, `needs_business_confirmation`, `verified_by_human`, `confirmed_by_business`, `blocked` | yes | Human/business | none | yes | yes | Publishing requires appropriate final status. |
| `ai_confidence` | string/number | optional | AI process | none | yes | no | Confidence is advisory, never approval. |
| `reviewed_by` | string | optional | Human reviewer | none | yes | no | Internal. |
| `reviewed_at` | datetime | optional | Human reviewer/system | none | yes | no | Internal. |
| `notes` | text | optional | AI/human | suggest | yes | no | Internal notes and questions. |

Fields that should usually create verification items:

- Business name and type when unclear.
- Address, location, market schedule, and opening hours.
- Signature dishes, availability, prices, and seasonal claims.
- Allergens, dietary notes, and health claims.
- Photos, source rights, and people visible in media.
- Reviews, references, citations, awards, and superlatives.
- Public contact details and social links.
- Translations and tourist-facing summaries.
- Premium metadata if it could be confused with recommendation logic.

## 7. Publishing status

Proposed record: `business_publication_status`

Purpose: explicit gate from private approved draft to public profile. Publishing state is separate from lead state.

| Field | Type | Required | Source of truth | AI action | Human verification | Business approval before publishing | Notes |
|---|---|---|---|---|---|---|---|
| `publication_id` | uuid/string | yes | System | none | no | no | Stable publication status ID. |
| `lead_id` | uuid/string | yes | Lead intake | none | no | no | Links to lead. |
| `draft_id` | uuid/string | yes | Profile draft | none | yes | yes | The exact draft intended for publication. |
| `approval_event_id` | uuid/string | yes | Approval evidence | none | yes | yes | Must point to explicit `approved` event. |
| `publication_status` | enum: `not_ready`, `ready_for_publish`, `published`, `unpublished`, `blocked` | yes | Human/system | none | yes | yes | Default `not_ready`. |
| `blocking_reason` | text | optional | Human reviewer/safety guard | suggest | yes | no | Required when blocked. |
| `published_at` | datetime | optional | System | none | yes | yes | Only after all gates pass. |
| `unpublished_at` | datetime | optional | System/human | none | yes | no | If removed later. |
| `public_profile_id` | string | optional | Future app/CMS | none | yes | yes | Link to eventual public profile. |
| `premium_status` | enum: `none`, `candidate`, `active`, `paused`, `unknown` | optional | Human/business relationship | none | yes | no | Must never feed recommendation logic. |
| `recommendation_engine_visible` | boolean | yes | System/human | none | yes | yes | Visibility is not ranking. |

Minimum publication gate:

- `draft_id` points to the exact approved draft version.
- `approval_event_id` points to explicit business approval.
- No required verification item is `unverified`, `needs_human_review`, `needs_business_confirmation`, or `blocked`.
- Public media has clear rights and `consent_for_publication = true`.
- Allergens and diet notes are cautious and not presented as guarantees.
- Health claims are absent unless separately reviewed and explicitly approved.
- Premium status is not used by recommendation logic.
- Internal notes, private contacts, raw audio, and evidence links are not exposed.

## Cross-layer status flow

Suggested happy path:

```text
business_intake_leads.lead_status = new
  -> intake_submitted
  -> draft_ready

business_profile_drafts.version = 1
  -> verification items created
  -> human review
  -> sent to business

business_approval_events.event_type = approved
  -> business_publication_status.publication_status = ready_for_publish
  -> published
```

Allowed exits:

- `needs_clarification` when the business, source, or claim is unclear.
- `rejected` when the lead should not continue.
- `blocked` when safety, truthfulness, rights, or approval evidence is insufficient.
- `unpublished` when a business asks for removal or a serious issue is discovered.

## Czech and international notes

- Store original text and language; do not overwrite local wording with translation.
- Keep `locale_primary`, country, city/area, and address format explicit.
- Do not assume Czech hygiene, legal, tax, payment, or opening-hour norms for international businesses.
- Currency, public holidays, seasonal availability, and local market schedules should be modeled as local context, not guessed.
- Translations are derived fields and need their own verification state.
- Tourist-facing explanations can simplify context, but must not change confirmed meaning.

## Business type notes

| Type | Schema implications |
|---|---|
| `restaurant` | Usually has a stable address, opening hours, public contact, and dine-in/takeaway service modes. Still verify all of them. |
| `street_food` | Needs flexible `geo_hint`, event/market notes, irregular hours, weather/season notes, and possibly no permanent address. |
| `small_kitchen` | May require extra privacy around address, pickup, production location, and public contact. Avoid exposing private details by default. |
| `individual_cook` | May have a personal name, pop-up identity, guest events, or no fixed business venue. Confirm what can be public. |
| `other` | Requires human review before schema assumptions are applied. |

## Explicit non-goals for this draft

- No backend implementation.
- No database migrations.
- No forms or landing-site changes.
- No app code changes.
- No dependency changes.
- No outreach or messages to businesses.
- No production data changes.
- No recommendation engine changes.

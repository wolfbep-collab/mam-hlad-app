# Resumable business intake readiness checklist

Implementation-readiness checklist for the future resumable Mám hlad business intake UI. This document is a product and engineering readiness gate only. It does not implement UI, forms, backend, database migrations, app code, landing-site code, dependencies, or outreach.

Based on:

- [`business-intake-data-contract.md`](./business-intake-data-contract.md)
- [`business-intake-schema-draft.md`](./business-intake-schema-draft.md)
- [`business-intake-ui-field-mapping.md`](./business-intake-ui-field-mapping.md)
- [`partner-intake-portal-and-voice-mode.md`](./partner-intake-portal-and-voice-mode.md)
- [`partner-onboarding-system.md`](./partner-onboarding-system.md)
- [`multi-agent-repo-workflow.md`](../operations/multi-agent-repo-workflow.md)

Hard rules:

- No profile may be published without explicit business approval of the exact profile version.
- Mlčení není souhlas.
- A form submission, saved draft, uploaded photo, voice note, or unanswered review request is not approval to publish.
- AI must never invent photos, reviews, references, allergens, health claims, opening hours, addresses, contact details, or consent.
- Premium status must not affect recommendation logic, ranking, scoring, filtering, fallback placement, or visibility rules.
- Unfinished leads are private operational records, not public profiles.
- This checklist must be satisfied before building the first resumable intake UI.

## 1. Privacy Rules for Unfinished Leads

Unfinished leads can exist only as private records. They are useful because owners, managers, cooks, and street-food sellers may start during a busy moment and finish later.

Checklist:

- [ ] Unfinished leads default to private and cannot be listed publicly.
- [ ] Private lead data is separated from public profile data.
- [ ] Internal notes, raw inbound messages, raw audio, private contact details, and approval evidence are never public fields.
- [ ] Public profile fields are populated only from a reviewed private draft, not directly from a partial lead.
- [ ] Partial leads can be abandoned, rejected, or deleted according to a future retention policy.
- [ ] Small kitchens and individual cooks can keep private address, pickup, production, and personal contact details out of public fields.
- [ ] Street-food and pop-up sellers can save flexible location hints without being forced to publish a permanent address.
- [ ] International leads preserve original language, country, local address format, and local context without premature normalization.

Not ready if:

- Partial leads can appear in search, recommendations, landing pages, previews, maps, or public APIs.
- Private contact details are reused as public contact details by default.
- Raw form text, transcripts, internal notes, or approval evidence can leak into public rendering.

## 2. Resume-Link and Token Security Rules

Resume links are convenience tools, not identity proof or approval evidence. They must let a business continue safely without turning the first UI into a heavy account system.

Checklist:

- [ ] Resume tokens are high-entropy, single-purpose, and stored server-side as hashed or otherwise protected values.
- [ ] Resume links do not contain private lead content in the URL.
- [ ] Resume tokens are scoped to one lead or one intake session.
- [ ] Tokens expire or can be revoked.
- [ ] Token use is logged for operational review.
- [ ] A resume token can continue editing a private lead, but cannot approve publication by itself.
- [ ] A resume token cannot expose approval evidence, internal notes, raw audio storage paths, or private reviewer comments.
- [ ] Sensitive changes, such as public contact details, media consent, or final approval, need an explicit confirmation step beyond merely opening the link.

Not ready if:

- Opening a resume link can publish, approve, or expose a profile.
- Token values are short, guessable, permanent, or shared across leads.
- Private data is embedded in query parameters.

## 3. Autosave States and When Data Is Saved

Autosave should reduce friction without creating accidental publication or accidental consent.

Suggested states:

| State | Meaning | Public? | Notes |
|---|---|---|---|
| `started` | User entered something meaningful. | no | Can exist with very little data. |
| `partial_saved` | Private progress is saved, but not enough for a private profile draft. | no | Main autosave state. |
| `needs_more_info` | Human or AI identified missing facts. | no | Used for follow-up. |
| `ready_for_private_draft` | Enough business-provided facts exist to prepare a private draft. | no | Not a publication state. |
| `business_review` | Private draft was sent for explicit approval. | no | Business can approve, reject, or request changes. |
| `approved` | Business approved a specific draft version. | not automatically | Still needs final publication gate. |
| `published` | Approved profile is public. | yes | Only after all gates pass. |

Autosave checklist:

- [ ] Text fields save after a pause, section change, or explicit "save for later" action.
- [ ] Uploaded media metadata saves after upload, with `consent_for_publication = false` by default.
- [ ] Voice/audio metadata saves only after upload or recording completes.
- [ ] Skipped fields are recorded as skipped or unknown, not as verified empty facts.
- [ ] Progress labels mean readiness, not pressure or permission to publish.
- [ ] Autosave failures are visible to the user before they leave the page.
- [ ] Autosave does not send outbound messages to businesses without a separate product decision.
- [ ] Autosave does not trigger AI drafting until minimum private draft boundaries are met.

## 4. Validation Boundaries

Validation must be staged. The first UI should accept safe partial leads, but later gates must be stricter.

### Minimum Submit Fields

The first submission should be low-friction. A business can submit with:

| Field | Requirement | Notes |
|---|---|---|
| `business_name_raw` | required for a normal submitted lead | Can be a business name, project name, cook name, or public identity. |
| `city_or_area` | required for a normal submitted lead | Can be a city, district, market, festival, region, or operating area. |
| Contact method | required for follow-up submission | E-mail, phone, or other contact. Internal by default. |
| `inbound_message` | required when other context is thin | A few sentences are enough. |

Safe private unfinished saves may contain less than this, such as only a name, only a contact, only an inbound message, or only audio metadata. Those records are not actionable until follow-up is possible.

### Minimum Private Draft Fields

A private profile draft may be prepared only when there is enough business-provided information to avoid guessing:

- [ ] Business or cook display identity.
- [ ] Business type or a clear `unknown` requiring human review.
- [ ] City, area, market, region, or location context.
- [ ] Contact path for review and approval.
- [ ] At least one concrete business-provided food, cuisine, story, or recommendation signal.
- [ ] Source channel and source evidence.
- [ ] Any AI-suggested fields marked for verification.

If these are missing, the lead should stay `partial_saved` or `needs_more_info`.

### Required Before Publishing

Publishing requires all of these:

- [ ] Exact profile draft version exists.
- [ ] Human review is complete.
- [ ] Explicit business approval is recorded for that exact draft.
- [ ] Approval evidence is stored and tied to scope: text, photos, public contact, opening hours, or other fields.
- [ ] Public media has source, rights, and consent.
- [ ] Opening hours, address, contact details, references, reviews, allergens, and health claims are absent unless verified and approved.
- [ ] Allergens and diet notes use cautious language and are not guarantees.
- [ ] Internal notes, raw audio, transcripts, private contacts, and evidence links are excluded from public output.
- [ ] Premium metadata is separated from recommendation inputs.

## 5. What Can Be Skipped and Completed Later

The first UI should let businesses continue later. These fields can be skipped at first submit:

- Business type, if unclear.
- Country in a Czech-first UI, if it is explicitly marked as temporary and later confirmed.
- Exact address.
- Opening hours.
- Photos, videos, and captions.
- Full menu.
- Signature dishes beyond a short text description.
- Chef recommendation.
- Tourist context and local context.
- Languages supported.
- Prices.
- Allergens and diet notes.
- Premium interest or commercial conversation.

Skipped fields must not become public placeholders. "Unknown yet" means "do not claim this publicly."

## 6. What Must Never Be Public Before Approval

These must remain private until the business explicitly approves the exact public use:

- Profile text, including translated or shortened versions.
- Public address or location note.
- Public contact details.
- Opening hours.
- Photos, video, captions, and any media showing people.
- Reviews, references, citations, awards, or media mentions.
- Chef recommendation, direct quote, or story attributed to a person.
- Allergen notes, dietary notes, and any safety-related food statement.
- Tourist-facing practical claims such as payment methods, languages spoken, or easy access.
- Premium labels, paid profile elements, or commercial metadata.

These must never be public at all unless a future product decision explicitly changes the rule:

- Internal notes.
- Raw inbound form text that was not drafted into an approved profile.
- Raw audio.
- Voice transcripts, except approved quotes in a reviewed profile.
- Approval evidence locations.
- Private contact details and private addresses.
- Resume tokens and operational logs.

## 7. What AI May Suggest, Transform, or Only Copy

AI can help only inside strict source boundaries.

| AI action | Allowed use | Examples |
|---|---|---|
| `suggest` | Propose a field from business-provided text, marked for verification. | `business_type`, `cuisine_tags`, `service_modes`, verification risk category, follow-up questions. |
| `transform` | Rewrite, summarize, translate, or simplify without adding facts. | Short story, tourist context, local context, photo captions from supplied caption text. |
| `copy` | Carry exact supplied facts into private records. | Contact details, address, opening hours, allergen notes, public links, names. |
| `none` | Do not generate or alter. | Consent, approval status, rights status, premium status, provider terms, audit evidence. |

Checklist:

- [ ] Every AI-suggested public-facing field remains marked for human verification.
- [ ] AI transformations preserve original meaning and source language context.
- [ ] Translations have their own verification status.
- [ ] AI confidence is advisory only and cannot approve a field.
- [ ] AI-generated follow-up questions are allowed; AI-generated facts are not.

## 8. What AI Must Never Invent

AI must never invent or guess:

- Photos, videos, captions, rights, or consent.
- Reviews, references, awards, citations, media mentions, or guest quotes.
- Allergens, ingredient safety, celiac suitability, absence of allergens, or dietary safety.
- Health claims, treatment claims, detox claims, immunity claims, or disease suitability.
- Opening hours, seasonal schedule, event schedule, daily menu, or current availability.
- Addresses, exact location, phone, e-mail, social links, or public contact details.
- Names of owners, cooks, staff, approving people, or authorized representatives.
- Prices, discounts, menu availability, or portion sizes.
- Business approval, publication permission, or legal authority to approve.
- Premium status, commercial terms, paid benefits, or recommendation priority.

If a fact is missing, AI may create an internal question or leave the section out.

## 9. Voice/Audio Intake Safety

Voice is an input channel for busy people. It is not consent, approval, identity proof, or public media by default.

Checklist:

- [ ] No voiceprint, speaker recognition, biometric identification, or identity inference.
- [ ] No voice cloning or synthetic "voice of the cook" from intake audio.
- [ ] Raw audio is private by default.
- [ ] Raw audio is not used publicly without explicit consent tied to that exact use.
- [ ] Transcript may be used only to prepare a private draft before approval.
- [ ] Audio retention is limited, for example 90 days unless legally or operationally required otherwise.
- [ ] Deletion date and deletion status can be tracked.
- [ ] Transcription provider must not use audio for training if avoidable or configurable.
- [ ] Free-tier or unclear provider terms are not acceptable for production voice intake.
- [ ] Low-confidence transcript fields create verification items instead of public claims.
- [ ] Uploading audio does not move a lead to `approved` or `published`.

Not ready if:

- Provider retention or training terms are unknown.
- The UI suggests that recording audio means the profile can go live.
- Transcript text can be published without human review and business approval.

## 10. Human Verification Checkpoints

Human verification is required where a wrong claim could harm a business, user, or trust in Mám hlad.

Required checkpoints:

- [ ] Business identity, business type, and relationship of the approving person.
- [ ] Country, city, area, address, market, event, or location context.
- [ ] Opening hours, irregular availability, seasonality, or event schedule.
- [ ] Public contact details and social links.
- [ ] Signature dishes, menu claims, prices, availability, and seasonal claims.
- [ ] Photos, videos, source rights, people visible in media, and consent.
- [ ] Allergens, diet notes, gluten/celiac statements, and health claims.
- [ ] Reviews, references, quotes, awards, and media mentions.
- [ ] Tourist-facing claims such as languages spoken, payment methods, accessibility, and ease of visit.
- [ ] International context where local law, address format, language, holidays, or operating norms may differ.
- [ ] Premium metadata, to confirm it stays out of recommendation logic.

## 11. Explicit Business Approval Checkpoint

Business approval is a separate gate after human review. It must be explicit, documented, and tied to a specific draft version.

Checklist:

- [ ] Approval event references `lead_id` and exact `draft_id`.
- [ ] Approval event records who approved, when, by what channel, and what scope was approved.
- [ ] The approving person has an evident relationship to the business or cook.
- [ ] Approval can be `approved`, `rejected`, `changes_requested`, or `approval_revoked`.
- [ ] Material changes after approval create a new draft or new approval scope.
- [ ] Silence, inactivity, autosave, form submit, and audio upload are never approval.
- [ ] The publishing system cannot publish without a valid approval event.

## 12. Premium/Recommendation Separation

Premium status is business or presentation metadata, not food relevance.

Checklist:

- [ ] Intake UI does not ask for premium status as a recommendation input.
- [ ] Premium interest, if collected later, is stored outside recommendation inputs.
- [ ] Recommendation engine cannot read premium status.
- [ ] Premium cannot boost ranking, score, ordering, filtering, fallback placement, or "sponsored top" behavior.
- [ ] Premium and non-premium profiles use the same approval, safety, allergen, truthfulness, photo, and review rules.
- [ ] Paid profile elements, if ever introduced, are clearly separated from organic recommendation logic.

Not ready if:

- Premium status appears in scoring, ranking, filtering, or feature flags used by recommendations.
- Paid placement can override relevance.
- Premium relationship is presented as an independent review or endorsement.

## 13. Ready to Implement First UI

The first resumable intake UI is ready to implement only when all of these are true:

- [ ] Scope is limited to intake, private save, and follow-up. It does not create public profiles automatically.
- [ ] Product states are agreed: `started`, `partial_saved`, `needs_more_info`, `ready_for_private_draft`, `business_review`, `approved`, `published`.
- [ ] Minimum submit fields are defined and validated gently.
- [ ] Private unfinished lead behavior is defined.
- [ ] Resume token policy is designed and reviewed.
- [ ] Autosave behavior and failure handling are designed.
- [ ] Skipped and unknown fields are represented safely.
- [ ] Minimum private draft boundary is implemented as a separate gate from first submit.
- [ ] Publishing boundary requires human verification and explicit business approval.
- [ ] AI field permissions are encoded: suggest, transform, copy, none.
- [ ] AI never-invent list is enforced in prompts, review, and data validation.
- [ ] Voice/audio retention, provider, no-training, no-voiceprint, and no-cloning rules are decided.
- [ ] Media rights and consent defaults are private and false.
- [ ] Allergen, diet, and health-claim handling follows cautious food safety rules.
- [ ] Premium metadata is separated from recommendation inputs.
- [ ] No app code, landing-site code, backend, forms, migrations, or dependencies are changed until the implementation task explicitly allows them.

## 14. Not Ready Yet / Must Not Build

Do not build the first UI if any of these are true:

- [ ] There is no clear private/public data boundary.
- [ ] Resume-link token security is undefined.
- [ ] Autosave can create accidental submit, approval, or publication.
- [ ] The UI requires too many fields before the first safe submit.
- [ ] Partial leads can become public records.
- [ ] AI can fill missing facts instead of questions.
- [ ] AI can invent photos, reviews, references, allergens, health claims, opening hours, addresses, contact details, or consent.
- [ ] Voice/audio provider terms allow training on submitted audio and there is no opt-out or alternative.
- [ ] Raw audio can be public by default.
- [ ] Audio retention is unlimited by default.
- [ ] Human verification checkpoints are not assigned.
- [ ] Business approval evidence is not tied to an exact draft version.
- [ ] Premium status can affect recommendations.
- [ ] The implementation would add backend, migrations, UI, forms, dependencies, app code, landing-site code, or business outreach without a separate explicit task.

## Final Implementation Rule

The first resumable intake UI should make starting easy and publishing hard. A business can save a messy, unfinished lead in a few minutes. Mám hlad can use that private lead to prepare carefully. Nothing becomes public until facts are reviewed, sensitive claims are safe, and the business explicitly approves the exact profile.

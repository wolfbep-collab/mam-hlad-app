# Resumable business intake UI technical design

Technical design for the first future resumable Mám hlad business intake UI. This document translates product and safety rules into implementation-ready boundaries, but it does not implement UI, forms, backend, database migrations, app code, landing-site code, dependencies, or business outreach.

Based on:

- [`../product/business-intake-data-contract.md`](../product/business-intake-data-contract.md)
- [`../product/business-intake-schema-draft.md`](../product/business-intake-schema-draft.md)
- [`../product/business-intake-ui-field-mapping.md`](../product/business-intake-ui-field-mapping.md)
- [`../product/resumable-business-intake-readiness-checklist.md`](../product/resumable-business-intake-readiness-checklist.md)
- [`../product/partner-intake-portal-and-voice-mode.md`](../product/partner-intake-portal-and-voice-mode.md)
- [`../product/partner-onboarding-system.md`](../product/partner-onboarding-system.md)
- [`../operations/multi-agent-repo-workflow.md`](../operations/multi-agent-repo-workflow.md)

Hard rules:

- No profile may be published without explicit business approval of the exact profile draft.
- Mlčení není souhlas.
- A form submission, autosave, resume link, uploaded photo, voice note, or unanswered review request is not approval to publish.
- AI must never invent photos, reviews, references, allergens, health claims, opening hours, addresses, contact details, or consent.
- Premium status must not affect recommendation logic, ranking, scoring, filtering, fallback placement, or visibility rules.
- Unfinished leads and private drafts are operational data, not public profiles.

## 1. Design Scope

The first resumable intake UI should let a restaurant owner, street-food seller, small kitchen, individual cook, or manager start quickly, save partial progress, and continue later. The technical design should make starting easy while keeping publication impossible until human verification and explicit business approval are complete.

The first implementation should support:

- A low-friction first submit.
- Private autosave.
- Resume link continuation.
- Clear private/public data separation.
- Validation gates for submit, private draft, and publication.
- AI-assisted drafting only inside strict source boundaries.
- Human verification and business approval as separate gates.

The first implementation must not support:

- Public self-serve profile publication.
- Recommendation engine integration.
- Premium ranking logic.
- Production voice transcription unless provider, retention, and no-training rules are approved.
- Any business outreach sent automatically by an agent.

## 2. State Machine

One lead has one operational state at a time. Publishing state should remain separate in the eventual data model, but the UI can display a simplified progress state.

| State | Meaning | Allowed next states | Public? | Notes |
|---|---|---|---|---|
| `started` | User has opened intake and entered meaningful data locally or server-side. | `partial_saved`, `rejected` | no | Can exist with very little data. |
| `partial_saved` | Some private data is saved, but not enough for a private draft. | `needs_more_info`, `ready_for_private_draft`, `rejected` | no | Main autosave state. |
| `needs_more_info` | Human or AI found missing or unclear data. | `partial_saved`, `ready_for_private_draft`, `rejected` | no | Used for follow-up questions. |
| `ready_for_private_draft` | Minimum private draft fields are present. | `private_draft_ready`, `needs_more_info`, `rejected` | no | Unlocks internal draft preparation, not publication. |
| `private_draft_ready` | A private draft exists and needs human review. | `needs_more_info`, `business_review`, `rejected` | no | Draft may contain AI-suggested fields needing verification. |
| `business_review` | Human-reviewed draft has been sent to business for explicit approval. | `approved`, `needs_more_info`, `rejected` | no | Silence is not approval. |
| `approved` | Business approved a specific draft version and scope. | `published`, `needs_more_info`, `rejected` | not automatically | Final publication gate still checks safety and evidence. |
| `published` | Approved profile is public. | `needs_more_info`, `rejected` | yes | Updates need the same review and approval cycle. |
| `rejected` | Lead should not continue or business declined. | none by default | no | Reopening should be a deliberate human action. |

State transition rules:

- `published` is reachable only from `approved`.
- `approved` is reachable only from `business_review` with explicit approval evidence.
- `private_draft_ready` is not enough to contact users or publish content.
- `ready_for_private_draft` means enough source material exists to draft without guessing.
- `rejected` can be entered from any non-public state when the lead is unsafe, duplicate, spam, out of scope, or declined.
- Any material change after `approved` should create a new private draft version and return to `business_review` for changed fields.

Implementation note for later: represent state transitions through explicit server-side commands rather than arbitrary client writes. The UI should request transitions; the server should validate them.

## 3. Autosave Behavior

Autosave exists to reduce friction. It must never create approval, publication, or public visibility.

### Autosave Triggers

Autosave may be triggered by:

- Text field pause after a short debounce.
- Field blur.
- Section change.
- Explicit `Uložit rozpracované` action.
- Successful media upload metadata creation.
- Successful voice/audio upload metadata creation.
- User selects `Doplním později` for a skippable field.
- Browser/tab close warning path, if a reliable save is still possible.

### What Can Be Saved Partially

Partial private saves may include:

- `business_name_raw`
- `city_or_area`
- Contact fields: `contact_email`, `contact_phone`, `contact_other`
- `inbound_message`
- `business_type` as selected, `unknown`, or AI-suggested pending verification
- `country` as submitted or temporary Czech-first default pending confirmation
- Optional links, social handles, or website
- `geo_hint`
- Food descriptions, signature dish notes, story notes, local/tourist notes
- Skipped field markers
- Media metadata with `consent_for_publication = false`
- Voice/audio metadata with private use scope

Partial saves must not require:

- Exact address.
- Opening hours.
- Photos.
- Full menu.
- Allergens.
- Reviews or references.
- Premium interest.

### Fail-Safe Autosave

Autosave should fail safely:

- Failed autosave keeps the user on the current draft and shows a clear retry state.
- Failed autosave must not mark a section complete.
- Failed autosave must not advance the state machine.
- Failed media upload must not create public media records.
- Failed voice upload must not create transcript or AI extraction jobs.
- Duplicate autosave requests should be idempotent by lead/session and field version.
- If network is unavailable, the UI may preserve local unsaved changes temporarily, but must label them unsaved.
- The UI must never show "sent", "ready", "approved", or "published" based only on local state.

Suggested autosave status labels:

- `Ukládám`
- `Uloženo`
- `Nepodařilo se uložit`
- `Zkusit znovu`
- `Uloženo jen v tomto zařízení` if local fallback is ever used.

## 4. Resume Token and Link Security

Resume links are convenience links for unfinished private intake. They are not login, proof of authority, approval evidence, or public profile access.

### Token Lifetime Proposal

Initial proposal:

- Default lifetime: 14 days.
- Maximum lifetime: 30 days after last explicit save.
- Token rotates when a new resume link is requested.
- Token expires immediately when lead is rejected, published, or manually revoked.
- Approval actions should require a fresh confirmation flow, not the same low-friction resume token.

Rationale: 14 days gives busy owners enough time to continue without creating long-lived bearer access to private data.

### Token Storage Concept

Future backend should store:

- A random high-entropy token generated server-side.
- Only a hashed token value, not the raw token.
- `lead_id`
- `created_at`
- `expires_at`
- `last_used_at`
- `revoked_at`
- `use_count`
- Optional metadata for abuse review: coarse IP hash, user agent hash, and rate-limit counters.

The raw token appears only in the resume URL sent or shown to the business. The URL must not contain private lead data.

### Revocation Concept

Resume tokens should be revocable when:

- The business requests deletion or withdrawal.
- A lead is marked `rejected`.
- A lead is published.
- A token appears leaked.
- Too many suspicious attempts occur.
- A newer token replaces the old token.

Revoked or expired tokens should show a safe continuation path, such as requesting a new link or contacting Mám hlad. They should not reveal whether a specific business lead exists.

### Access Boundaries

Resume links may allow:

- Viewing and editing the private unfinished intake fields.
- Uploading additional private media.
- Continuing optional sections.
- Requesting a new resume link.

Resume links must not allow:

- Viewing public-only profile previews unless separately authorized.
- Viewing internal notes, approval evidence, raw storage paths, AI prompts, or reviewer comments.
- Publishing a profile.
- Approving a profile by link-open alone.
- Changing recommendation visibility.
- Accessing other leads.

### Rate Limit and Spam Risk Notes

The first implementation should design for:

- Rate limits on token lookup attempts.
- Rate limits on new lead creation.
- Rate limits on resume-link resend.
- Basic bot/spam detection before expensive upload or AI work.
- Size and type limits for uploads.
- Delayed or human-reviewed AI jobs for suspicious leads.

No captcha is required in the product concept for the first version, but abuse controls must exist server-side before production.

## 5. Private vs Public Data Boundaries

### Unfinished Lead

Unfinished lead data is private operational data. It can contain incomplete, messy, unverified, or sensitive values.

Allowed content:

- Raw business-provided fields.
- Private contact details.
- Raw inbound message.
- Skipped field markers.
- Private media metadata.
- Voice/audio metadata.
- Internal progress state.

Never public:

- Raw lead payload.
- Private contact details.
- Private address or pickup/production details for small kitchens.
- Resume token metadata.
- Internal notes.
- Raw audio.

### Private Draft

Private draft data is an internal versioned draft prepared from lead data. It may include AI transformations and questions, but remains private until reviewed and approved.

Allowed content:

- Draft display name.
- Suggested tags and service modes.
- Draft story, local context, tourist context.
- Candidate dishes and descriptions.
- Human review notes.
- Verification items.
- Questions for business.

Never public without approval:

- Any draft text.
- Translations.
- Photo captions.
- Chef recommendation or quote.
- Opening hours.
- Public address or contact details.
- Allergen or diet notes.

### Approved Public Profile

Approved public profile data is a reviewed subset of a specific private draft version, backed by explicit business approval.

Requirements:

- Exact `draft_id` approved.
- Approval event exists.
- Human verification complete.
- Public media rights and consent confirmed.
- Sensitive claims safe or omitted.
- Internal/private fields excluded.
- Premium metadata separated from recommendation inputs.

## 6. Validation Gates

Validation must be staged, not one giant form wall.

### Gate 1: Minimum Submit Fields

Normal first submit should require:

- `business_name_raw`
- `city_or_area`
- At least one contact method: `contact_email`, `contact_phone`, or `contact_other`
- `inbound_message` when the identity/context is otherwise too thin

Private unfinished save may allow less:

- Name only.
- Contact only.
- Message only.
- Audio metadata only.

Private unfinished saves with less than minimum submit fields must remain non-actionable until there is a safe way to continue.

### Gate 2: Minimum Private Draft Fields

Before `ready_for_private_draft`, the system needs:

- Business or cook display identity.
- Business type, or explicit `unknown` requiring human review.
- City, area, market, region, or operating context.
- Contact path for review and approval.
- At least one business-provided food, cuisine, story, or recommendation signal.
- Source channel and source evidence.
- AI-suggested fields marked for verification.

Missing fields should keep the lead in `partial_saved` or `needs_more_info`.

### Gate 3: Required Before Publishing

Before `published`, the system needs:

- Exact private draft version.
- Human review complete.
- Food safety review complete for allergens, diet notes, and health claims.
- Explicit business approval event for the exact draft and approved scope.
- Approval evidence stored privately.
- No unresolved required verification items.
- Media source, rights, and publication consent for every public media item.
- Public contact details explicitly approved, if shown.
- Opening hours verified and approved, if shown.
- Reviews, references, awards, or quotes sourced and approved, if shown.
- Raw audio, transcripts, private contacts, internal notes, and evidence links excluded from public output.
- Premium metadata unavailable to recommendation logic.

## 7. AI Boundaries

AI is a drafting and structuring assistant, not a source of truth.

### AI May Suggest

AI may suggest, from business-provided text, transcript, email, or human notes:

- `business_type`
- `cuisine_tags`
- `service_modes`
- `signature_dishes`
- `local_context`
- `tourist_context`
- Verification risk categories
- Follow-up questions
- Section progress hints

All suggestions must stay unverified until human review.

### AI May Transform

AI may transform without adding facts:

- Rewrite business-provided text into calm Mám hlad style.
- Summarize long free text.
- Translate while preserving meaning.
- Normalize punctuation and formatting.
- Turn a transcript into a private draft.
- Draft photo captions only from provided caption/context.

Translations and transformations need verification before public use.

### AI May Only Copy

AI may only copy these from explicit input or verified source:

- Business name.
- Contact details.
- Address or exact location.
- Opening hours.
- Allergen notes.
- Diet notes.
- Public links and social handles.
- Names of people.
- Reviews, references, awards, and quotes.

### AI Must Never Invent

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

If a fact is missing, AI should ask a question or omit the field.

## 8. Human Verification Checkpoints

Human verification is required before business review and before publication for:

- Business identity and type.
- Relationship of the approving person to the business or cook.
- Country, city, area, address, market, event, or location context.
- Opening hours, irregular availability, seasonality, or event schedule.
- Public contact details and social links.
- Signature dishes, menu claims, prices, availability, and seasonal claims.
- Photos, videos, source rights, people visible in media, and consent.
- Allergens, diet notes, gluten/celiac statements, and health claims.
- Reviews, references, quotes, awards, and media mentions.
- Tourist-facing claims such as languages spoken, payment methods, accessibility, and ease of visit.
- International context where local law, address format, language, holidays, or operating norms differ.
- Premium metadata, to ensure it stays out of recommendation logic.

Human review must be able to return a lead to `needs_more_info`, `rejected`, or `business_review`.

## 9. Explicit Business Approval Checkpoint

Business approval is the publication gate. It is separate from submit, autosave, private draft creation, and human review.

Approval evidence should record:

- `lead_id`
- Exact `draft_id`
- Draft version
- Actor name and contact, stored privately
- Actor relationship or authority note
- Approval decision: `approved`, `rejected`, `changes_requested`, or `approval_revoked`
- Approved scope: text, photos, public contact, opening hours, audio clip, or other fields
- Evidence kind: email, dashboard action, signed form, message screenshot, recorded call note, or other
- Evidence location, stored privately
- Approval timestamp

Rules:

- Approval must be explicit.
- Approval must be tied to a specific draft version.
- Silence is not approval.
- A resume token opening is not approval.
- A checkbox during first submit is not profile publication approval.
- Material draft changes require new approval for changed fields.
- `published` must be impossible without a valid approval event.

## 10. Voice/Audio Intake Technical Constraints

Voice is an input channel for busy people. It is not consent, identity proof, or public media by default.

Technical constraints:

- No voiceprint, speaker recognition, biometric identification, or identity inference.
- No voice cloning or synthetic "voice of the cook" from intake audio.
- Raw audio is private by default.
- Raw audio must not be public without explicit consent tied to that exact use.
- Transcript may be used only to prepare a private draft before approval.
- Audio retention should default to 90 days unless legally or operationally required otherwise.
- Audio records should include `retention_days`, `delete_after`, and `deleted_at`.
- Provider training must be disabled if configurable.
- Providers with unclear training or retention terms are not acceptable for production voice intake.
- Low-confidence transcript fields create verification items instead of public claims.
- Uploading audio must not move a lead to `approved` or `published`.

First implementation recommendation:

- Defer production voice transcription until provider terms, retention, private storage, deletion job, and abuse limits are decided.
- If voice upload exists before transcription, store it as private intake media only and do not run AI extraction automatically.

## 11. Test Scenarios Before Implementation

These scenarios should be converted into automated or manual acceptance tests before building production behavior.

### Partial Save

- User enters only business name.
- User chooses `Uložit rozpracované`.
- System creates or updates a private unfinished lead.
- State is `partial_saved`.
- No public profile exists.
- No AI draft job runs.

### Resume Later

- User submits name, area, contact, and message.
- System creates a private lead and resume token.
- User opens the resume link within token lifetime.
- UI shows editable private intake fields only.
- Internal notes, approval evidence, raw storage paths, and public profile controls are hidden.

### Invalid Token

- User opens a malformed or unknown resume token.
- System does not reveal whether a lead exists.
- UI offers a safe recovery path.
- No private data is returned.

### Expired Token

- User opens an expired token.
- System does not return private lead data.
- User can request a new link or contact Mám hlad.
- Expired token cannot be reactivated by the client.

### No Publishing Without Approval

- Lead reaches `private_draft_ready`.
- Human review passes.
- No business approval event exists.
- Any attempt to set `published` fails.
- Public profile remains absent.

### AI Cannot Publish Invented Facts

- AI draft contains suggested opening hours, address, photo caption, allergen note, or contact detail without source evidence.
- Verification marks the fields as blocked or needing confirmation.
- Draft cannot move to `business_review` as final public content until corrected.
- Draft cannot publish.

### Premium Status Not Used in Recommendation Logic

- Lead or draft has premium metadata.
- Recommendation-related payloads do not include premium status.
- Ranking, scoring, filtering, fallback placement, and visibility calculations ignore premium metadata.
- Premium and non-premium profiles pass the same safety and approval gates.

### Voice Audio Safety

- User uploads audio.
- Audio is stored privately.
- `raw_audio_public_consent` defaults to false.
- Retention fields are set.
- No public audio URL exists.
- No voiceprint or voice cloning job is created.

### Business Approval Scope

- Business approves text but not photos.
- Text can proceed toward publication after final checks.
- Photos remain private and cannot render publicly.
- Approval scope is visible to internal reviewers.

## 12. Out of Scope for First Implementation

Out of scope:

- UI implementation in app or landing-site.
- Actual forms.
- Backend endpoints.
- Database migrations.
- Supabase storage buckets or policies.
- Voice transcription provider integration.
- AI agent runtime integration.
- Public profile rendering.
- Recommendation engine changes.
- Premium profile implementation.
- Payment, accounts, business dashboard, or production integrations.
- Automated outbound email, WhatsApp, Instagram DM, or other business contact.
- Importing reviews, photos, or facts from third-party platforms.
- Analytics, pixels, or tracking.

## 13. Implementation Readiness Gate

Before the first real implementation starts, confirm:

- State machine transitions are server-validated.
- Autosave is idempotent and private.
- Resume token design has security review.
- Private/public field mapping is explicit.
- Publication path requires human verification and business approval.
- AI field permissions are enforceable.
- Voice/audio retention and provider rules are decided or voice is deferred.
- Test scenarios above are accepted as implementation checks.
- Scope explicitly allows the code areas being changed.

The technical north star is simple: the UI may save an unfinished lead quickly, but no path may turn unfinished, unverified, AI-suggested, or unapproved data into a public profile.

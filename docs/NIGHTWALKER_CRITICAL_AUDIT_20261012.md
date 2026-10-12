# Nightwalker V5 — Critical Product and Engineering Audit
Date: 2026-10-12 · scope: existing GitHub/Vercel Nightwalker (do not create a replacement project)

## Findings (severity ranked)

| Priority | Defect | Evidence | Acceptance criteria |
| --- | --- | --- | --- |
| P0 | One Groq completion per choice sends repetitive system rules, canon excerpts and recent scenes; a second immediate choice can exceed 8K TPM. | `api/story.mjs` request shape and official Groq free-tier docs. | Measure prompt/completion tokens and remain under actual provider limits without reducing narrative to a few sentences. |
| P0 | Startup probe used a real text completion and cached a false "AI unavailable" state. | Original `GET /api/story?probe=1`, `app.js`. | Non-generative authorized model check; recover without page reload; no charge of story credits for failures. |
| P0 | Six-scene authored fallback could silently finish known-world missions when the AI check failed. | `story.js` non-director ending at phase 6 and launch only enabling director on successful probe. | Never label a six-step offline mini-story as an 18–28 decision novel; block accidental launch or clearly offer an intentional separate offline mode. |
| P1 | "18–28 decisions" is a hard cap, not a story structure. Forced phase-28 resolution may precede logical plot closure. | `story.js` phase-based end, generic `missionArc`. | Test one complete 20+ meaningful-decision narrative with distinct chapters, causal cliffhangers, and resolution depending on past choices. |
| P1 | Canon source is a Wikipedia excerpt, not a version-specific event timeline. Cross-medium scoring helps but does not prove character/plot accuracy. | `lookupCanon` and medium scoring. | Identify exact film/series/book/version; build source-backed scene anchors; indicate unverified works before charging; no fabricated canon presented as official. |
| P1 | Sidequest completion is based on repeating an action-kind twice, regardless of quest objective. | `worldState.js` `q.trigger===kind` gate. | Quest progress is tied to concrete targets/evidence/state changes; two arbitrary "talk" actions cannot complete an unrelated rescue mission. |
| P1 | NPC trust mechanically changes based on broad `kind` only, not actual targets or consequences. | `worldState.js` action-dependent trust. | Choices must affect the relevant named NPC and cause persistent changes in availability, dialogue and later outcomes. |
| P1 | Free-text choices use keyword matching for action-kind; one mistaken classification could mischarge stamina or simulate a fight. | `story.js` free choice classifier. | Show interpreted action and cost, allow correction, resolve narrative free-text before applying irreversible costs. |
| P1 | Branching outputs stored in localStorage and cloud, but there is no audited end-to-end restore/replay of 18–28 AI scenes. | `engine.js`, `cloud.js`, `app.js`. | Reopen mid-scene and restore to another device with same NPC memories, inventory, quest state and pending choice. |
| P2 | Early product content is small versus the advertised progression ecosystem (4 bloodlines and a limited skill list). | `data.js`. | Searchable skill taxonomy with discipline → school → subtype → rank, meaningful prerequisite/upgrade trees. |
| P2 | Narrative reader shares screens with RPG HUD and action utilities, competing with immersion on mobile. | `app.js` mission reader. | One-thumb mobile novel reader; immersive prose first, readable choices, optional collapsible stats; accessibility check. |
| P2 | Excessive Vercel development pushes caused build-rate-limit, blocking urgent production fixes. | Vercel deployment status: build-rate-limit. | Batch tested changes into one release, avoid commit-driven deployment spam, distinguish GitHub merged vs production ready. |

## Changes prepared in quota fix branch
- Avoid spending a generation request for health checks. Authenticated model-directory check is not a guarantee of generation capacity.
- Keep 20B primary, 120B secondary, Qwen 3.8 27B emergency free-model fallback using one existing key, without key farms or payment.
- Read per-model token/reset/daily request headers, gate depleted models, return actual cooldown instead of uncontrolled retries.
- Trim duplicated prompt/context while keeping the player decision, version, plot anchors, NPC and quest effects; publish actual last-call token usage in Settings.
- One or two guarded automatic retries only after a supplied cooldown; preserve scene, character and saved data.
- Prevent silent six-scene endings on temporary AI check failure.
- Add isolated mocked connector regression tests. **Provider production runtime unverified until Vercel build limit clears.**

## Release gates
1. Syntax, unit and regression tests passing, including 429 on one/two/all three models, daily quota and cache.
2. Real Groq-account test: ten consecutive decisions, observe at least two model switches/limits, no wasted per-page completion probe.
3. 20+ meaningful choice canon adaptation, compare timeline/NPC actions with version-specific references.
4. Save/restore across refresh/device and retry-after resume; credits not charged again after failures.
5. Production deployment SHA, runtime logs and URL verified; no blanket claim that free tier is unlimited.

**Non-goal:** breaking official Groq free quota. A free cloud provider can still impose TPM/RPD limits; if all models run out, the honest response is a cooldown or an explicitly labelled offline story mode, not fake unlimited AI.

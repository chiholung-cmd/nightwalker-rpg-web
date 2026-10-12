# NIGHTWALKER ∞ · P0–P4 integration lab

Mobile-first interactive 无限流 (traditional Chinese) demo for Nightwalker. A **standalone branch**, not the official production application.

## Features

- **P0**: Persistent profile; HP/STA/MP/SAN; five core attributes; warehouse, shop, weight-constrained loadout, slots for weapons/armor/accessories/consumables, learned vs equipped skills and prerequisites, stat upgrades.
- **P1**: Rule-driven turns, item and weapon effects, stamina/mana cost, cooldown, shield/evade, enemy telegraphs, HP, vulnerability/regeneration, AI teammate support, defeat/rescue and grade calculation.
- **P2**: Twelve dynamically assigned missions across four familiar movie/series/anime worlds: solo, team, rival; mission objectives, rare clues, fixed assignment (no free reroll); unlockable repeat coordinates.
- **P3**: Traditional written Chinese novel+dialogue paragraphs; persistent mission events and relationship memory. Free text actions use rule-based intents, **not a connected LLM**.
- **P4**: Offline AI teammates/rival simulation, persistent bonds and competitive scoring. **Not real-time network multiplayer**. Server accounts, multiplayer lobbies, live PvP and authority synchronization are not connected.

## Development and deployment

All files are static, no build is needed. Open `index.html` in a static HTTP server or deploy the five files to Vercel with the project root set to this directory. Browser localStorage key: `nightwalker_p0p4_integrated_v1`. The app attempts a **read-only one-time import** of certain fields from `nightwalker-v5-main-god-novel-20261011` when no new save exists; the original key and site are not changed.

Data model: `data.js`. Authoritative rules: `engine.js`. UI: `app.js`. Styles: `style.css`.

## Important limitations

- A skills catalog entry is not automatically acquired. Learned skills require adequate level/stats, then must be equipped to an active skill slot.
- Damage is calculated by the rule engine, not generative text.
- Mobile testing in the user's browser is not automatically guaranteed by successful Vercel deployment.
- Before P4 can become true online multiplayer, use a separate dedicated backend, authenticated persistence, server-authoritative combat and state synchronization. Do **not** reuse the existing Supabase project assigned to an unrelated application.
- Fan-project use of fictional IP settings does not imply licensing or endorsement.

## Full recovery between reincarnations (October 2026)

After mission resolution, accepting the reward immediately restores **HP 100/100, STA 100/100, MP 60/60, SAN 100/100** at zero cost. When a new assignment is accepted or a new world is entered, these values are normalized again before any world-specific bloodline penalties are applied. The currently active mission **does not** heal on page refresh. Existing save files in the main-god hub with partially depleted resources are normalized on load. Consumed potions and other items **remain consumed** and are not restocked. XP, level, credits, loot, party bonds and world records remain persistent.

## Dedicated Supabase project and security

The separate **Nightwalker RPG** project is provisioned in Singapore with five RLS-enabled tables: `nw_profiles`, `nw_game_saves`, `nw_mission_records`, `nw_character_relationships`, and `nw_party_rooms`. It is completely separate from other apps' databases. Policies grant authenticated players access only to their own records, and party rooms are presently owner-only. The static browser app still uses localStorage until player authentication and a server-authoritative save sync are implemented. Do not embed service-role credentials in the frontend. Creating a database does not activate live online multiplayer.

## Narrative-first revision (2026-10-12)

The in-world experience is now an interactive **Traditional-Chinese infinite-flow novel**, not a three-button combat RPG:

- Each chapter displays immersive narrative prose and a character dialogue panel, with exactly **three contextual narrative choices and a fourth free-text action** below the text on the same mobile screen.
- Combat is **not** a default option. Investigation, conversation, cooperation, withholding information, moral decisions, escape and stealth are authored by world and chapter. The first scene in **all four worlds** begins without compulsory combat choices. An optional combat encounter can be initiated when dramatically appropriate.
- **No automatic STA/SP/HP deduction for ordinary dialogue, observation or choice navigation.** Numerical consequence chips appear only for physical actions, prolonged running, stealth, attack, rest or risky actions.
- Sustained running burns 5 STA on subsequent physical scenes; stealth burns 3 STA per subsequent physical scene. Conversation, hiding, slowing to observe, and taking a rest end exertion without charging an arbitrary dialogue tax. Rest can recover 18 STA.
- HP/STA/MP/SAN remain visible in a separate **Status** panel, not as a constant combat HUD. Weapon/equipment and optional skills remain in contextual menus.
- Author-specific responses and discovered clues persist through the task and inform later paragraphs. NPC cast follows the assigned world and mission mode; the same companion is not forced into every world.
- Skills are optional, and their requirements, cooldowns and MP costs are enforced by the engine. Inventory use no longer automatically advances story chapters or generates fictitious combat damage while in a safe narrative scene.
- **Free text is still handled by deterministic intent parsing; real generative story AI is not yet connected.** Online player-to-player cooperation and cloud saves remain separate unfinished integrations.
- Previous full automatic HP/STA/MP/SAN recovery at mission settlement remains unchanged, as do the warehouse, battle inventory, gear requirements and Supabase RLS schema.

## Playable-novel rewrite (October 2026)

The previous scene renderer produced disjointed RPG-flavored snippets: one mechanical narration paragraph, an unrelated NPC utterance and a repetitive decision prompt. The new `novel.js` provides 24 authored Traditional-Chinese chapters in a Mainland web-fiction narrative register (six scenes per world across four worlds).

- The prose, character dialogue, Main God entry prompt, rising tension and choices form a single scene in reading order. Conversation, action and discovery are woven together instead of being separated into repeated UI blocks.
- The Main God assigns mission type and goals at entry. The mission panel is optional, not repeated in every paragraph.
- Three story-context choices plus one free-text option remain under the reading area on the same mobile screen.
- Every standard world choice has its own corresponding authored consequence; recognized free actions receive world-specific follow-up prose rather than generic "you didn't fight" filler.
- World clues and party/rival assignment selectively affect passages. Existing saved missions resume from their stored chapter and flags.
- The underlying engine still has a **six-scene narrative spine** per mission and free-text intent parser. Genuine open-ended AI-authored dialogue and large branching narrative memory will require an external LLM and server-side orchestration; do not imply they are implemented in this static release.
- Player progression, HP/STA/MP/SAN full recovery at settlement, inventory, equipment/skills, warehouse and Supabase schema remain intact.

## October 12 feature release: reset, upgrades, effects, AI bridge

- A seven-category reinforcement system now drills down into subtypes and purchasable abilities. Skills and bloodlines have independent subfamilies; unequipped or unimplemented abilities are not falsely sold.
- Paid text-specified world selection: known authored worlds cost 220 points, unknown worlds require enabled AI and cost 300 points plus 10 per character after the eighth. AI generation failures at the start of a custom world support full refunds before any action.
- On first launch after this release, Nightwalker local state starts afresh at level 1, XP 0, 0 completed missions, with 1000 starting points, basic equipment and supplies. This is a one-time reset, not a reset on every refresh. Only known Nightwalker localStorage keys are cleared. No other project's data is touched.
- Nightwalker cloud-save tables were empty (0 profiles, 0 game saves, 0 mission records) when checked, and the static game has not yet connected to cloud save sync.
- Restored E+ text performances for eight emotional moods; a visible in-game E+ switch supports disabling and enabling animations. Motion preference is respected.
- Added an AI endpoint at api/story.mjs that calls the Groq OpenAI-compatible Chat Completions endpoint, model openai/gpt-oss-20b. It needs a GROQ_API_KEY encrypted server environment variable in the Nightwalker Vercel project, which is not yet configured.
- The AI must not override combat stats, equipment, skills, XP, mission scores or earned loot. The app retains existing authored story when API generation is not configured.
- True server-side security, authenticated players, robust provider abuse protections and real multiplayer are still pending. Do not put API secrets in frontend HTML/JS.

## 2026-10-12 · Main God classification, AI gateway, E+ animations, custom-world entry, fresh start

- Main God reinforcement has **seven root families** and hierarchical **family → specialization → item** navigation. Skill schools include melee, ranged, movement/stealth, exploration, investigation, medicine, defense, mental/magic, breathing and passives. Bloodlines group into beast, supernatural, elemental and forbidden lineages. Unimplemented entries are honestly marked unavailable and cost nothing.
- Emotional E+ text animations: calm paragraph entry, suspense fade, eerie glitch, shock camera/text, anger push, grief slow fade, resolve glow, system-terminal reveal; respects reduced-motion setting.
- AI route: `api/story.mjs`, Vercel serverless `GET /api/story` reports configuration state, `POST /api/story` validates prompts/JSON and calls Groq with `GROQ_API_KEY` set as a Vercel server-side secret. The default model is `openai/gpt-oss-20b`; optional `GROQ_MODEL` overrides it. No key is embedded in HTML, client code or GitHub.
- While AI is not configured, existing authored story worlds remain fully playable. **Unknown custom worlds cannot be purchased without a connected AI backend.**
- Players can type a custom world name at the portal. Existing worlds cost 220 in-game points to target; previously unlisted worlds cost 300+ points and must use the live AI backend for generated story and three scene options. Before taking the first action in an unlisted world, a failed generation can be cancelled with refund and restoration of all unused bag items.
- Each AI-generated scene is persisted in the browser save, prior AI scene passages and last eight actions are carried forward as limited memory. AI may not change stats, loot, mission rule authority, or force completion.
- One-time fresh start migration uses the new browser key `nightwalker_new_start_20261012_v2`. Previous Nightwalker saves are deleted only on first load of the new version, not on every refresh. Defaults: Lv.1, zero completed runs/worlds, baseline warehouse/loadout, 1000 starting test points. Supabase project/tables and all other applications remain intact.
- **Cloud save and real-time multiplayer are not yet connected**, and a configured Groq key plus successful serverless deployment test is required before live AI generation can be claimed.

## E+ cinematic text performance v2

- Reading is still **text-only**, with the novel and NPC dialogue presented before the same three contextual choices and one free-action field.
- Narration is divided into timed dramatic **story beats**. NPC dialogue and Main God system text have real per-character typewriter delivery, with reserved paragraph height to avoid jumping layouts.
- Eight distinct moods: calm, suspense, eerie, shock, anger, grief, resolve, and system. The shock shake/flash is brief and does not loop.
- Reader intensity is a persisted three-position switch: **strong → standard → off**. Respect OS `prefers-reduced-motion`.
- A **skip performance** button immediately reveals the full current scene; it never skips a decision or modifies any character stats.
- Animations occur **once per new story phase** (including a newly generated AI scene), rather than repeating whenever an inventory/status panel opens. Reading scroll position is preserved when the same scene is re-rendered.
- All effects are local browser effects without access to gameplay state. The production HTML loads `effects.js` before `app.js`; CSS and application script use an E+ v2 cache key.

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

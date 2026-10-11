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

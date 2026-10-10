# Nightwalker v2 · AI RPG runtime

The default route `/` and `/play` now serve the cinematic, image-free Nightwalker game.
The old hand-authored story remains available at `/classic`, and the old AI trilogy at `/ai`.

## Trust boundary

- `lib/nightwalkerGame.ts`: canonical inventory IDs, numeric attributes, owned skills, bloodlines, pets, battle math, shop costs, equipment, mission eligibility and memory state.
- `app/api/nightwalker/route.ts`: the ONLY legitimate gameplay mutation entrypoint. AI JSON is narration/choices only. AI output cannot directly award an item, mutate HP, or invent a skill; fabricated player equipment narrative is rejected where detected.
- `app/api/nightwalker/save/route.ts`: optional cloud save with random per-player ID, secret token SHA256, and revision-based optimistic concurrency, stored in **Nightwalker-only** `game_saves_v2` Mongo collection.
- `app/play/page.tsx`: cinematic mobile UI, local browser autosave, download/import, optional cloud sync.

## Memory design

1. Canonical state: inventory and equipped weapon/armor IDs, acquired skill ranks, attributes, bloodline, pets, NPC status, flags, world progress.
2. Event ledger: important choices, discovered facts, shop upgrades, combat results, loot and world transitions (latest 250 events).
3. Rolling narrative summary: AI-maintained text, bounded in length; history is still stored separately.
4. Relevant recall: fixed important facts + last 12 events + keyword-matching episodic events + last eight logged exchanges in every AI prompt. AI cannot override canonical state.
5. Persistence: autosave in localStorage, import/export JSON. Optional separate MongoDB database and manual cloud sync when configured. Cross-device sync requires moving ID and secret securely; not enabled by default.

## Combat

- Server calculates attack from owned weapon, skill, strength, defense and active bloodline.
- Pistol requires acquired shooting skill and consumes one existing bullet per shot.
- Item use consumes quantity. Pets cannot assist before purchase; combat skills require learning and SP.
- Enemy hit points, player HP, victory rewards and failed retreat are server-side calculations.
- Required world encounter is initiated after sufficient exploration and its boss defeat is necessary before settlement. Future versions can add negotiated/pacifist objective variants.

## Main God upgrades

Body attributes, trained skills, special bloodlines, pets, equipment/consumables and healing. Each catalog entry carries a cost and eligibility gate. Upgrades can only be purchased in Main God hub.

## Configuration

Set `GROQ_API_KEY` (or `OPENAI_API_KEY`) on Vercel. The API uses an OpenAI-compatible chat completions endpoint; optional `AI_MODEL` and `AI_BASE_URL` override defaults. The browser never receives the secret.

Optional MongoDB cloud-save key: `MONGODB_URI` (use a dedicated Nightwalker MongoDB cluster/database). This project's Vercel currently has neither secret. The product must NOT claim AI generation or cloud saves work until explicitly configured and tested.

Optional `ADVENTURE_ACCESS_CODE` to restrict AI requests. For multi-user/multi-device secure gameplay, implement session authentication and a server-authoritative ledger before broad public release; the current single-player v2 state is client-managed and normalized but can be tampered with by a technically skilled user.

## Quality

`npm run test:rpg` exercises weapon ownership, ammo, purchases, pet/skills, boss completion gating, item acquisition, narrative restrictions and memory recall. `npm run build` includes the existing story/AI tests and this new suite. `/classic` remains a fallback.


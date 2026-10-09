# NIGHTWALKER ∞ — 無限流 RPG

Mobile portrait-first, Cantonese choice-driven supernatural RPG. The project now prioritizes dialogue, investigation, NPC relationships and travel between worlds; combat is one optional narrative tool, not the whole game.

## Play

Production: https://nightwalker-rpg-web.vercel.app

- Main story: `/` — mobile portrait visual-novel interface.
- Classic battle training: `/combat` — previous animation/battle prototype preserved.
- Supports Android home-screen launch via `public/manifest.webmanifest`.
- Local browser autosave key: `nightwalker-multiverse-story-v1`; older combat saves remain separate.

## Narrative prototype: branching, not yet live AI-generated

**Zero Station** is already completed when the story starts. The player enters the **Main God's Transfer Station** with 100 HP, 74 SP, 105 points and a permanent nameless-survivor identity.

Hand-authored interconnected worlds:
1. **Lost & Found / 失物管理處** — discover the player's repeating deaths, help 小滿, negotiate with or fight the administrator.
2. **Blood Moon Apartment / 血月公寓** — follow contradictory tenancy rules, decide what happens to a lost child and the caretaker.
3. **Mirror City Hospital / 鏡城病院** — learn about memory deletion and choose whether to save the mirror self.
4. **Rift / 不穩定裂隙** — unlocked after the first three worlds; a repeatable set of variable locations and choices. This currently uses story templates and should **not** be mistaken for unlimited AI-generated worlds.

Game state persists HP/SP, points, NPC bond, inventory, important flags, cleared worlds, discoveries, paths taken and rift iteration counts. Some routes are gated by clues, items or relationship level. Combat encounters can often be avoided through successful dialogue/investigation.

## Engineering

- Next.js 14 + React 18 + TypeScript
- `lib/infiniteStory.ts` — data-driven scene graph, conditions, effects and state rules
- `app/page.tsx` — mobile story reader, portal choices, shop, inventory, integrated battles and autosave
- `app/story.css` — portrait immersive UI sized to 100dvh, in-panel option scrolling
- `app/combat/page.tsx` — archived v0.3 battle prototype
- `scripts/validate-story.cjs` — world connectivity, consequence and unlock tests
- `.github/workflows/nightwalker-build.yml` — scripted story checks, TypeScript check and production build

No external paid artwork or AI provider is required to play. Current scene artwork is original vector, not yet final layered sprite characters.

## Local setup

```bash
npm install
node scripts/validate-story.cjs
npx tsc --noEmit
npm run build
npm run dev
```

Visit http://localhost:3000.

## Next production milestones

1. Better layered character art, clean portraits, and conditional NPC emotions in dialogue.
2. Save game data in a backend so the user can switch between devices.
3. Add a controlled AI Story Director: strict world state/rules and inventory/choice validation, AI only for prose/NPC speech and newly suggested actions.
4. More complex persistent companions, affinity, cross-world causality and truly distinct procedural worlds.
5. Accessibility and real-device testing, stronger low-height portrait layout, optional sound.

Do not commit API keys or secrets.

# NIGHTWALKER ∞ / 無限流 RPG

Mobile-first Cantonese horror RPG prototype. The old visual-novel homepage was replaced with a compact, interactive combat experience on 9 October 2026.

## Current gameplay

- Start from the end of 副本 001《零號月台》: **無名生還者**, 100 HP, 74 SP, 105 points.
- 副本 002《凌晨四點的失物招領處》: fight the 失物管理員 and 夜班裁定官.
- Six battle commands: slash, defend, inspect, 遺忘者印記, 鏡像斬, item bag.
- Telegraphed enemy attacks; items can interrupt appropriate enemy actions.
- Rewards, leveling, permanent sword upgrade and an inter-battle points shop.
- CSS/SVG character animation and effects; optional synthesized effects audio.
- Responsive one-screen combat UI, fullscreen button and browser-local autosave.

## Stack

Next.js 14, React 18, TypeScript, CSS and original lightweight inline SVG artwork. No paid asset pack, external CDN, account or AI API is required for the combat demo.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npx tsc --noEmit
npm run build
```

GitHub Actions runs typecheck and the Next.js build on updates to main (see `.github/workflows/nightwalker-build.yml`).

## Deploy to Vercel

1. Open https://vercel.com/new and select **Import Git Repository**.
2. Choose `chiholung-cmd/nightwalker-rpg-web` (allow Vercel's GitHub app repository access if necessary).
3. Keep Framework Preset = **Next.js**, Root Directory = `./`.
4. Deploy. Subsequent GitHub pushes to `main` should automatically redeploy.

*Deployment status:* Source has been committed to GitHub, but creation/deployment through the currently linked Vercel connector returned 403, so no verified Vercel URL is available yet.

## Assets

Current characters and FX are original inline SVG/CSS and need no external attribution. For later asset upgrades:
- https://kenney.nl/assets — CC0 asset packs (check specific pack's license).
- https://kenney-assets.itch.io/fantasy-ui-borders — CC0 RPG interface borders.
- https://opengameart.org — free assets under varied licenses; choose CC0 or give appropriate credit where required.

Avoid copying sprites from commercial games or using third-party artwork without checking licenses.

## Future work

High-detail consistent character illustrations, layered sprite sheets, PixiJS particles/rigging, narrative branching, an expandable item inventory, multi-floor randomized dungeons and backend sync.

## Previous prototype

Older API endpoints and game data remain in the repository, but the homepage no longer calls the original MongoDB seed/save routes. They can be removed during a later cleanup after verifying that other features no longer depend on them.

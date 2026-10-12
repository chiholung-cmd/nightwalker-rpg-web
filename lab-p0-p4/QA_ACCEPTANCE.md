# Nightwalker · Novel-first V6 Release Acceptance

Status: development branch only until live, visual, and real-model acceptance passes. Existing Production is not V6 until the corresponding SHA is READY.

## Must-pass release criteria

1. Identity: A new player explicitly chooses a protagonist name. The product brand Nightwalker must never be used as an assumed character name. All prior saves remain intact.
2. Work lookup: Typing 尋泰記 and choosing 劇集 must suggest 尋秦記 for user confirmation, including source/medium. Zero credits may be spent on lookup or cancel. An unknown work may not be invented as an adaptation.
3. Version: A verified 2001 TV adaptation source must remain pinned throughout the game, never silently switched to the original novel or its film sequel. An encyclopedia summary is not proof of episode-by-episode continuity.
4. Prose: Each model-generated chapter targets 750–1100 Chinese prose characters, at least six coherent paragraphs and multiple meaningful scene beats before a decision. Output below 550 characters must be visibly flagged and allow manual rewrite.
5. Voice: Third-person character-led webnovel narration. No automatic player-name brand placeholders, repeated 你看見 / 你發現 narration or mechanical HUD summaries. Natural NPC dialogue should remain intact.
6. Agency: At least one meaningful event between decision panels. Earlier decisions, injury and NPC promises must visibly alter later action.
7. Mobile reading: At 360x780, main novel prose fills available viewport, stays independently scrollable, and choices begin collapsed. No clipped final paragraph, floating status overlay or blocked primary action.
8. Resilience: Test at least ten consecutive real Groq chapters, 429 cooldown, cloud save/recovery, and zero hidden extra AI purchases. No skipped chapters.
9. Finale: Resolve major clues and character fates in actual prose; narrative must not end just because progress points reached a number.

## Automated tests

node --test lab-p0-p4/tests/*.test.mjs

The regression suite tests structure with **mocked model responses**; it is not evidence of literary quality or real Groq continuity.

## Still requiring live validation

- Actual mobile screenshots and reader interaction test
- Long, coherent, human-reviewed real AI output across 5–10 chapters
- Canonically correct episode chronology with primary sources when available
- Full 28-chapter run and legacy-save recovery

Never claim all of these passed solely because GitHub CI is green.

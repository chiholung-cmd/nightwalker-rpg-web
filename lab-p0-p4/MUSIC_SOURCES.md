# Nightwalker Adaptive BGM · Free Music Sources

All music in this preview is optional, muted until a direct reader interaction, and selected by scene mood. There is no music streaming API key or paid service.

## Licensed tracks

| Scene moods | Track | Creator | Source | License | Preview delivery |
|---|---|---|---|---|---|
| Main-God hub / system | Pulse | SRG774 | https://opengameart.org/content/dark-sci-fi-audio-pack | CC0 | OpenGameArt external MP3 |
| Calm / open-world exploration | Airy | SRG774 | https://opengameart.org/content/dark-sci-fi-audio-pack | CC0 | OpenGameArt external MP3 |
| Suspense / investigation | Sector | SRG774 | https://opengameart.org/content/dark-sci-fi-audio-pack | CC0 | OpenGameArt external MP3 |
| Eerie / horror | Airy | SRG774 | https://opengameart.org/content/dark-sci-fi-audio-pack | CC0 | OpenGameArt external MP3 |
| Danger / pursuit / anger / shock | Urgent | SRG774 | https://opengameart.org/content/dark-sci-fi-audio-pack | CC0 | OpenGameArt external MP3 |
| Loss / sadness | Sadness | Kistol | https://opengameart.org/content/sadness | CC0 | OpenGameArt external OGG |
| Finale / release | Transmission | SRG774 | https://opengameart.org/content/dark-sci-fi-audio-pack | CC0 | OpenGameArt external MP3 |

Licenses were checked against each asset's OpenGameArt source listing on 2026-10-13. CC0 allows redistribution and commercial adaptation; credit is optional but the project should retain source links and creator names as good practice. Re-check if replacing any track.

## Important engineering and licensing details

- **Prototype only:** the audio player streams the original direct files hosted by OpenGameArt. It does **not** copy or commit MP3 files into the Git repository. Hotlinked hosts may rate-limit or block these links; verify in a real browser before Production.
- **Production release:** Download the source-listed files, optionally encode them to small OGG / MP3 files, place under `lab-p0-p4/music/`, switch `music.js` URLs to relative local paths, and keep this source ledger. Do not confuse a downloaded sample with a bundled library license.
- **Mixed commercial licenses:** never assume music licensed for YouTube is licensed for games. Mixkit Stock Music Free License explicitly forbids video games; **do not use Mixkit music** for Nightwalker. Mixkit SFX license is separate and permits games.
- **Playback:** Smartphone browsers require direct user interaction to play audio. The reader taps **開啟配樂**; automatic chapter mood switching then works inside that same session.
- **Data usage:** Streaming MP3 / OGG takes bandwidth, especially for mobile travelers. Music is off by default and remembers volume (22% default, 45% maximum).
- **Soundtrack cues:** System music never overrides the user's toggle; active scenes map `mood` to the appropriate theme and crossfade over approximately 1.4 s. Audio is not part of AI prompt tokens, and playback does not affect story/save state.

## Better fully free alternatives

- OpenGameArt: https://opengameart.org/ – select CC0 game soundtracks.
- Pixabay Music: https://pixabay.com/music/ – custom Pixabay Content License; avoid standalone redistribution, verify item-specific limits.
- Kenney SFX: https://kenney.nl/assets/ui-audio – CC0 UI tones, not full music.
- Free Music Archive: https://freemusicarchive.org/ – licenses vary by track; some disallow commercial use and derivatives. Check each item separately.

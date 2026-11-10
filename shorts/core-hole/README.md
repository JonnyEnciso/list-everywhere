# Core-hole Short: "Why can't we just dig to the center of the Earth?"

Vertical 2D cut-out cartoon Short (1080x1920 comp, 60 fps, rendered 2160x3840, 25.9 s) made with the
`cutout-cartoon-shorts` skill (`.claude/skills/cutout-cartoon-shorts/SKILL.md`).

## Voice-over (70 words, 24.2 s)

> So this guy wants to dig straight to the center of the Earth. Easy, right? Just keep digging. The deepest hole
> ever drilled is about twelve kilometers. Down there, the rock was around a hundred eighty degrees Celsius, and
> acted like plastic. So the drilling stopped, about a fifth of one percent of the way there. Nobody's ever gotten
> anywhere close to the core. Pretty much everything we know about it comes from earthquake waves passing through
> the planet.

Facts: the Kola Superdeep Borehole (Russia) reached about 12,262 m, the deepest hole ever drilled. At the bottom the
rock was around 180 °C (about twice the expected 100 °C) and behaved more like plastic than rock; drilling stopped in
the early 1990s (sources differ on the exact year, and funding also played a part). 12 km / 6,371 km (Earth's mean
radius) = 0.19 %, i.e. about a fifth of one percent of the way to the center. What we know about the core comes
mainly from seismology: how earthquake waves travel through, bend around and reflect off the planet's layers.
Sources: [Scientific American](https://www.scientificamerican.com/article/how-deep-is-the-deepest-hole-in-the-world),
[Wikipedia: Kola Superdeep Borehole](https://en.wikipedia.org/wiki/Kola_Superdeep_Borehole).

Voice: ElevenLabs engine through Higgsfield `text2speech_v2` (variant `elevenlabs`, preset voice "Mark"),
Higgsfield job `8219d223-8b3e-4336-8cf8-ef78102fcf94` (with the ending; the earlier 5-line take was `6fa1111f-...`).

## Beat sheet (times measured from the take by `scripts/retime.py`)

| time | words | on screen | sound |
|---|---|---|---|
| 0.1 - 2.9 | "So this guy wants to dig straight to the center of the Earth." | frame 0 = premise: round-head guy with a shovel on the grass, Earth cross-section below him, a sleeping core at the bottom; on "Earth" the core opens its eyes and looks up | pop |
| 3.4 - 5.3 | "Easy, right? Just keep digging." | smug bounce; on "digging" he shovels: dirt clumps fly behind him (gravity), the hole deepens, a dirt pile grows | boing, shovel chk / swish / plop |
| 5.7 - 8.6 | "The deepest hole ever drilled is about twelve kilometers." | a drill rig pops up over the hole, the camera eases in, the spinning bit goes down while a readout counts 0 -> 12 km (pops on "twelve") | pop, clank, drill motor, ding |
| 9.0 - 13.5 | "Down there, the rock was around a hundred eighty degrees Celsius, and acted like plastic." | camera dives to the bit (depth-of-field blur on the hills); the rock glows, steam puffs from the bore, a thermometer shoots up to 180 °C; on "plastic" the hot rock goes gooey, grows a smirking face and bends the bit | whoosh, sizzle, pop, squish |
| 13.9 - 17.3 | "So the drilling stopped, about a fifth of one percent of the way there." | camera back to the rig: motor clunks, smoke, the guy sweats; then a cut and pull-back to the true-scale Earth: a pin marks the hole, a magnifier shows the 12 km bore, a dashed line labelled "6,371 km" runs to the core, which smirks on "there" | clank, whoosh, pop, swish |
| 17.7 - 19.9 | "Nobody's ever gotten anywhere close to the core." | the magnifier pops away; the core gives a smug half-lidded shrug | pop, boing |
| 20.3 - 24.2 | "Pretty much everything we know about it comes from earthquake waves passing through the planet." | on "earthquake" a quake bursts on the surface, rings of waves sweep through the planet (the core giggles as they pass) and reach a seismometer on the far side, whose needle starts scribbling | rumble, scratch |
| 24.6 - end | | cut back to the frame-0 shot (1.2 s hold, loops) | |

## Pictures, voice, sound

- **Pictures:** all drawn as SVG in `src/core/parts.tsx` (Higgsfield GPT Image 2.5 needs a paid plan on this
  account). Same flat style as the woodpecker Short: thick even black outlines, flat colours, faces on objects.
- **Sound effects:** synthesized by `scripts/gen_sfx.py` (no credits). The drill loop is cut to the drilling beat,
  so re-run it after `retime.py`.

## Re-render

```bash
npm install
python3 scripts/retime.py public/core/vo/take1.mp3 && python3 scripts/gen_sfx.py   # only if the voice changes
node scripts/stills.mjs 0 2.6 4.4 5.6 7.5 10.8 12.4 13.7 14.3 15.0 16.1 16.8 && python3 scripts/sheet.py
npm run render                                   # -> out/core-hole-4K.mp4 (2160x3840, 60 fps)
python3 scripts/popscan.py out/core-hole-4K.mp4  # flags should only be digs, the rig pop, camera moves and cuts
```

# Woodpecker Short: "Why doesn't it get a concussion?"

Vertical 2D cut-out cartoon Short (1080x1920 comp, 60 fps, rendered 2160x3840) made with the
`cutout-cartoon-shorts` skill (`.claude/skills/cutout-cartoon-shorts/SKILL.md`).

## Voice-over (70 words)

> A woodpecker smashes its head into a tree over and over. Why doesn't it get a concussion? Many people assumed its
> skull works like a shock absorber. But when scientists filmed woodpeckers in slow motion, the head stopped hard,
> like a hammer. Cushioning would only weaken each peck. The real protection is size. A woodpecker's brain is tiny,
> and the same jolt creates far less pressure inside a small brain.

Source: Van Wassenbergh et al. (2022), "Woodpeckers minimize cranial absorption of shocks", *Current Biology*,
doi:10.1016/j.cub.2022.05.052.

## Beat sheet

| time (from `timing.json`) | words | on screen | sound |
|---|---|---|---|
| 0 - 4.3 | "A woodpecker smashes its head into a tree..." | frame 0 = premise: woodpecker on a trunk, rapid pecks, wood chips, peck hole grows | knocks, small shake per hit |
| 4.6 - 6.9 | "Why doesn't it get a concussion?" | camera pushes in; on "concussion" dizzy stars pop around the head, then a calm blink pops them away | pops |
| 7.3 - 11.1 | "...like a shock absorber." | x-ray lens opens on the head: a coil spring between beak and brain, boinging on every peck | whoosh, knock + boing |
| 11.4 - 17.1 | "...filmed woodpeckers in slow motion... like a hammer." | REC viewfinder; on "slow motion" the spring pops out of the head; one slow-motion strike while a hammer swings at a nail on the other side of the trunk; both stop hard together on "hammer" | beep, boing, big thud + clang |
| 17.5 - 19.7 | "Cushioning would only weaken each peck." | a pillow pops onto the beak; the peck lands as a soft useless squish; annoyed brow | pop, soft "pff" |
| 20.1 - 22.0 | "The real protection is size." | camera dives into the head; x-ray shows the tiny calm brain, which pulses on "size" | whoosh, pop |
| 22.3 - 28.8 | "A woodpecker's brain is tiny... far less pressure inside a small brain." | hard cut: woodpecker head (tiny brain) beside a big round cartoon head (big brain); on "jolt" both glide and stop hard; on "pressure" red pressure rings squeeze the big worried brain (sweat drop), the small one smiles | thud, squeeze |
| 28.9 - end | | cut back to the frame-0 shot, pecking again (loops) | knocks |

## Differences from the skill, and why

- **No AI cut-out pictures.** The Higgsfield account is on the free plan: `gpt_image_2_5` is refused ("Requires
  basic plan or higher") and the alternatives that allow transparency cost 2.5-3.5 of the 10 credits each. Every
  sprite (woodpecker, trunk, spring, hammer, pillow, brains, heads) is drawn as SVG in `src/woodpecker/parts.tsx`
  in the same flat style (thick even black outlines, flat colours). The head is a separate part rotating about the
  neck, so pecks are animated instead of pose swaps.
- **Voice from Higgsfield, not ElevenLabs** (no ElevenLabs connector in that session): `seed_audio`, preset voice
  "John", generated as Higgsfield job `132eada2-2e84-405e-9ed7-de419c6d042c` (2.8 credits). The session's network
  blocked Higgsfield's CDN, so the file could not be downloaded there and the timing is an estimate.
- **Sound effects synthesized** in `scripts/gen_sfx.py` (no downloads, no credits).

## Finish with the real voice

```bash
npm install
# 1. download the generated voice (Higgsfield job above) or record your own take, then:
python3 scripts/retime.py ~/Downloads/voice.wav      # measures the 7 sentences, rewrites timing.json, copies the file
# 2. check, then render
node scripts/stills.mjs 0 6 9 15 17 19 21.5 25 && python3 scripts/sheet.py   # contact sheet -> images/qa/sheet.png
npm run render                                       # -> out/woodpecker-4K.mp4 (2160x3840, 60 fps)
python3 scripts/popscan.py out/woodpecker-4K.mp4     # every flag should be a peck, a camera move or a cut
```

Everything (pecks, cuts, camera moves, sound cues) is derived from the sentence times in `timing.json`, so a
re-timed voice needs no other edits. Rendering without a GPU takes a few minutes per pass on 4 cores
(`remotion.config.ts` points Remotion at the pre-installed headless Chromium; remove that line elsewhere).

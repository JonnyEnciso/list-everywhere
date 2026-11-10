# Woodpecker Short: "Why doesn't it get a concussion?"

Vertical 2D cut-out cartoon Short (1080x1920 comp, 60 fps, rendered 2160x3840) made with the
`cutout-cartoon-shorts` skill (`.claude/skills/cutout-cartoon-shorts/SKILL.md`).

## Voice-over (53 words, ~19-20 s)

> So this woodpecker slams its face into a tree, over and over. Why no concussion? People figured its skull works
> like a shock absorber. But slow-motion video shows the head stops hard, like a hammer. The real trick is size.
> Its brain is so small, the same hit makes way less pressure inside.

Source: Van Wassenbergh et al. (2022), "Woodpeckers minimize cranial absorption of shocks", *Current Biology*,
doi:10.1016/j.cub.2022.05.052 (high-speed video of three species: the head works as a stiff hammer, not a shock
absorber; pressure simulations put the small brain below primate concussion thresholds).

Voice: ElevenLabs engine through Higgsfield `text2speech_v2` (variant `elevenlabs`, preset voice "Mark"),
Higgsfield job `0de174ac-b3b9-4878-bd00-a4cacb881a23` (0.9 credits). An earlier 70-word take (Seed Audio,
"John", job `132eada2-2e84-405e-9ed7-de419c6d042c`) belongs to the longer first draft and is not used.

## Beat sheet (times measured from the voice take by `scripts/retime.py`)

| time | words | on screen | sound |
|---|---|---|---|
| 0.1 - 4.4 | "So this woodpecker slams its face into a tree, over and over." | frame 0 = premise: woodpecker on a trunk, rapid pecks, wood chips, peck hole grows | knocks, small shake per hit |
| 4.9 - 6.0 | "Why no concussion?" | camera pushes in; on "concussion" dizzy stars pop around the head; a calm blink pops them away | pops |
| 6.4 - 9.3 | "People figured its skull works like a shock absorber." | on "skull" an x-ray lens opens on the head; then a coil spring between beak and brain boings on every peck | whoosh, knock + boing |
| 9.6 - 13.4 | "But slow-motion video shows the head stops hard, like a hammer." | REC viewfinder; on "shows the head" the spring pops out of the head; one slow-motion strike while a hammer swings at a nail on the other side of the trunk; both stop hard together on "hammer" | beep, boing, big thud + clang |
| 13.8 - 15.3 | "The real trick is size." | camera dives into the head; x-ray shows the tiny calm brain, which pulses on "size" | whoosh, pop |
| 15.6 - 19.7 | "Its brain is so small, the same hit makes way less pressure inside." | hard cut: woodpecker head (tiny brain) beside a big round cartoon head (big brain); on "hit" both stop hard; on "pressure" red rings squeeze the big worried brain (sweat drop) while the small one smiles | thud, squeeze |
| 19.9 - 20.6 | | cut back to the frame-0 shot, pecking again (loops) | knocks |

## Differences from the skill, and why

- **No AI cut-out pictures.** The Higgsfield account is on the free plan: `gpt_image_2_5` is refused ("Requires
  basic plan or higher") and the alternatives that allow transparency cost 2.5-3.5 of the 10 credits each. Every
  sprite (woodpecker, trunk, spring, hammer, pillow, brains, heads) is drawn as SVG in `src/woodpecker/parts.tsx`
  in the same flat style (thick even black outlines, flat colours). The head is a separate part rotating about the
  neck, so pecks are animated instead of pose swaps.
- **ElevenLabs through Higgsfield** (no ElevenLabs connector in that session), so `eleven_v4` and the ElevenLabs
  voice library could not be chosen directly. The session's network blocked Higgsfield's CDN, so the voice file
  could not be downloaded at first; once the environment allowed it, `retime.py` measured the take (19.7 s).
- **Rendered on CPU** (no graphics card in that container).
- **Sound effects synthesized** in `scripts/gen_sfx.py` (no downloads, no credits).

## Finish with the real voice

```bash
npm install
# 1. download the generated voice (Higgsfield job above) or record your own take, then:
python3 scripts/retime.py ~/Downloads/voice.wav      # measures the 7 sentences, rewrites timing.json, copies the file
# 2. check, then render
node scripts/stills.mjs 0 2 5.3 7.3 9 11 12.8 13.4 15.3 17.5 19.8 && python3 scripts/sheet.py   # contact sheet -> images/qa/sheet.png
npm run render                                       # -> out/woodpecker-4K.mp4 (2160x3840, 60 fps)
python3 scripts/popscan.py out/woodpecker-4K.mp4     # every flag should be a peck, a camera move or a cut
```

Everything (pecks, cuts, camera moves, sound cues) is derived from the sentence times in `timing.json`, so a
re-timed voice needs no other edits. Rendering without a GPU takes a few minutes per pass on 4 cores
(`remotion.config.ts` points Remotion at the pre-installed headless Chromium; remove that line elsewhere).

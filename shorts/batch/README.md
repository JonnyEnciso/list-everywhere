# Batch of 5 cut-out cartoon Shorts

One Remotion project, five compositions, all made with the `cutout-cartoon-shorts` skill
(`.claude/skills/cutout-cartoon-shorts/SKILL.md`) and sharing one library:

- `src/lib/time.ts`: timing helpers (`timeline()` turns a `timing.json` into `at(sentence, fraction)`), easing,
  pop / wobble springs; every Short ends with a 1.6 s tail after the last word.
- `src/lib/stage.tsx`: 2.5D multiplane camera (`camAt`, `Layer`, `shaken`), the voice + sound-cue layer.
- `src/lib/parts.tsx`: the round-head guy, faces for objects (`BlobFace`), merged-outline puffs, labels.
- `scripts/gen_sfx.py`: synthesized sound-effect library in `public/sfx` (no credits).

| id | question | category | voice |
|---|---|---|---|
| `Windows` | Why are airplane windows round? | engineering | done (Higgsfield job `09845380-41b1-4b55-a357-450c67aa38e2`) |
| `Onion` | Why does cutting an onion make you cry? | food chemistry | done (job `a4c5b0df-d9b1-4100-8313-18361024e796`) |
| `Stomach` | Why doesn't your stomach digest itself? | human body | **not generated yet** (out of credits) |
| `Moon` | Why are the Apollo boot prints still on the Moon? | space | **not generated yet** |
| `Sixty` | Why does an hour have 60 minutes? | history | **not generated yet** |

Voice everywhere: ElevenLabs through Higgsfield `text2speech_v2` (variant `elevenlabs`, preset voice "Mark",
`27c04473-84a9-4b60-a41f-c8e8458bd4f1`), the same voice as the woodpecker and core-hole Shorts.

## Scripts and sources

**Windows (26.4 s voice):** So why are airplane windows round, and not square? In 1954, two Comets, the world's
first jet airliners, broke apart in midair. Every flight, the cabin gets pumped full of air, then let down again.
That flexes the metal, over and over. At sharp corners, the stress bunches up, and tiny cracks start to grow. Round
corners spread the stress out evenly. So pretty much every airliner since has rounded windows.
Facts: two de Havilland Comet crashes in 1954 (BOAC 781, SAA 201); the inquiry found metal fatigue from repeated
pressurization, with cracks starting at the corner of a fuselage opening. Rounded openings spread the stress.
Sources: [InsideFlyer](https://insideflyer.com/posts/airplane-windows-have-rounded-corners-for-safety/),
[Yahoo/Independent](https://uk.news.yahoo.com/alarming-reason-plane-windows-were-111101276.html),
[MigFlug](https://migflug.com/jetflights/de-havilland-comet-metal-fatigue-square-windows-investigation-1954/).

**Onion (22.9 s voice):** So why does cutting an onion make you cry? A whole onion is harmless. But the knife breaks
open its cells, and chemicals that were kept apart suddenly mix. An enzyme turns them into a gas that drifts right up
into your eyes. Your eyes feel it as an irritant, so they flush it out with tears. Basically, the onion is defending
itself. Scientists have even made onions that barely do it.
Facts: cutting lets alliinase meet the sulfur compounds; lachrymatory-factor synthase makes syn-propanethial-S-oxide,
a volatile irritant; tearless onions exist (bred / with the enzyme switched off).
Sources: [Smithsonian](https://www.smithsonianmag.com/smart-news/researchers-finally-figure-out-onion-enzyme-makes-you-cry-180964325/),
[The Conversation](https://theconversation.com/why-onions-make-us-cry-and-why-some-dont-84486),
[Live Science](https://www.livescience.com/why-slicing-onions-makes-you-cry).

**Stomach (estimated 23.6 s):** So this is your stomach, full of acid strong enough to break down meat. Why doesn't
it digest itself? Basically, it wears a raincoat. The wall is coated in thick mucus, and the cells underneath pump out
bicarbonate, the same stuff that's in baking soda. Any acid that sneaks through gets neutralized right there. And
worn-out lining cells get replaced all the time. When that shield breaks down, that's how you get an ulcer.
Facts: mucus gel + bicarbonate trapped under it keep the cell surface near neutral; the lining renews quickly; a
broken barrier (H. pylori, NSAIDs) leads to peptic ulcers.
Sources: [TeachMePhysiology](https://teachmephysiology.com/gastrointestinal-system/stomach/mucus-production/),
[IFLScience](https://www.iflscience.com/your-stomach-juices-are-so-acidic-they-can-digest-zinc-and-meat-so-why-dont-they-digest-you-and-your-precious-organs-83615).

**Moon (estimated 21.3 s):** So these are astronaut boot prints on the Moon, from over fifty years ago. Why are they
still there? On Earth, wind and rain would wipe them out fast. But the Moon has no air, so no wind and no rain. The only
thing wearing them down is a slow drizzle of tiny space rocks. Scientists think the prints could last tens of thousands
of years, maybe much longer. So for now, they're just sitting there, waiting.
Facts: no atmosphere, so no weather; micrometeorite "gardening" slowly churns the soil. Estimates range from tens of
thousands of years (LRO crater-rate study) to a million or more (AMNH), so the script hedges.
Sources: [AMNH](https://www.amnh.org/exhibitions/permanent/meteorites/meteorite-impacts/on-the-moon),
[Universe Today on the LRO study](https://www.universetoday.com/131437/moon-getting-slammed-way-thought).

**Sixty (estimated 25.9 s):** So why does an hour have sixty minutes, and not a hundred? Blame people who lived over
four thousand years ago. The Sumerians and Babylonians counted in sixties. Sixty splits evenly into halves, thirds,
quarters, fifths, and tenths. A hundred can't even be split into thirds. Later, astronomers used those sixties to
divide up time. Nobody knows for sure why they picked sixty, but we still count that way every time we check a clock.
Facts: Mesopotamian base-60 counting; 60 has many divisors; minutes and seconds came through astronomy; the original
reason for 60 is unknown.
Sources: [Scientific American](https://www.scientificamerican.com/article/experts-time-division-days-hours-minutes/),
[NIST (PDF)](https://tf.nist.gov/general/pdf/2209.pdf).

## Finish the three without a voice

```bash
npm install
# generate each line-up with the same voice (about 1 Higgsfield credit each), download it, then:
python3 scripts/retime.py stomach ~/Downloads/stomach.mp3
python3 scripts/retime.py moon ~/Downloads/moon.mp3
python3 scripts/retime.py sixty ~/Downloads/sixty.mp3
node scripts/stills.mjs Stomach 0 5 10 15 20 && python3 scripts/sheet.py Stomach   # check
node scripts/render.mjs Stomach Moon Sixty     # -> out/<Id>-4K.mp4 (2160x3840, 60 fps)
python3 scripts/popscan.py out/Stomach-4K.mp4  # flags should only be cuts, swaps and fast motion
```

Every beat is derived from the sentence times, so nothing else needs editing after `retime.py`.

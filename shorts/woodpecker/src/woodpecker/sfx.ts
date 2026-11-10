import {T} from './time';
import {HITS} from './peck';

/** one cue list: file (public/woodpecker/sfx/<f>.wav), start time (s), level (dB). Levels sit under the voice. */
export type Cue = {f: string; at: number; db: number};

export const CUES: Cue[] = [
  ...HITS.flatMap((h, i): Cue[] => {
    if (h.kind === 'wood') return [{f: i % 2 ? 'knock2' : 'knock', at: h.t - 0.002, db: -19}];
    if (h.kind === 'spring') return [{f: 'knock2', at: h.t, db: -22}, {f: 'boing', at: h.t + 0.01, db: -24}];
    if (h.kind === 'slow') return [{f: 'thud', at: h.t, db: -11}, {f: 'clang', at: h.t, db: -20}];
    return [{f: 'pff', at: h.t, db: -15}];
  }),
  {f: 'pop', at: T.stars, db: -24}, {f: 'pop', at: T.stars + 0.07, db: -25}, {f: 'pop', at: T.stars + 0.14, db: -26},
  {f: 'pop', at: T.starsOff, db: -27},
  {f: 'whoosh', at: T.xray - 0.2, db: -27},
  {f: 'beep', at: T.rec, db: -25},
  {f: 'boing', at: T.slow, db: -18},
  {f: 'whoosh', at: T.slow + 0.05, db: -28},
  {f: 'pop', at: T.pillow, db: -23},
  {f: 'whoosh', at: T.pillowOff, db: -28},
  {f: 'whoosh', at: T.dolly + 0.05, db: -25},
  {f: 'pop', at: T.size, db: -25},
  {f: 'thud', at: T.jolt, db: -15},
  {f: 'squeeze', at: T.pressure, db: -25},
];

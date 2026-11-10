import {T} from './time';

export const DIG = {hz: 2.3, count: Math.max(0, Math.floor((T.rig - T.dig) * 2.3))};

/** one cue list: file (public/core/sfx/<f>.wav), start (s), level (dB) - quiet under the voice */
export type Cue = {f: string; at: number; db: number};
export const CUES: Cue[] = [
  {f: 'pop', at: T.coreEyes, db: -24},
  {f: 'boing', at: T.smug, db: -27},
  ...Array.from({length: DIG.count}, (_, k): Cue[] => [
    {f: 'chk', at: T.dig + (k + 0.3) / DIG.hz, db: -17},
    {f: 'swish', at: T.dig + (k + 0.5) / DIG.hz, db: -27},
    {f: 'plop', at: T.dig + (k + 0.62) / DIG.hz + 0.42, db: -21},
  ]).flat(),
  {f: 'pop', at: T.rig, db: -18},
  {f: 'clank', at: T.rig + 0.05, db: -22},
  {f: 'drill', at: T.drill, db: -27},
  {f: 'ding', at: T.twelve, db: -24},
  {f: 'whoosh', at: T.dive - 0.15, db: -25},
  {f: 'sizzle', at: T.hot, db: -28},
  {f: 'pop', at: T.temp, db: -24},
  {f: 'squish', at: T.goo, db: -19},
  {f: 'clank', at: T.stop, db: -17},
  {f: 'whoosh', at: T.earth - 0.1, db: -22},
  {f: 'pop', at: T.lens, db: -22},
  {f: 'swish', at: T.line, db: -27},
];

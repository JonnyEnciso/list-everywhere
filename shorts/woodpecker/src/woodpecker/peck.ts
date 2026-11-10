import {T, DURATION, ramp, easeIn, easeOut, lerp, clamp} from './time';

export const BACK = -38; // head pulled back (deg, about the neck pivot)
export const REST = -12; // relaxed head
const F1 = 4; // rapid pecks per second (cartoon speed; real woodpeckers peck faster)
const F2 = 2.4; // spring pecks per second
const PH0 = 1.6; // phase at frame 0 (p = 0.6 -> head back, ready)

/** head angle inside one peck cycle; p in [0,1), contact at p = 0 */
const cycle = (p: number) => {
  if (p < 0.08) return 0;
  if (p < 0.5) return BACK * easeOut((p - 0.08) / 0.42);
  if (p < 0.8) return BACK;
  return BACK * (1 - easeIn((p - 0.8) / 0.2));
};
const frac = (x: number) => x - Math.floor(x);

const rapidPhase = (t: number) => t * F1 + PH0;
const lastRapidHit = Math.floor(rapidPhase(T.rapidEnd)) / F1 - PH0 / F1;
const springPhase = (t: number) => (t - T.springPecks) * F2 + 0.5;
const lastSpringHit = (Math.floor(springPhase(T.slow - 0.8)) - 0.5) / F2 + T.springPecks;
const loopPhase = (t: number) => (t - DURATION) * F1 + PH0; // same phase as frame 0 at the end -> seamless loop

export type Hit = {t: number; kind: 'wood' | 'spring' | 'slow'};
export const HITS: Hit[] = [];
for (let k = Math.ceil(PH0); k / F1 - PH0 / F1 <= lastRapidHit + 1e-6; k++) HITS.push({t: k / F1 - PH0 / F1, kind: 'wood'});
for (let k = 1; (k - 0.5) / F2 + T.springPecks <= lastSpringHit + 1e-6; k++)
  HITS.push({t: (k - 0.5) / F2 + T.springPecks, kind: 'spring'});
HITS.push({t: T.slowHit, kind: 'slow'});
for (let k = Math.ceil(loopPhase(T.loop)); k <= Math.floor(loopPhase(DURATION)); k++)
  HITS.push({t: (k - PH0) / F1 + DURATION, kind: 'wood'});

export const headAngle = (t: number): number => {
  if (t >= T.loop) return lerp(REST, cycle(frac(loopPhase(t))), ramp(t, T.loop, T.loop + 0.25));
  if (t <= lastRapidHit) return cycle(frac(rapidPhase(t)));
  if (t < T.springPecks) return lerp(0, REST, ramp(t, lastRapidHit, lastRapidHit + 0.3, easeOut));
  if (t <= lastSpringHit) {
    const c = cycle(frac(springPhase(t)));
    return lerp(REST, c, ramp(t, T.springPecks, T.springPecks + 0.2));
  }
  if (t < T.slow) return lerp(0, BACK, ramp(t, lastSpringHit, lastSpringHit + 0.4, easeOut));
  if (t < T.slowHit) return BACK * (1 - Math.pow(clamp((t - T.slow) / (T.slowHit - T.slow)), 1.4)); // slow motion, even speed
  if (t < T.recOff) return 0; // stopped hard: no bounce, no wobble
  return lerp(0, REST, ramp(t, T.recOff, T.recOff + 0.35));
};

/** time since the latest hit of the given kinds (Infinity if none yet) */
export const sinceHit = (t: number, kinds?: Hit['kind'][]) => {
  let best = Infinity;
  for (const h of HITS) if (h.t <= t && (!kinds || kinds.includes(h.kind))) best = Math.min(best, t - h.t);
  return best;
};

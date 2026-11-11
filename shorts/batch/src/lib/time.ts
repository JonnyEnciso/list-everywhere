export type Timing = {voiceStart: number; voiceEnd: number; voiceFile?: string | null; sentences: {a: number; b: number; text: string}[]};

export const FPS = 60;
export const TAIL = 1.6; // a calm tail after the last word so the ending doesn't feel cut off

/** sentence helpers for one Short: at(i, f) = time at fraction f of sentence i */
export const timeline = (timing: Timing) => {
  const S = timing.sentences;
  return {S, at: (i: number, f: number) => S[i].a + (S[i].b - S[i].a) * f, VOICE_END: timing.voiceEnd,
    DURATION: timing.voiceEnd + TAIL, voiceStart: timing.voiceStart, voiceFile: timing.voiceFile ?? null};
};

// every beat as a constant (see beat sheet in README.md)


export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
export const easeIn = (u: number) => u * u * u;
/** 0 -> 1 between t0 and t1 with easing */
export const ramp = (t: number, t0: number, t1: number, e = easeInOut) => e(clamp((t - t0) / (t1 - t0)));
/** pop-in with overshoot (back-out), 0 before t0, ~1 after t0 + d */
export const pop = (t: number, t0: number, d = 0.28) => {
  const u = clamp((t - t0) / d);
  if (u <= 0) return 0;
  const c = 2.2;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
};
/** damped spring settle after t0: 1 at t0 decaying wobble -> 0 */
export const wobble = (t: number, t0: number, hz = 6, decay = 7) =>
  t < t0 ? 0 : Math.exp(-(t - t0) * decay) * Math.cos((t - t0) * hz * 2 * Math.PI);

/** deterministic random in [0,1) */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

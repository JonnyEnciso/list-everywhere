import timing from './timing.json';

export const FPS = 60;
const S = timing.sentences;

/** time at fraction f of sentence i (0 = first word starts, 1 = last word ends) */
export const at = (i: number, f: number) => S[i].a + (S[i].b - S[i].a) * f;
export const VOICE_START = timing.voiceStart;
export const VOICE_END = timing.voiceEnd;
export const DURATION = VOICE_END + 0.9;

// every beat as a constant (see beat sheet in README.md)
export const T = {
  rapidEnd: S[1].a + 0.3, //        rapid pecking stops as the question starts
  stars: at(1, 0.55), //            "Why no conCUSSion?" dizzy stars pop on
  starsOff: S[2].a + 0.1, //        calm blink, stars pop away
  xray: at(2, 0.33), //             "its SKULL" x-ray lens opens on the head
  springPecks: at(2, 0.45), //      "works like a shock absorber" spring pecks (run on into the next line)
  rec: S[3].a + 0.05, //            "But slow-motion VIDEO" camera viewfinder
  slow: at(3, 0.3), //              "video SHOWS the head" spring pops out, slow-mo strike starts
  slowHit: at(3, 0.92), //          "like a HAMMER" head + hammer hit together
  recOff: S[4].a - 0.05,
  dolly: S[4].a + 0.05, //          "The real trick" camera dives into the head
  size: at(4, 0.85), //             "is SIZE" tiny brain pulses
  cut: S[5].a - 0.05, //            hard cut: woodpecker head vs. big round head
  jolt: at(5, 0.55), //             "the same HIT" both heads stop hard
  pressure: at(5, 0.82), //          "way less PRESSURE" big brain squeezed, small brain calm
  loop: VOICE_END + 0.15, //        cut back to frame-0 shot: pecking again (loops)
};

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

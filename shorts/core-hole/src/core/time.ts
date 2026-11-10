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
  coreEyes: at(0, 0.78), //         "...center of the EARTH" the core opens its eyes and looks up
  smug: S[1].a + 0.05, //           "Easy, right?" smug bounce
  dig: at(1, 0.5), //               "Just keep DIGGING" shovel cycles start
  rig: S[2].a + 0.02, //            "The deepest hole ever DRILLED" drill rig pops up over the hole
  drill: S[2].a + 0.45, //          bit starts down
  twelve: at(2, 0.7), //            "about TWELVE kilometers" depth sign pops
  bitDown: at(2, 0.95), //          bit reaches 12 km
  dive: S[3].a, //                  "Down there" camera dives to the bit
  hot: at(3, 0.28), //              "the rock was" glow builds
  temp: at(3, 0.42), //             "around a HUNDRED EIGHTY degrees" thermometer pops
  goo: at(3, 0.8), //               "and acted like PLASTIC" rock goes gooey, grows a face, grabs the bit
  stop: S[4].a, //                  "So the drilling STOPPED" camera back to the rig, motor dies, sweat
  earth: at(4, 0.32), //            "about a fifth..." cut to true-scale Earth (pull back)
  lens: at(4, 0.48), //             magnifier on the tiny hole
  line: at(4, 0.62), //             dashed line to the center grows
  there: at(4, 0.95), //            "of the way THERE" core smirks
  loop: VOICE_END + 0.15, //        cut back to the frame-0 shot (loops)
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

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {FPS, DURATION, T, at, clamp, lerp, ramp, pop, wobble, easeOut, easeIn, easeInOut, rnd} from './time';
import {HITS, headAngle, sinceHit} from './peck';
import {Bird, Brain, Hammer, INK, RoundHead, Star, W, HEAD, BEAK_TIP, Pillow} from './parts';
import {CUES} from './sfx';

export {DURATION, FPS};
const VOICE = (timing as {voiceFile?: string | null}).voiceFile;

// ------------------------------------------------------------------------------------------------ world layout
const TRUNK = {x: 640, w: 300};
const BIRD = {x: 640, y: 1060, s: 1.55};
const toWorld = (p: {x: number; y: number}) => ({x: BIRD.x + p.x * BIRD.s, y: BIRD.y + p.y * BIRD.s});
const HIT_PT = toWorld(BEAK_TIP); // where the beak meets the bark
const HEAD_W = toWorld(HEAD);
const NAIL = {x: TRUNK.x + TRUNK.w, y: HIT_PT.y};
const HAMMER_PIVOT = {x: NAIL.x + 45 + 60, y: NAIL.y + 231};
const CMP = {cx: 2950, bird: {x: 2605 + 112 * 2.2, y: 900 + 130 * 2.2, s: 2.2}, human: {x: 3182, y: 900, r: 262}};

// ------------------------------------------------------------------------------------------------ camera
type Cam = {x: number; y: number; z: number};
const START: Cam = {x: 545, y: 930, z: 140};
const MOVES: {t0: number; t1: number; to: Cam; cut?: boolean}[] = [
  {t0: at(1, 0) - 0.15, t1: at(1, 0.55), to: {x: 505, y: 875, z: 300}},
  {t0: T.xray - 0.3, t1: T.xray + 0.5, to: {x: HEAD_W.x + 4, y: HEAD_W.y + 6, z: 440}},
  {t0: T.rec - 0.1, t1: T.rec + 0.75, to: {x: 665, y: 900, z: 165}},
  {t0: T.recOff, t1: T.recOff + 0.55, to: {x: 540, y: 905, z: 260}},
  {t0: T.dolly, t1: T.size - 0.08, to: {x: HEAD_W.x - 28, y: HEAD_W.y - 6, z: 730}},
  {t0: T.cut, t1: T.cut, to: {x: CMP.cx, y: 960, z: 0}, cut: true},
  {t0: T.cut + 0.2, t1: T.outro - 0.1, to: {x: CMP.cx, y: 950, z: 60}},
  {t0: T.outro, t1: T.outro, to: {x: HEAD_W.x + 30, y: HEAD_W.y + 60, z: 330}, cut: true},
  {t0: T.safe - 0.2, t1: DURATION - 0.35, to: START},
];
const kOf = (z: number) => 1000 / (1000 - z);
const camAt = (t: number): Cam => {
  let c = START;
  for (const m of MOVES) {
    if (t < m.t0) break;
    if (m.cut || t >= m.t1) { c = m.to; continue; }
    const u = easeInOut((t - m.t0) / (m.t1 - m.t0));
    const k = Math.exp(lerp(Math.log(kOf(c.z)), Math.log(kOf(m.to.z)), u)); // even zoom: scale in log space
    c = {x: lerp(c.x, m.to.x, u), y: lerp(c.y, m.to.y, u), z: 1000 - 1000 / k};
    break;
  }
  return c;
};

/** screen shake: sums of sines times an envelope */
const shakeAt = (t: number) => {
  let a = 0;
  const wood = sinceHit(t, ['wood']);
  if (wood < 0.12) a += 5 * (1 - wood / 0.12);
  const slow = t - T.slowHit;
  if (slow >= 0 && slow < 0.5) a += 16 * Math.exp(-slow * 9);
  const jolt = t - T.jolt;
  if (jolt >= 0 && jolt < 0.5) a += 18 * Math.exp(-jolt * 9);
  return {x: a * (Math.sin(t * 2 * Math.PI * 13.3) * 0.6 + Math.sin(t * 2 * Math.PI * 7.1) * 0.4),
    y: a * (Math.sin(t * 2 * Math.PI * 11.7 + 1) * 0.6 + Math.sin(t * 2 * Math.PI * 5.3) * 0.4)};
};

const Layer: React.FC<{cam: Cam; z: number; minDepth?: number; children: React.ReactNode}> = ({cam, z, minDepth = 250, children}) => {
  const d = z - cam.z;
  if (d < minDepth) return null;
  const k = 1000 / d;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(540 960) scale(${k}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ set pieces
const Trunk: React.FC<{holes: number}> = ({holes}) => {
  const {x, w} = TRUNK;
  return (
    <g>
      <rect x={x} y={-3000} width={w} height={8000} fill="#A86B3C" />
      <rect x={x} y={-3000} width={58} height={8000} fill="#93592F" />
      {[[x + 92, -600, 900], [x + 170, 200, 1500], [x + 236, -1400, 1300], [x + 120, 1350, 1200], [x + 210, 1750, 1300]].map(([bx, by, bh], i) => (
        <path key={i} d={`M${bx} ${by} q 12 ${bh * 0.25} -4 ${bh * 0.5} t 6 ${bh * 0.5}`} fill="none" stroke="#7A4626" strokeWidth={9} strokeLinecap="round" />
      ))}
      <ellipse cx={x + 190} cy={560} rx={28} ry={40} fill="#7A4626" stroke={INK} strokeWidth={8} />
      <ellipse cx={x + 110} cy={1500} rx={22} ry={30} fill="#7A4626" stroke={INK} strokeWidth={8} />
      <line x1={x} y1={-3000} x2={x} y2={5000} stroke={INK} strokeWidth={11} />
      <line x1={x + w} y1={-3000} x2={x + w} y2={5000} stroke={INK} strokeWidth={11} />
      {holes > 0 && (
        <ellipse cx={HIT_PT.x - 2} cy={HIT_PT.y} rx={7 + Math.min(holes, 10) * 1.2} ry={9 + Math.min(holes, 10) * 1.4} fill="#3D2414" />
      )}
    </g>
  );
};

const Hills: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-5000 2150 Q -2600 1720 -400 2050 Q 1400 1780 3200 2060 Q 5200 1740 7400 2050 Q 9500 1820 12000 2100 L 12000 6000 L -5000 6000 Z"
      fill="#8FD07A" stroke={INK} strokeWidth={14} />
    <path d="M-5000 2350 Q -1500 2120 1500 2320 Q 4500 2100 8000 2330 Q 10500 2200 12000 2320 L 12000 6000 L -5000 6000 Z" fill="#7BC266" />
  </g>
);

const FarTrees: React.FC = () => (
  <g strokeLinejoin="round">
    {[-1700, -900, -100, 1300, 2000, 2700, 3500, 4300, 5200, 6000].map((x, i) => {
      const h = 520 + rnd(i) * 360, r = 190 + rnd(i + 9) * 90;
      return (
        <g key={i}>
          <rect x={x - 26} y={1830 - h} width={52} height={h} fill="#8E5E3A" stroke={INK} strokeWidth={10} />
          <circle cx={x} cy={1830 - h} r={r} fill={i % 2 ? '#5DB35A' : '#69BE5E'} stroke={INK} strokeWidth={10} />
          <circle cx={x - r * 0.35} cy={1830 - h - r * 0.3} r={r * 0.32} fill="#7FCC70" />
        </g>
      );
    })}
  </g>
);

const Leaves: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-400 120 Q 0 260 330 230" fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" />
    <path d="M-400 120 Q 0 260 330 230" fill="none" stroke="#7A4626" strokeWidth={16} strokeLinecap="round" />
    {[[60, 170, 20], [170, 260, -30], [250, 190, 40], [-60, 120, -10], [-150, 210, 25]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <path d="M0 0 Q 70 -60 150 0 Q 70 60 0 0 Z" fill={i % 2 ? '#4FA94D' : '#5DB85A'} stroke={INK} strokeWidth={10} />
        <path d="M10 0 L 130 0" stroke="#3E8E3C" strokeWidth={6} />
      </g>
    ))}
  </g>
);

// ------------------------------------------------------------------------------------------------ effects
const Chips: React.FC<{t: number}> = ({t}) => (
  <g strokeLinejoin="round">
    {HITS.filter((h) => t >= h.t && t < h.t + 1.6).flatMap((h, hi) => {
      const n = h.kind === 'slow' ? 7 : 3;
      const slowmo = h.kind === 'slow' ? 0.45 : 1;
      return Array.from({length: n}, (_, j) => {
        const seed = Math.round(h.t * 1000) + j * 17;
        const s = (t - h.t) * slowmo;
        const life = 0.9;
        if (s > life) return null;
        const vx = -(220 + rnd(seed) * 380), vy = -(120 + rnd(seed + 3) * 420);
        const x = HIT_PT.x - 8 + vx * s, y = HIT_PT.y + vy * s + 0.5 * 1500 * s * s;
        const sc = s < life - 0.25 ? 1 : (life - s) / 0.25;
        const sz = 9 + rnd(seed + 5) * 9;
        return (
          <g key={`${hi}-${j}`} transform={`translate(${x} ${y}) rotate(${s * (500 + rnd(seed + 7) * 600)}) scale(${sc})`}>
            <path d={`M${-sz} ${-sz * 0.4} L ${sz * 0.8} ${-sz * 0.6} L ${sz} ${sz * 0.5} L ${-sz * 0.6} ${sz * 0.6} Z`}
              fill={j % 2 ? '#C98A54' : '#E0A56B'} stroke={INK} strokeWidth={4} />
          </g>
        );
      });
    })}
  </g>
);

const ImpactLines: React.FC<{x: number; y: number; t: number; t0: number; dir?: number; scale?: number}> = ({x, y, t, t0, dir = -1, scale = 1}) => {
  const s = t - t0;
  if (s < 0 || s > 0.35) return null;
  const u = s / 0.35;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={INK} strokeWidth={7} strokeLinecap="round">
      {[-50, -20, 10, 40].map((a, i) => {
        const r0 = 40 + 50 * easeOut(u), r1 = r0 + 40 * (1 - u);
        const rad = ((dir < 0 ? 180 : 0) + a) * (Math.PI / 180);
        return <line key={i} x1={Math.cos(rad) * r0} y1={Math.sin(rad) * r0} x2={Math.cos(rad) * r1} y2={Math.sin(rad) * r1} />;
      })}
    </g>
  );
};

const DizzyStars: React.FC<{t: number; front: boolean}> = ({t, front}) => {
  const on = pop(t, T.stars) * (1 - ramp(t, T.starsOff, T.starsOff + 0.22, easeIn));
  if (on <= 0.001) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const a = t * 4.2 + (i * 2 * Math.PI) / 3;
        if ((Math.sin(a) > 0) !== front) return null;
        const sc = pop(t, T.stars + i * 0.07) * (1 - ramp(t, T.starsOff + i * 0.04, T.starsOff + 0.2 + i * 0.04, easeIn));
        return (
          <g key={i} transform={`translate(${HEAD_W.x + Math.cos(a) * 125} ${HEAD_W.y - 112 + Math.sin(a) * 30}) scale(${sc})`}>
            <Star r={24} />
          </g>
        );
      })}
    </g>
  );
};

const HammerRig: React.FC<{t: number}> = ({t}) => {
  if (t < T.slow - 0.3 || t > T.recOff + 0.4) return null;
  const back = 42;
  let a = back;
  if (t >= T.slow) a = back * (1 - Math.pow(clamp((t - T.slow) / (T.slowHit - T.slow)), 1.4));
  if (t > T.recOff) a = lerp(0, 75, ramp(t, T.recOff, T.recOff + 0.4, easeIn)); // swings away out of frame
  return (
    <g>
      <g transform={`translate(${HAMMER_PIVOT.x} ${HAMMER_PIVOT.y}) rotate(${a})`}><Hammer /></g>
    </g>
  );
};

const Nail: React.FC<{t: number}> = ({t}) => {
  const sunk = t >= T.slowHit ? 26 : 0;
  const on = pop(t, T.rec + 0.5) * (1 - ramp(t, T.recOff + 0.2, T.recOff + 0.4, easeIn));
  if (on <= 0.001) return null;
  return (
    <g transform={`translate(${NAIL.x} ${NAIL.y}) scale(${on}) translate(${-NAIL.x} ${-NAIL.y})`}>
      <rect x={NAIL.x - 4} y={NAIL.y - 5} width={46 - sunk} height={10} fill="#B9C2CC" stroke={INK} strokeWidth={5} />
      <rect x={NAIL.x + 40 - sunk} y={NAIL.y - 17} width={9} height={34} rx={3} fill="#B9C2CC" stroke={INK} strokeWidth={5} />
    </g>
  );
};

const Viewfinder: React.FC<{t: number}> = ({t}) => {
  const on = pop(t, T.rec, 0.25) * (1 - ramp(t, T.recOff - 0.1, T.recOff + 0.1, easeIn));
  if (on <= 0.001) return null;
  const m = 70, L = 120;
  const corner = (x: number, y: number, sx: number, sy: number) => `M${x} ${y + sy * L} L ${x} ${y} L ${x + sx * L} ${y}`;
  const blink = Math.floor((t - T.rec) * 2) % 2 === 0;
  return (
    <AbsoluteFill style={{opacity: Math.min(1, on), transform: `scale(${1.04 - 0.04 * Math.min(1, on)})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {[corner(m, m + 60, 1, 1), corner(1080 - m, m + 60, -1, 1), corner(m, 1920 - m - 60, 1, -1), corner(1080 - m, 1920 - m - 60, -1, -1)].map((d, i) => (
            <g key={i}><path d={d} stroke={INK} strokeWidth={22} /><path d={d} stroke="#fff" strokeWidth={10} /></g>
          ))}
        </g>
        {blink && <circle cx={m + 50} cy={m + 130} r={20} fill="#FF3B3B" stroke={INK} strokeWidth={6} />}
        <text x={m + 88} y={m + 147} fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={50} fill="#fff"
          stroke={INK} strokeWidth={10} paintOrder="stroke">REC</text>
      </svg>
    </AbsoluteFill>
  );
};

/** the pillow thrown off the beak: a real projectile with gravity and spin */
const FlyingPillow: React.FC<{t: number}> = ({t}) => {
  const s = t - (T.shake + 0.25);
  if (s < 0 || s > 1.4) return null;
  const x = HIT_PT.x - 30 - 520 * s, y = HIT_PT.y - 760 * s + 0.5 * 2200 * s * s;
  return (
    <g transform={`translate(${x} ${y}) rotate(${-420 * s}) scale(${BIRD.s})`}><Pillow w={78} h={92} /></g>
  );
};

// ------------------------------------------------------------------------------------------------ comparison shot
const Comparison: React.FC<{t: number}> = ({t}) => {
  // both heads glide right and then stop hard on the same frame (the same jolt)
  const dx = -50 * (1 - ramp(t, T.jolt - 0.22, T.jolt, (u) => u));
  const p = clamp((t - T.pressure) / 0.4);
  const bigSquash = 1 - 0.2 * wobble(t, T.jolt, 4, 4.5);
  const smallSquash = 1 - 0.06 * wobble(t, T.jolt, 6, 8);
  const {bird, human} = CMP;
  const hb = toLocal(bird);
  return (
    <g>
      {/* woodpecker head (small brain) */}
      <g transform={`translate(${bird.x + dx} ${bird.y}) scale(${bird.s})`}>
        <Bird angle={0} headOnly xray={1} xrayContent="brain" brow="calm" lookX={0.2}
          brainPulse={t > T.pressure ? 0.15 * Math.max(0, wobble(t, T.pressure, 2, 3)) : 0} brainR={12}
          brainSquash={smallSquash} />
      </g>
      <ImpactLines x={bird.x + 18 + dx} y={hb.y} t={t} t0={T.jolt} dir={1} scale={0.9} />
      {/* big round head (big brain) */}
      <g transform={`translate(${human.x + dx} ${human.y})`}>
        <RoundHead r={human.r} />
        <circle cx={0} cy={0} r={human.r - 16} fill="#1E3557" />
        <circle cx={0} cy={0} r={human.r - 16} fill="none" stroke="#BFE3FF" strokeWidth={8} />
        {t > T.pressure && [0, 1, 2].map((i) => {
          const ph = ((t - T.pressure) * 1.6 + i / 3) % 1;
          return <circle key={i} cx={0} cy={0} r={lerp(235, 205, ph)} fill="none" stroke="#FF5A5A" strokeWidth={10 * (1 - ph)} opacity={Math.min(1, p * 2)} />;
        })}
        <g transform={`scale(${bigSquash} 1)`}>
          <Brain r={168} mood={t > T.pressure ? 'worried' : 'none'} sweat={t > T.pressure + 0.25 ? clamp((t - T.pressure - 0.25) / 1.2) : 0} ink={W * 0.45} />
        </g>
        <circle cx={0} cy={0} r={human.r} fill="none" stroke={INK} strokeWidth={W * 1.6} />
      </g>
      <ImpactLines x={human.x + human.r + 10 + dx} y={human.y} t={t} t0={T.jolt} dir={1} scale={1.6} />
    </g>
  );
};
const toLocal = (b: {x: number; y: number; s: number}) => ({x: b.x + (-124) * b.s, y: b.y + (-132) * b.s});

// ------------------------------------------------------------------------------------------------ main
export const Woodpecker: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const base = camAt(t);
  const sh = shakeAt(t);
  const cam = {...base, x: base.x - sh.x / kOf(base.z), y: base.y - sh.y / kOf(base.z)};
  const comparison = t >= T.cut && t < T.outro;

  // bird state
  const springHit = sinceHit(t, ['spring']);
  let angle = headAngle(t);
  if (t < T.slow && springHit < 1) angle += 7 * wobble(t, t - springHit, 4.5, 5); // the "shock absorber" bounce
  const xray = t >= T.outro ? pop(t, T.birdBrain, 0.35) * (1 - ramp(t, T.safe, T.safe + 0.25, easeIn)) : t < T.xray ? 0 : t < T.recOff ? pop(t, T.xray, 0.35) * 1
    : t < T.dolly ? 1 - ramp(t, T.recOff, T.recOff + 0.25, easeIn) : ramp(t, T.dolly + 0.25, T.dolly + 0.65, easeOut);
  const blinkAt = [T.starsOff, T.recOff + 0.5, T.size + 0.6, 2.2, T.outro + 0.35];
  let blink = 0;
  for (const b of blinkAt) { const s = t - b; if (s >= 0 && s < 0.16) blink = Math.max(blink, 1 - Math.abs(s - 0.08) / 0.08); }
  const brow: 'focus' | 'calm' | 'annoyed' =
    t >= T.slowHit + 0.15 && t < T.recOff ? 'annoyed' : (t >= T.starsOff - 0.1 && t < T.springPecks) || (t >= T.dolly + 0.4 && t < T.loop) ? 'calm' : 'focus';
  if (t >= T.shake - 0.3 && t < T.shake + 0.6) angle += 9 * Math.sin((t - T.shake + 0.3) * 2 * Math.PI * 4) * (1 - ramp(t, T.shake + 0.2, T.shake + 0.6)); // "no thanks" head shake
  const pillow = t >= T.cushion && t < T.shake + 0.25 ? pop(t, T.cushion, 0.3) : 0;
  const lookX = t >= at(1, 0.2) && t < T.springPecks ? 0 : 0.3;
  const springLen = 1 - (springHit < 1 && t < T.slow ? 0.55 * Math.exp(-springHit * 9) : 0);
  const holes = HITS.filter((h) => h.t <= t).length;
  const brainPulse = t >= T.birdBrain ? Math.max(0, wobble(t, T.birdBrain, 2.5, 3)) : t >= T.size ? Math.max(0, wobble(t, T.size, 2.5, 4)) : 0;

  return (
    <AbsoluteFill style={{background: 'linear-gradient(#8ED2FF 0%, #C8ECFF 62%, #E6F7FF 100%)'}}>
      <Layer cam={cam} z={3000}><Hills /></Layer>
      {!comparison && <Layer cam={cam} z={1800}><FarTrees /></Layer>}
      <Layer cam={cam} z={1000} minDepth={60}>
        {!comparison && (
          <g>
            <Trunk holes={holes} />
            <Nail t={t} />
            <DizzyStars t={t} front={false} />
            <g transform={`translate(${BIRD.x} ${BIRD.y}) scale(${BIRD.s})`}>
              <Bird angle={angle} lookX={lookX} blink={blink} brow={brow} xray={xray}
                xrayContent={t < T.recOff + 0.3 ? 'spring' : 'brain'} springLen={springLen}
                springOut={t >= T.slow ? t - T.slow : -1} brainPulse={brainPulse} pillow={pillow} />
            </g>
            <DizzyStars t={t} front />
            <HammerRig t={t} />
            <Chips t={t} />
            <FlyingPillow t={t} />
            <ImpactLines x={HIT_PT.x - 10} y={HIT_PT.y} t={t} t0={T.slowHit} dir={-1} scale={1.3} />
            <ImpactLines x={NAIL.x + 50} y={NAIL.y} t={t} t0={T.slowHit} dir={1} scale={1.3} />
          </g>
        )}
        {comparison && <Comparison t={t} />}
      </Layer>
      {!comparison && <Layer cam={cam} z={650}><Leaves /></Layer>}
      <Viewfinder t={t} />
      {VOICE && (
        <Sequence from={Math.round(timing.voiceStart * FPS)} layout="none">
          <Audio src={staticFile(VOICE)} />
        </Sequence>
      )}
      {CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.at * FPS))} layout="none">
          <Audio src={staticFile(`woodpecker/sfx/${c.f}.wav`)} volume={10 ** (c.db / 20)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

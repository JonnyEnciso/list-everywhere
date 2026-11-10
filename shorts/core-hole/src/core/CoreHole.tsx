import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {FPS, DURATION, T, at, clamp, lerp, ramp, pop, wobble, easeOut, easeIn, easeInOut, rnd} from './time';
import {BlobFace, Guy, INK, Label, Pipe, Puffs, Rig, ShovelPose, Thermo, W} from './parts';
import {CUES, DIG} from './sfx';

export {DURATION, FPS};
const VOICE = (timing as {voiceFile?: string | null}).voiceFile;

// ------------------------------------------------------------------------------------------------ world layout
const GROUND = 640;
const GUY = {x: 330, y: GROUND, s: 1.2};
const HX = 560; // hole / bore centre
const CRUST_END = 1180;
const BIT_END = GROUND + 0.34 * (CRUST_END - GROUND); // ~12 of ~35 km of continental crust
const CORE = {x: 540, y: 1990, r: 360};
const THERMO = {x: 715, y: 765};

// ------------------------------------------------------------------------------------------------ digging
const SHOVEL_IDLE: ShovelPose = {tipX: 112, tipY: 0, ang: 95};
const DIG_KEYS: [number, ShovelPose][] = [
  [0, {tipX: 150, tipY: -70, ang: 75}],
  [0.3, {tipX: 160, tipY: 34, ang: 80}],
  [0.45, {tipX: 150, tipY: 10, ang: 58}],
  [0.72, {tipX: -60, tipY: -222, ang: -150}],
  [1, {tipX: 150, tipY: -70, ang: 75}],
];
const lerpPose = (a: ShovelPose, b: ShovelPose, u: number): ShovelPose => ({
  tipX: lerp(a.tipX, b.tipX, u), tipY: lerp(a.tipY, b.tipY, u), ang: lerp(a.ang, b.ang, u)});
const digPose = (p: number): ShovelPose => {
  for (let i = 0; i < DIG_KEYS.length - 1; i++) {
    const [p0, a] = DIG_KEYS[i], [p1, b] = DIG_KEYS[i + 1];
    if (p <= p1) return lerpPose(a, b, easeInOut((p - p0) / (p1 - p0)));
  }
  return DIG_KEYS[0][1];
};

// ------------------------------------------------------------------------------------------------ camera
type Cam = {x: number; y: number; z: number};
const START: Cam = {x: 540, y: 960, z: 0};
const MOVES: {t0: number; t1: number; to: Cam; cut?: boolean}[] = [
  {t0: T.rig - 0.1, t1: T.drill + 0.35, to: {x: 560, y: 770, z: 220}},
  {t0: T.dive, t1: T.dive + 0.9, to: {x: 618, y: 895, z: 660}},
  {t0: T.stop, t1: T.stop + 0.6, to: {x: 520, y: 660, z: 300}},
  {t0: T.loop, t1: T.loop, to: START, cut: true},
];
const kOf = (z: number) => 1000 / (1000 - z);
const camAt = (t: number): Cam => {
  let c = START;
  for (const m of MOVES) {
    if (t < m.t0) break;
    if (m.cut || t >= m.t1) { c = m.to; continue; }
    const u = easeInOut((t - m.t0) / (m.t1 - m.t0));
    const k = Math.exp(lerp(Math.log(kOf(c.z)), Math.log(kOf(m.to.z)), u));
    c = {x: lerp(c.x, m.to.x, u), y: lerp(c.y, m.to.y, u), z: 1000 - 1000 / k};
    break;
  }
  return c;
};

const Layer: React.FC<{cam: Cam; z: number; blur?: number; children: React.ReactNode}> = ({cam, z, blur = 0, children}) => {
  const d = z - cam.z;
  if (d < 60) return null;
  const k = 1000 / d;
  return (
    <AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined}}>
      <svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(540 960) scale(${k}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ set pieces
const wavy = (y: number, amp: number, seed: number, x0 = -2500, x1 = 3500) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x <= x1; x += 120) d += ` L${x} ${(y + Math.sin(x * 0.011 + seed) * amp + Math.sin(x * 0.027 + seed * 2) * amp * 0.5).toFixed(1)}`;
  return d;
};
const Ground: React.FC<{coreOpen: number; coreLook: number; coreMood: 'sleep' | 'smile'}> = ({coreOpen, coreLook, coreMood}) => (
  <g strokeLinejoin="round">
    {/* crust */}
    <rect x={-2500} y={GROUND} width={6000} height={3000} fill="#B48A62" />
    <path d={wavy(GROUND + 230, 14, 1) + ' L 3500 3000 L -2500 3000 Z'} fill="#A47A55" />
    {[[180, 760, 30], [760, 720, 22], [880, 960, 34], [140, 1040, 26], [640, 1080, 18], [330, 920, 16], [980, 1110, 24]].map(([x, y, r], i) => (
      <ellipse key={i} cx={x} cy={y} rx={r * 1.4} ry={r} fill="#8E6A4B" stroke={INK} strokeWidth={6} />
    ))}
    {/* mantle */}
    <path d={wavy(CRUST_END, 22, 3) + ' L 3500 3200 L -2500 3200 Z'} fill="#F2913D" stroke={INK} strokeWidth={W} />
    <path d={wavy(CRUST_END + 160, 30, 5) } fill="none" stroke="#F7AE5E" strokeWidth={26} strokeLinecap="round" />
    <path d={wavy(CRUST_END + 330, 26, 7) } fill="none" stroke="#E57B2C" strokeWidth={20} strokeLinecap="round" />
    {/* core */}
    <circle cx={CORE.x} cy={CORE.y} r={CORE.r + 70} fill="#FFB547" opacity={0.45} />
    <circle cx={CORE.x} cy={CORE.y} r={CORE.r} fill="#FFD25A" stroke={INK} strokeWidth={W} />
    <circle cx={CORE.x - 120} cy={CORE.y - 230} r={40} fill="#FFE59A" />
    <g transform={`translate(${CORE.x} ${CORE.y - 215})`}>
      <BlobFace r={240} open={coreOpen} lookY={coreLook} mood={coreMood} />
    </g>
    {/* grass top */}
    <path d={`M-2500 ${GROUND} L 3500 ${GROUND}`} stroke={INK} strokeWidth={W} />
    <rect x={-2500} y={GROUND - 26} width={6000} height={26} fill="#7BC266" />
    <path d={`M-2500 ${GROUND - 26} L 3500 ${GROUND - 26}`} stroke={INK} strokeWidth={W} />
  </g>
);

const Hills: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-4000 -40 Q -2000 -330 -300 -90 Q 1200 -360 2600 -80 Q 4200 -330 6000 -60 L 6000 3000 L -4000 3000 Z"
      fill="#A8DC92" stroke={INK} strokeWidth={14} />
  </g>
);
const Clouds: React.FC = () => (
  <g>
    {[[-200, 120, 1], [900, 40, 0.8], [1700, 180, 1.1]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <Puffs fill="#fff" items={[{x: -70, y: 10, r: 52}, {x: 0, y: -20, r: 70}, {x: 80, y: 8, r: 54}, {x: 10, y: 30, r: 50}]} />
      </g>
    ))}
  </g>
);

// ------------------------------------------------------------------------------------------------ true-scale Earth (screen space)
const EARTH = {x: 540, y: 1150, R: 440};
const TOP = {x: EARTH.x, y: EARTH.y - EARTH.R};
const LENS = {x: 790, y: 420, r: 175};
const EarthShot: React.FC<{t: number}> = ({t}) => {
  const s = Math.exp(lerp(Math.log(10), 0, ramp(t, T.earth, T.earth + 0.75, easeOut)));
  const lens = pop(t, T.lens, 0.3);
  const line = ramp(t, T.line, T.line + 0.7, easeInOut);
  const coreR = EARTH.R * 0.19;
  return (
    <AbsoluteFill style={{background: '#14203A'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 46}, (_, i) => (
          <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 50) * 1920} r={1.5 + rnd(i + 99) * 3} fill="#fff" opacity={0.35 + 0.5 * rnd(i + 7)} />
        ))}
        <g transform={`translate(${TOP.x} ${TOP.y}) scale(${s}) translate(${-TOP.x} ${-TOP.y})`} strokeLinejoin="round">
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.R} fill="#F2913D" stroke={INK} strokeWidth={W * 1.2} />
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.R - 5} fill="none" stroke="#8E6A4B" strokeWidth={5} />
          <circle cx={EARTH.x} cy={EARTH.y} r={EARTH.R * 0.546} fill="#FFB547" stroke={INK} strokeWidth={W} />
          <circle cx={EARTH.x} cy={EARTH.y} r={coreR} fill="#FFD25A" stroke={INK} strokeWidth={W} />
          <g transform={`translate(${EARTH.x} ${EARTH.y + coreR * 0.1})`}>
            <BlobFace r={coreR} open={1} lookY={-1} lookX={0} mood={t >= T.there ? 'smirk' : 'o'} />
          </g>
          {/* "you are here" pin */}
          <path d={`M${TOP.x} ${TOP.y} l -14 -34 a 15 15 0 1 1 28 0 Z`} fill="#FF4B3E" stroke={INK} strokeWidth={6} />
          <circle cx={TOP.x} cy={TOP.y - 40} r={5} fill="#fff" />
        </g>
        {line > 0 && (
          <g>
            <line x1={TOP.x} y1={TOP.y + 4} x2={TOP.x} y2={TOP.y + 4 + (EARTH.R - coreR - 10) * line} stroke="#fff" strokeWidth={8} strokeDasharray="22 16" strokeLinecap="round" />
            {line > 0.95 && <g transform={`translate(${TOP.x + 24} ${TOP.y + 230}) scale(${pop(t, T.line + 0.68, 0.25)})`}><Label x={0} y={0} text="6,371 km" size={58} /></g>}
          </g>
        )}
        {lens > 0.001 && (
          <g>
            <line x1={TOP.x + 6} y1={TOP.y - 6} x2={LENS.x - LENS.r * 0.72 * lens} y2={LENS.y + LENS.r * 0.72 * lens} stroke="#fff" strokeWidth={6} />
            <g transform={`translate(${LENS.x} ${LENS.y}) scale(${lens})`}>
              <defs><clipPath id="lens-clip"><circle cx={0} cy={0} r={LENS.r} /></clipPath></defs>
              <g clipPath="url(#lens-clip)">
                <rect x={-LENS.r} y={-LENS.r} width={LENS.r * 2} height={LENS.r * 2} fill="#8ED2FF" />
                <rect x={-LENS.r} y={-30} width={LENS.r * 2} height={LENS.r * 2} fill="#B48A62" />
                <rect x={-LENS.r} y={-42} width={LENS.r * 2} height={12} fill="#7BC266" />
                <line x1={-LENS.r} y1={-30} x2={LENS.r} y2={-30} stroke={INK} strokeWidth={5} />
                <line x1={-LENS.r} y1={-42} x2={LENS.r} y2={-42} stroke={INK} strokeWidth={5} />
                <g transform="translate(-20 -42) scale(0.22)"><Rig spin={0} /></g>
                <line x1={-20} y1={-30} x2={-20} y2={40} stroke={INK} strokeWidth={8} strokeLinecap="round" />
                <Label x={2} y={30} text="12 km" size={40} />
              </g>
              <circle cx={0} cy={0} r={LENS.r} fill="none" stroke={INK} strokeWidth={22} />
              <circle cx={0} cy={0} r={LENS.r} fill="none" stroke="#C3CCD5" strokeWidth={10} />
              <g transform={`rotate(45) translate(${LENS.r + 10} 0)`}>
                <rect x={0} y={-20} width={120} height={40} rx={18} fill="#C98A4B" stroke={INK} strokeWidth={W} />
              </g>
            </g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ main
export const CoreHole: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = frame / FPS; // real time (audio, breathing)
  const looped = tr >= T.loop;
  const t = looped ? 0 : tr; // the end shows frame 0 again so the Short loops
  const cam0 = camAt(tr);

  if (!looped && tr >= T.earth) {
    return (
      <AbsoluteFill>
        <EarthShot t={tr} />
        <SoundLayer />
      </AbsoluteFill>
    );
  }

  // shake: rig pop, stop clunk
  let amp = 0;
  if (t >= T.rig && t < T.rig + 0.4) amp += 10 * Math.exp(-(t - T.rig) * 10);
  if (t >= T.drill && t < T.stop) amp += 2.2;
  if (t >= T.stop && t < T.stop + 0.5) amp += 9 * Math.exp(-(t - T.stop) * 8);
  const k0 = kOf(cam0.z);
  const cam = {...cam0, x: cam0.x - (amp * Math.sin(tr * 83.6)) / k0, y: cam0.y - (amp * Math.sin(tr * 61.3 + 1)) / k0};

  // guy
  const digging = t >= T.dig && t < T.rig;
  const digPhase = (t - T.dig) * DIG.hz;
  let shovel = SHOVEL_IDLE;
  if (digging) {
    const p = digPhase - Math.floor(digPhase);
    const intro = ramp(t, T.dig, T.dig + 0.18);
    shovel = lerpPose(SHOVEL_IDLE, digPose(p), intro);
  }
  const digsDone = t < T.dig ? 0 : Math.min(Math.floor((Math.min(t, T.rig) - T.dig) * DIG.hz + 0.62), DIG.count);
  const face = t >= T.stop + 0.1 ? 'worried' : t >= T.smug && t < T.dig ? 'smug' : 'smile';
  const squash = 1 - 0.06 * wobble(t, T.smug, 3, 6) - 0.05 * wobble(t, T.rig, 4, 7);
  const sweat = t >= T.stop + 0.2 ? clamp((t - T.stop - 0.2) / 1.3) : 0;
  const blink = [1.6, T.rig + 0.9, T.dive - 0.4].some((b) => t >= b && t < b + 0.12) ? 1 : 0;

  // core face
  const coreOpen = t < T.coreEyes ? 0 : pop(t, T.coreEyes, 0.3);
  // drilling
  const rigOn = t >= T.rig ? pop(t, T.rig, 0.32) : 0;
  const spinSpeed = 14;
  const spin = t < T.drill ? 0 : t < T.stop ? (t - T.drill) * spinSpeed
    : (T.stop - T.drill) * spinSpeed + (spinSpeed * (1 - Math.exp(-(t - T.stop) * 3))) / 3;
  const prog = ramp(t, T.drill, T.bitDown, (u) => u);
  const bitY = lerp(GROUND + 8, BIT_END, prog);
  const gooR = t < T.goo ? 0 : 66 * pop(t, T.goo, 0.4) * (1 + 0.05 * Math.sin(tr * 7));
  const bend = t < T.goo ? 0 : 0.8 * ramp(t, T.goo, T.goo + 0.4) + 0.25 * wobble(t, T.goo, 3, 3);
  const heat = ramp(t, T.hot, T.temp + 0.6);
  const thermo = t < T.temp ? 0 : pop(t, T.temp, 0.3);
  const thermoFill = lerp(0.25, 0.9, ramp(t, T.temp + 0.15, T.temp + 0.9, easeOut));

  // steam from the bore mouth, smoke from the motor (grow, drift, shrink away)
  const puff = (t0: number, t1: number, x: number, y: number, n: number, rise: number, spread: number, seed: number, rMax: number) =>
    Array.from({length: n}, (_, i) => {
      const born = t0 + (i / n) * (t1 - t0);
      const s = t - born;
      const life = 1.1 + rnd(seed + i) * 0.5;
      if (s < 0 || s > life) return null;
      const u = s / life;
      return {x: x + (rnd(seed + i * 3) - 0.5) * spread + u * 30, y: y - rise * easeOut(u), r: rMax * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 1};
    }).filter(Boolean) as {x: number; y: number; r: number}[];
  const steam = puff(T.hot, T.earth, HX, GROUND - 20, 12, 260, 60, 11, 34);
  const smoke = puff(T.stop + 0.05, T.stop + 1.1, HX + 111, GROUND - 92, 6, 220, 40, 31, 40);

  // dirt clumps: thrown back at p = 0.62 of each dig, land behind the guy, pile grows
  const clumps: React.ReactNode[] = [];
  for (let k = 0; k < DIG.count; k++) {
    const t0 = T.dig + (k + 0.62) / DIG.hz;
    const s = t - t0;
    if (s < 0 || s > 1.2) continue;
    for (let j = 0; j < 3; j++) {
      const seed = k * 10 + j;
      const vx = -(280 + rnd(seed) * 220), vy = -(380 + rnd(seed + 1) * 200);
      const x0 = GUY.x - 70 * GUY.s, y0 = GROUND - 222 * GUY.s;
      let x = x0 + vx * s, y = y0 + vy * s + 0.5 * 1800 * s * s;
      if (y > GROUND - 12) { y = GROUND - 12; }
      const landed = y >= GROUND - 12;
      const sc = landed ? Math.max(0, 1 - (s - 0.5) * 2.5) : 1;
      if (landed) x = Math.max(x, 60);
      clumps.push(<circle key={`${k}-${j}`} cx={x} cy={y} r={(14 + rnd(seed + 4) * 8) * sc} fill="#8B5A33" stroke={INK} strokeWidth={5} />);
    }
  }
  const pile = digsDone;
  const holeDepth = t < T.dig ? 0 : 20 + 22 * digsDone;

  return (
    <AbsoluteFill style={{background: 'linear-gradient(#8ED2FF 0%, #C8ECFF 45%, #E6F7FF 100%)'}}>
      <Layer cam={cam} z={3000}><Clouds /></Layer>
      <Layer cam={cam} z={2000} blur={cam.z > 500 ? 3 : 0}><Hills /></Layer>
      <Layer cam={cam} z={1000}>
        <Ground coreOpen={coreOpen} coreLook={-1} coreMood={coreOpen > 0.5 ? 'smile' : 'sleep'} />
        {/* heat glow around the bit */}
        {heat > 0 && (
          <g>
            <defs>
              <radialGradient id="heat"><stop offset="0%" stopColor="#FF6A2B" stopOpacity={0.85} /><stop offset="100%" stopColor="#FF6A2B" stopOpacity={0} /></radialGradient>
            </defs>
            <circle cx={HX} cy={BIT_END + 20} r={190} fill="url(#heat)" opacity={heat} />
          </g>
        )}
        {/* shovel hole, then the narrow bore */}
        {holeDepth > 0 && t < T.rig && (
          <path transform={`translate(${GUY.x + 190 - HX} 0)`} d={`M${HX - 42} ${GROUND} L ${HX - 34} ${GROUND + holeDepth} Q ${HX} ${GROUND + holeDepth + 12} ${HX + 34} ${GROUND + holeDepth} L ${HX + 42} ${GROUND} Z`}
            fill="#3E2614" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        )}
        {t >= T.rig && (
          <rect x={HX - 18} y={GROUND} width={36} height={Math.max(0, bitY - GROUND + 30)} fill="#3E2614" stroke={INK} strokeWidth={6} />
        )}
        {/* dirt pile behind the guy */}
        {pile > 0 && t < T.rig + 0.3 && (
          <path d={`M${110 - pile * 10} ${GROUND - 24} Q 170 ${GROUND - 24 - 14 * Math.min(pile, 6)} ${230 + pile * 6} ${GROUND - 24} Z`}
            fill="#8B5A33" stroke={INK} strokeWidth={W} strokeLinejoin="round"
            transform={t >= T.rig ? `translate(0 ${-0}) scale(1 ${1 - ramp(t, T.rig, T.rig + 0.3)})` : undefined} />
        )}
        {t >= T.drill - 0.4 && (
          <g transform={`translate(${HX} 0)`}><Pipe y0={GROUND - 330} y1={bitY} spin={spin} bend={bend} /></g>
        )}
        {gooR > 0 && (
          <g transform={`translate(${HX + bend * 26} ${BIT_END + 34})`}>
            <path d={Array.from({length: 49}, (_, i) => {
              const a = (i / 48) * Math.PI * 2;
              const r = gooR * (1 + 0.1 * Math.sin(a * 5 + tr * 4));
              return `${i ? 'L' : 'M'}${(Math.cos(a) * r * 1.2).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
            }).join(' ') + 'Z'} fill="#FF7A2E" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
            <ellipse cx={-gooR * 0.5} cy={-gooR * 0.45} rx={gooR * 0.22} ry={gooR * 0.12} fill="#FFC867" />
            <g transform={`translate(0 ${gooR * 0.1}) scale(${gooR / 66})`}><BlobFace r={66} open={pop(t, T.goo + 0.15, 0.25)} lookY={-1} mood="smirk" /></g>
          </g>
        )}
        {t >= T.rig && (
          <g transform={`translate(${HX} ${GROUND}) scale(${rigOn ** 0.5 * (1 + 0.04 * wobble(t, T.rig, 4, 6))} ${rigOn})`}>
            <Rig spin={spin} shake={t >= T.stop && t < T.stop + 0.5 ? 4 * Math.sin(tr * 70) * Math.exp(-(t - T.stop) * 6) : 0} />
          </g>
        )}
        {/* depth readout */}
        {t >= T.drill && t < T.earth && (
          <g transform={`translate(${HX - 40 + 40 * ramp(t, T.dive, T.dive + 0.8)} ${bitY + 24 + 126 * ramp(t, T.dive, T.dive + 0.8)}) scale(${t >= T.twelve ? 1 + 0.35 * Math.max(0, wobble(t, T.twelve, 2.5, 5)) : 1})`}>
            <Label x={0} y={0} text={`${Math.round(12 * prog)} km`} size={t >= T.twelve ? 46 : 36} anchor={t >= T.dive + 0.4 ? 'middle' : 'end'} />
          </g>
        )}
        <g transform={`translate(${GUY.x} ${GUY.y}) scale(${GUY.s})`}>
          <Guy shovel={shovel} face={face as never} breathe={Math.sin(tr * 2 * Math.PI * 0.6)} squash={squash} sweat={sweat} blink={blink} look={t >= T.rig ? 1 : 0} />
        </g>
        {clumps}
        {steam.length > 0 && <Puffs items={steam} fill="#fff" />}
        {smoke.length > 0 && <Puffs items={smoke} fill="#8D96A3" />}
        {thermo > 0.001 && t < T.stop + 0.3 && (
          <g>
            <g transform={`translate(${THERMO.x} ${THERMO.y}) scale(${thermo * (1 - ramp(t, T.stop, T.stop + 0.25, easeIn))})`}><Thermo fill={thermoFill} /></g>
            {t > T.temp + 0.3 && (
              <g transform={`translate(${THERMO.x} ${THERMO.y + 92}) scale(${pop(t, T.temp + 0.3, 0.25) * (1 - ramp(t, T.stop, T.stop + 0.25, easeIn))})`}>
                <Label x={0} y={0} text="180°C" size={38} anchor="middle" color="#FFE07A" />
              </g>
            )}
          </g>
        )}
      </Layer>
      <SoundLayer />
    </AbsoluteFill>
  );
};

const SoundLayer: React.FC = () => (
  <>
    {VOICE && (
      <Sequence from={Math.round(timing.voiceStart * FPS)} layout="none">
        <Audio src={staticFile(VOICE)} />
      </Sequence>
    )}
    {CUES.map((c, i) => (
      <Sequence key={i} from={Math.max(0, Math.round(c.at * FPS))} layout="none">
        <Audio src={staticFile(`core/sfx/${c.f}.wav`)} volume={10 ** (c.db / 20)} />
      </Sequence>
    ))}
  </>
);

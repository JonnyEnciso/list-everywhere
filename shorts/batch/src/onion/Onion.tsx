import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {FPS, clamp, lerp, ramp, pop, wobble, easeOut, easeIn, rnd, timeline} from '../lib/time';
import {Cam, Cue, Layer, Move, Sound, camAt, shaken} from '../lib/stage';
import {BlobFace, Face, Guy, INK, Puffs, W} from '../lib/parts';

const TL = timeline(timing);
export const DURATION = TL.DURATION;
const {at, S} = TL;

const CHOPS = [at(0, 0.3), at(0, 0.55)];
const CHOPS2 = [at(6, 0.55), at(6, 0.78)];
const T = {
  cry: at(0, 0.85), //             "make you CRY" tears
  whole: S[1].a - 0.05, //         "A whole onion is harmless": fresh onion, halo, innocent
  halo: at(1, 0.55),
  cells: S[2].a - 0.05, //         cut: inside the onion, cells
  slice: at(2, 0.28), //           "the knife BREAKS open its cells"
  mix: at(2, 0.82), //             "suddenly MIX"
  chomp: S[3].a + 0.2, //          "An ENZYME turns them..." enzymes chomp
  gas: at(3, 0.35), //             "...into a GAS"
  kitchen: at(3, 0.55), //         cut back: gas drifts up to his eyes
  eyes: at(3, 0.92), //            "into your EYES"
  sting: S[4].a + 0.1, //          close-up: "Your eyes feel it as an IRRITANT"
  tears: at(4, 0.8), //            "flush it out with TEARS" tears gush
  defend: at(5, 0.45), //          "the onion is DEFENDING itself" helmet + shield
  tearless: S[6].a + 0.1, //       "Scientists have even made onions that barely do it": tearless onion
  loop: TL.VOICE_END + 0.5,
};

const GUY = {x: 250, y: 1330, s: 1.25};
const HAND = {x: 360, y: 1118};
const ONION = {x: 575, y: 1140, r: 100};
const EYE = {x: GUY.x + 30 * GUY.s, y: GUY.y - 240 * GUY.s};
const CELLS = {x: 4000, y: 960};

const START_C: Cam = {x: 440, y: 1000, z: 380};
const MOVES: Move[] = [
  {t0: T.whole, t1: T.whole + 0.5, to: {x: 510, y: 1010, z: 470}},
  {t0: T.cells, t1: T.cells, to: {x: CELLS.x, y: CELLS.y, z: 0}, cut: true},
  {t0: T.cells + 0.1, t1: T.chomp, to: {x: CELLS.x, y: CELLS.y + 20, z: 90}},
  {t0: T.kitchen, t1: T.kitchen, to: {x: 430, y: 960, z: 330}, cut: true},
  {t0: T.sting - 0.15, t1: T.sting + 0.6, to: {x: EYE.x + 20, y: EYE.y + 10, z: 620}},
  {t0: S[5].a - 0.1, t1: S[5].a + 0.6, to: START_C},
  {t0: T.loop, t1: T.loop, to: START_C, cut: true},
];

// ------------------------------------------------------------------------------------------------ parts
const OnionBulb: React.FC<{r: number; mood: 'smile' | 'smirk' | 'o'; open?: number; tearless?: boolean; cut?: number; look?: number}> =
  ({r, mood, open = 1, tearless = false, cut = 0, look = 0}) => {
    const d = `M0 ${-r * 1.3} Q ${r * 0.3} ${-r * 0.95} ${r * 0.95} ${-r * 0.15} Q ${r * 1.05} ${r * 0.8} 0 ${r * 0.95} Q ${-r * 1.05} ${r * 0.8} ${-r * 0.95} ${-r * 0.15} Q ${-r * 0.3} ${-r * 0.95} 0 ${-r * 1.3} Z`;
    return (
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d={`M-6 ${-r * 1.28} q -10 -40 -30 -60 M6 ${-r * 1.28} q 14 -46 40 -56`} stroke={INK} strokeWidth={16} fill="none" />
        <path d={`M-6 ${-r * 1.28} q -10 -40 -30 -60 M6 ${-r * 1.28} q 14 -46 40 -56`} stroke="#79C25A" strokeWidth={7} fill="none" />
        {[-20, -8, 4, 16].map((x, i) => <path key={i} d={`M${x * 0.6} ${r * 0.93} q ${x * 0.5} 22 ${x} 30`} stroke={INK} strokeWidth={4} fill="none" />)}
        <path d={d} fill={tearless ? '#F2E3B8' : '#D99A54'} stroke={INK} strokeWidth={W} />
        {[-0.55, 0.55].map((f, i) => (
          <path key={i} d={`M0 ${-r * 1.2} Q ${r * f * 1.3} ${-r * 0.1} 0 ${r * 0.9}`} fill="none" stroke={tearless ? '#E2CC94' : '#BF7D3B'} strokeWidth={5} />
        ))}
        <ellipse cx={-r * 0.45} cy={-r * 0.35} rx={r * 0.13} ry={r * 0.24} fill={tearless ? '#FFF6DC' : '#EDB878'} />
        {cut > 0 && <line x1={r * 0.18} y1={-r * 1.0} x2={r * 0.18} y2={r * 0.9} stroke={INK} strokeWidth={6} />}
        {cut > 1 && <line x1={r * 0.5} y1={-r * 0.7} x2={r * 0.5} y2={r * 0.8} stroke={INK} strokeWidth={6} />}
        <g transform={`translate(${-r * 0.05} ${r * 0.1})`}><BlobFace r={r * 0.75} open={open} mood={mood} lookX={look} /></g>
        {tearless && (
          <g transform={`translate(${-r * 0.05} ${-r * 0.02})`}>
            <rect x={-r * 0.48} y={-r * 0.12} width={r * 0.4} height={r * 0.26} rx={r * 0.1} fill={INK} />
            <rect x={r * 0.08} y={-r * 0.12} width={r * 0.4} height={r * 0.26} rx={r * 0.1} fill={INK} />
            <line x1={-r * 0.1} y1={-r * 0.04} x2={r * 0.1} y2={-r * 0.04} stroke={INK} strokeWidth={6} />
            <path d={`M${-r * 0.4} ${-r * 0.06} l ${r * 0.1} 0`} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

const Knife: React.FC<{ang: number}> = ({ang}) => (
  <g transform={`rotate(${ang})`} strokeLinejoin="round">
    <rect x={-60} y={-14} width={74} height={28} rx={10} fill="#5B3A29" stroke={INK} strokeWidth={W} />
    <path d="M14 -16 L 250 -16 Q 268 -10 262 2 L 240 22 L 14 22 Z" fill="#C7D0D9" stroke={INK} strokeWidth={W} />
    <path d="M30 -6 L 230 -6" stroke="#EEF2F5" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** chop angle: raised -30 deg, a fast chop down and a softer lift */
const chopAngle = (t: number, chops: number[]) => {
  let a = -30;
  for (const c of chops) {
    const s = t - c;
    if (s > -0.12 && s <= 0) a = lerp(-30, 10, easeIn((s + 0.12) / 0.12));
    else if (s > 0 && s < 0.3) a = lerp(10, -30, easeOut(s / 0.3));
  }
  return a;
};

// ------------------------------------------------------------------------------------------------ composition
export const Onion: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = frame / FPS;
  const looped = tr >= T.loop;
  const t = looped ? 0 : tr;
  const cells = t >= T.cells && t < T.kitchen;

  let amp = 0;
  for (const c of [...CHOPS, ...CHOPS2]) if (t >= c && t < c + 0.3) amp += 7 * Math.exp(-(t - c) * 12);
  const cam = shaken(camAt(tr, MOVES, START_C), tr, amp);

  // kitchen state
  const fresh = t >= T.whole; // a new whole onion after the first scene
  const tearless = t >= T.tearless;
  const knifeAng = t < T.whole ? chopAngle(t, CHOPS) : tearless ? chopAngle(t, CHOPS2) : -30;
  const cutCount = !fresh ? CHOPS.filter((c) => t >= c).length : tearless ? CHOPS2.filter((c) => t >= c).length : 0;
  const onionMood: 'smile' | 'smirk' | 'o' = !fresh && t >= CHOPS[0] ? 'o' : t >= T.defend && !tearless ? 'smirk' : 'smile';
  const swap = (t0: number) => (t >= t0 && t < t0 + 0.4 ? 1 - 0.18 * wobble(t, t0, 3, 6) : 1);
  const onionScale = swap(T.whole) * swap(T.tearless);
  let face: Face = 'smile';
  let tears = 0;
  if (t >= T.cry - 0.2 && t < T.whole) { face = 'worried'; tears = clamp((t - T.cry + 0.2) * 2); }
  if (t >= T.whole && t < T.eyes) face = 'neutral';
  if (t >= T.eyes && t < T.tearless) { face = t < T.tears ? 'shock' : 'worried'; }
  if (t >= T.tears && t < T.tearless) tears = clamp(t - T.tears + 0.3);
  const squint = t >= T.sting && t < T.tearless ? 1 : 0;
  const gush = t >= T.tears && t < S[5].a + 0.4 ? 1 : 0;

  // gas in the kitchen: puffs rising from the onion and curling into his eyes
  const gasPuffs = t >= T.kitchen && t < T.tearless
    ? Array.from({length: 10}, (_, i) => {
      const born = T.kitchen + i * 0.32 - 0.6;
      const u = (t - born) / 1.6;
      if (u < 0 || u > 1) return null;
      const p0 = {x: ONION.x, y: ONION.y - 140}, p1 = {x: 470, y: 760}, p2 = {x: EYE.x + 40, y: EYE.y};
      const x = (1 - u) ** 2 * p0.x + 2 * (1 - u) * u * p1.x + u * u * p2.x + Math.sin(u * 9 + i) * 12;
      const y = (1 - u) ** 2 * p0.y + 2 * (1 - u) * u * p1.y + u * u * p2.y;
      return {x, y, r: 26 * Math.sin(Math.PI * u) + 4};
    }).filter(Boolean) as {x: number; y: number; r: number}[]
    : [];

  // tear streams (projectiles) out of both eyes
  const drops: React.ReactNode[] = [];
  if (gush) {
    for (let i = 0; i < 26; i++) {
      const dir = i % 2 ? 1 : -1;
      const born = T.tears + (i * 0.07);
      const age = ((t - born) % 0.9 + 0.9) % 0.9;
      if (t < born) continue;
      const ex = EYE.x + (dir > 0 ? 38 : -4) * GUY.s, ey = EYE.y + 6;
      const vx = dir * (150 + rnd(i) * 120), vy = -(160 + rnd(i + 3) * 120);
      drops.push(<circle key={i} cx={ex + vx * age} cy={ey + vy * age + 0.5 * 1500 * age * age} r={9 - age * 4} fill="#9ED8FF" stroke={INK} strokeWidth={3.5} />);
    }
  }

  // cells shot
  const sliceU = ramp(t, T.slice, T.slice + 0.4, (u) => u);
  const mixU = ramp(t, T.mix - 0.3, T.mix + 0.4);
  const chompU = ramp(t, T.chomp, T.chomp + 0.5);
  const cellGrid = [] as React.ReactNode[];
  const cellsBroken = (row: number) => row === 1 && t >= T.slice + 0.15;
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    const cx = CELLS.x + (col - 1) * 320, cy = CELLS.y + (row - 1) * 360;
    const broken = cellsBroken(row);
    const enz = [[-95, -110], [95, 100], [-90, 115]];
    cellGrid.push(
      <g key={`${row}${col}`} transform={`translate(${cx} ${cy})`}>
        <rect x={-145} y={-165} width={290} height={330} rx={40} fill="#FFF7E6" stroke={INK} strokeWidth={W}
          strokeDasharray={broken ? '60 40' : undefined} />
        {/* vacuole with the sulfur compounds, kept apart from the enzymes */}
        {!broken && <circle cx={10} cy={0} r={70} fill="#CFE9FF" stroke={INK} strokeWidth={6} />}
        {Array.from({length: 6}, (_, k) => {
          const a = (k / 6) * Math.PI * 2;
          const home = {x: 10 + Math.cos(a) * 36, y: Math.sin(a) * 36};
          const target = {x: enz[k % 3][0] + 22, y: enz[k % 3][1]};
          const u = broken ? mixU : 0;
          const gone = broken && chompU > (k / 6) * 0.8 + 0.2;
          if (gone) return null;
          return <circle key={k} cx={lerp(home.x, target.x, u) + (broken ? Math.sin(t * 6 + k) * 6 : 0)} cy={lerp(home.y, target.y, u)} r={12} fill="#3F7FE0" stroke={INK} strokeWidth={4} />;
        })}
        {enz.map(([ex, ey], k) => {
          const mouth = broken && t >= T.chomp ? 0.35 + 0.35 * Math.abs(Math.sin((t - T.chomp) * 14 + k)) : 0.35;
          return (
            <g key={k} transform={`translate(${ex} ${ey})`}>
              <path d={`M0 0 L ${30 * Math.cos(mouth)} ${-30 * Math.sin(mouth)} A 30 30 0 1 0 ${30 * Math.cos(mouth)} ${30 * Math.sin(mouth)} Z`} fill="#6CC46A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <circle cx={-2} cy={-14} r={5} fill={INK} />
            </g>
          );
        })}
        {/* gas puffs out of the broken cells */}
        {broken && t >= T.gas && (
          <Puffs fill="#E1E86A" items={[0, 1, 2].map((k) => {
            const u = ((t - T.gas - k * 0.35) % 1.2 + 1.2) % 1.2 / 1.2;
            return {x: enz[k][0] + Math.sin(u * 8 + k) * 14, y: enz[k][1] - 40 - u * 420, r: 30 * Math.sin(Math.PI * u) + 2};
          })} />
        )}
      </g>,
    );
  }

  const cues: Cue[] = [
    ...CHOPS.map((c) => ({f: 'chop', at: c, db: -16})),
    {f: 'boing', at: CHOPS[0] + 0.05, db: -27},
    {f: 'pop', at: T.whole, db: -23}, {f: 'chime', at: T.halo, db: -27},
    {f: 'whoosh', at: T.cells - 0.1, db: -26},
    {f: 'swish', at: T.slice, db: -20}, {f: 'crack', at: T.slice + 0.15, db: -24},
    {f: 'bubble', at: T.slice + 0.2, db: -24}, {f: 'bubble', at: T.slice + 0.3, db: -25},
    {f: 'gulp', at: T.chomp, db: -22}, {f: 'gulp', at: T.chomp + 0.25, db: -24},
    {f: 'hiss', at: T.gas, db: -27},
    {f: 'whoosh', at: T.sting - 0.15, db: -27},
    {f: 'sizzle', at: T.sting + 0.2, db: -30},
    {f: 'plop', at: T.tears, db: -20}, {f: 'plop', at: T.tears + 0.2, db: -22}, {f: 'plop', at: T.tears + 0.45, db: -23},
    {f: 'clank', at: T.defend, db: -22},
    {f: 'sparkle', at: T.tearless, db: -24},
    ...CHOPS2.map((c) => ({f: 'chop', at: c, db: -17})),
  ];

  return (
    <AbsoluteFill style={{background: cells ? '#F1E4F6' : 'linear-gradient(#FFE9C9 0%, #FFF4E2 100%)'}}>
      {!cells && (
        <Layer cam={cam} z={2000}>
          {/* kitchen wall: tiles and a window */}
          {Array.from({length: 60}, (_, i) => <rect key={i} x={-900 + (i % 10) * 300} y={-300 + Math.floor(i / 10) * 300} width={290} height={290} rx={18} fill="#FCE3BF" />)}
          <rect x={700} y={-80} width={520} height={420} rx={24} fill="#9FD8FF" stroke={INK} strokeWidth={14} />
          <line x1={960} y1={-80} x2={960} y2={340} stroke={INK} strokeWidth={12} />
        </Layer>
      )}
      <Layer cam={cam} z={1000}>
        {cells ? (
          <g>
            {cellGrid}
            {t >= T.slice - 0.05 && t < T.slice + 0.6 && (
              <g transform={`translate(${lerp(CELLS.x - 900, CELLS.x + 900, sliceU)} ${CELLS.y - 20}) rotate(-8) scale(2.2)`}><Knife ang={0} /></g>
            )}
          </g>
        ) : (
          <g>
            {/* counter + board */}
            <rect x={-600} y={1250} width={2400} height={900} fill="#C98A4B" stroke={INK} strokeWidth={W} />
            <rect x={-600} y={1250} width={2400} height={40} fill="#E0A86A" />
            <rect x={330} y={1225} width={520} height={40} rx={14} fill="#F2CF95" stroke={INK} strokeWidth={W} />
            <g transform={`translate(${GUY.x} ${GUY.y}) scale(${GUY.s})`}>
              <Guy face={face} breathe={Math.sin(tr * 3.8)} tears={tears} blink={squint}
                handF={{x: (HAND.x - GUY.x) / GUY.s, y: (HAND.y - GUY.y) / GUY.s}} handB={{x: -54, y: -100}} />
            </g>
            <rect x={-600} y={1290} width={2400} height={900} fill="#C98A4B" />
            <g transform={`translate(${ONION.x} ${ONION.y}) scale(${onionScale})`}>
              <OnionBulb r={ONION.r} mood={onionMood} cut={cutCount} tearless={tearless} look={t >= T.whole && t < T.eyes ? -0.6 : 0}
                open={t >= T.halo + 0.8 && t < T.halo + 0.95 ? 0 : 1} />
              {t >= T.halo && t < T.cells && (
                <ellipse cx={0} cy={-ONION.r * 1.75} rx={60 * pop(t, T.halo, 0.3)} ry={16 * pop(t, T.halo, 0.3)} fill="none" stroke="#FFD84A" strokeWidth={12} />
              )}
              {t >= T.defend && !tearless && (
                <g transform={`scale(${pop(t, T.defend, 0.3)})`}>
                  <path d={`M${-ONION.r * 0.7} ${-ONION.r * 0.55} Q 0 ${-ONION.r * 1.5} ${ONION.r * 0.7} ${-ONION.r * 0.55} Z`} fill="#AEB8C2" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
                  <path d={`M0 ${-ONION.r * 1.2} q 30 -40 10 -70`} stroke="#E8343B" strokeWidth={14} fill="none" strokeLinecap="round" />
                  <g transform={`translate(${ONION.r * 0.95} ${ONION.r * 0.25}) rotate(10)`}>
                    <path d="M-38 -50 L 38 -50 L 38 0 Q 38 40 0 62 Q -38 40 -38 0 Z" fill="#3F7FE0" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
                    <path d="M0 -40 L 0 50 M -28 -6 L 28 -6" stroke="#FFD84A" strokeWidth={10} />
                  </g>
                </g>
              )}
              {tearless && t < T.tearless + 0.8 && [0, 1, 2, 3, 4].map((k) => {
                const a = (k / 5) * Math.PI * 2 + 0.3, u = clamp((t - T.tearless) / 0.8);
                return <path key={k} d="M0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill="#FFE07A" stroke={INK} strokeWidth={3}
                  transform={`translate(${Math.cos(a) * (120 + 60 * u)} ${Math.sin(a) * (120 + 60 * u) - 40}) scale(${Math.sin(Math.PI * u) * 1.6})`} />;
              })}
            </g>
            <g transform={`translate(${HAND.x} ${HAND.y})`}><Knife ang={knifeAng} /></g>
            <circle cx={HAND.x} cy={HAND.y} r={13 * GUY.s} fill="#fff" stroke={INK} strokeWidth={W * 0.8 * GUY.s} />
            {gasPuffs.length > 0 && <Puffs fill="#E1E86A" items={gasPuffs} />}
            {t >= T.sting && t < S[5].a && [0, 1, 2].map((k) => {
              const a = (-60 + k * 45) * Math.PI / 180, s = ((t - T.sting) * 3 + k * 0.3) % 1;
              return <line key={k} x1={EYE.x + 20 + Math.cos(a) * (40 + 20 * s)} y1={EYE.y - 10 + Math.sin(a) * (40 + 20 * s)}
                x2={EYE.x + 20 + Math.cos(a) * (60 + 20 * s)} y2={EYE.y - 10 + Math.sin(a) * (60 + 20 * s)} stroke="#FF4B3E" strokeWidth={7} strokeLinecap="round" />;
            })}
            {drops}
          </g>
        )}
      </Layer>
      <Sound voice={TL.voiceFile} voiceStart={TL.voiceStart} cues={cues} />
    </AbsoluteFill>
  );
};

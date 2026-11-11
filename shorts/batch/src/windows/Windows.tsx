import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {FPS, clamp, lerp, ramp, pop, wobble, easeOut, easeIn, rnd, timeline} from '../lib/time';
import {Cam, Layer, Move, Sound, camAt, shaken, Cue} from '../lib/stage';
import {BlobFace, INK, Label, Puffs, W} from '../lib/parts';

const TL = timeline(timing);
export const DURATION = TL.DURATION;
const {at, S} = TL;

const T = {
  square: at(0, 0.82), //            "and not SQUARE" a square window pops in next to the round one
  comet: S[1].a - 0.05, //           cut: a 1950s jet in the sky
  year: at(1, 0.12), //              "nineteen fifty-four" label
  crack: at(1, 0.78), //             "broke APART in midair" crack, the jet splits in two
  pump: S[2].a - 0.05, //            cut: plane with a face; "pumped FULL of air" it inflates
  inflate: at(2, 0.42),
  deflate: at(2, 0.82), //           "let DOWN again"
  flex: S[3].a - 0.05, //            cut: skin panel with a square window flexing in and out
  stress: at(4, 0.3), //             "the STRESS bunches up" red hotspots at the corners
  cracks: at(4, 0.72), //            "tiny CRACKS start to grow"
  round: S[5].a - 0.05, //           camera glides to a round window: stress spreads evenly
  fleet: S[6].a - 0.05, //           cut: modern airliner, rounded windows winking
  loop: TL.VOICE_END + 0.55, //      cut back to the frame-0 window (loops)
};

// shot centres in the world (camera cuts between them)
const A = {x: 540, y: 960}, B = {x: 4000, y: 960}, C = {x: 8000, y: 960}, D = {x: 12000, y: 960}, E = {x: 16000, y: 960};
const START_A: Cam = {x: 540, y: 960, z: 160};
const MOVES: Move[] = [
  {t0: T.comet, t1: T.comet, to: {x: B.x - 260, y: B.y, z: 0}, cut: true},
  {t0: T.comet + 0.05, t1: T.crack, to: {x: B.x + 120, y: B.y, z: 80}},
  {t0: T.pump, t1: T.pump, to: {x: C.x, y: C.y, z: 0}, cut: true},
  {t0: T.pump + 0.1, t1: T.deflate + 0.5, to: {x: C.x + 40, y: C.y, z: 70}},
  {t0: T.flex, t1: T.flex, to: {x: D.x, y: D.y, z: 0}, cut: true},
  {t0: T.stress - 0.3, t1: T.stress + 0.6, to: {x: D.x, y: D.y, z: 180}},
  {t0: T.round - 0.1, t1: T.round + 0.8, to: {x: D.x + 2000, y: D.y, z: 180}},
  {t0: T.fleet, t1: T.fleet, to: {x: E.x, y: E.y, z: -40}, cut: true},
  {t0: T.fleet + 0.1, t1: T.loop - 0.1, to: {x: E.x + 60, y: E.y, z: 90}},
  {t0: T.loop, t1: T.loop, to: START_A, cut: true},
];

// ------------------------------------------------------------------------------------------------ parts
const Clouds: React.FC<{t: number}> = ({t}) => (
  <g>
    {Array.from({length: 26}, (_, i) => {
      const x = -1500 + i * 900 + rnd(i) * 300 - t * 25, y = 300 + rnd(i + 5) * 1400, s = 0.6 + rnd(i + 9) * 0.9;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <Puffs fill="#fff" items={[{x: -80, y: 10, r: 55}, {x: 0, y: -25, r: 75}, {x: 85, y: 6, r: 58}, {x: 10, y: 30, r: 52}]} />
        </g>
      );
    })}
  </g>
);

/** aircraft window: frame + glass with sky + face. r = corner radius (small = square) */
const Win: React.FC<{w: number; h: number; r: number; t: number; id: string; mood?: 'smile' | 'smirk' | 'o'; look?: number; open?: number; sweat?: number}> =
  ({w, h, r, t, id, mood = 'smile', look = 0, open = 1, sweat = 0}) => (
    <g>
      <rect x={-w / 2 - 34} y={-h / 2 - 34} width={w + 68} height={h + 68} rx={r + 30} fill="#DDE3EA" stroke={INK} strokeWidth={W} />
      <defs><clipPath id={`glass-${id}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} /></clipPath></defs>
      <g clipPath={`url(#glass-${id})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#7CC8FF" />
        <rect x={-w / 2} y={h * 0.1} width={w} height={h} fill="#A8DDFF" />
        <g transform={`translate(${((t * 60) % (w + 300)) - w / 2 - 150} ${-h * 0.15})`}>
          <Puffs fill="#fff" items={[{x: -40, y: 0, r: 30}, {x: 0, y: -14, r: 40}, {x: 44, y: 0, r: 30}]} />
        </g>
        <path d={`M${-w / 2 + 20} ${-h / 2 + 40} L ${-w / 2 + 70} ${-h / 2 - 10}`} stroke="#fff" strokeWidth={14} opacity={0.6} strokeLinecap="round" />
        <g transform={`translate(0 ${h * 0.05})`}><BlobFace r={Math.min(w, h) * 0.55} open={open} lookX={look} mood={mood} /></g>
      </g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill="none" stroke={INK} strokeWidth={W} />
      {sweat > 0 && (
        <g transform={`translate(${w / 2 + 10} ${-h / 2 + 30 + sweat * 60}) scale(${Math.min(1, sweat * 4)})`}>
          <path d="M0 -26 C 17 0 17 17 0 17 C -17 17 -17 0 0 -26 Z" fill="#9ED8FF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );

/** side view airliner, nose to the right, centred at 0,0 (about 1000 long) */
const Plane: React.FC<{style: 'comet' | 'modern'; puff?: number; face?: boolean; t: number; wink?: number}> = ({style, puff = 0, face = false, t, wink = 0}) => {
  const body = style === 'comet' ? '#E6EAEE' : '#FFFFFF';
  const stripe = style === 'comet' ? '#2F5D9E' : '#3FA0E8';
  const h = 150 * (1 + puff);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-430 -40 L -520 -230 L -440 -230 L -340 -60 Z" fill={stripe} stroke={INK} strokeWidth={W} />
      <path d="M-60 20 L -230 190 L -150 200 L 80 30 Z" fill="#B9C2CC" stroke={INK} strokeWidth={W} />
      {style === 'modern' && <ellipse cx={-100} cy={130} rx={70} ry={30} fill="#9AA5B1" stroke={INK} strokeWidth={W} />}
      <path d={`M-470 ${-h / 2 + 10} L 330 ${-h / 2} Q 520 ${-h / 2 + 5} 540 0 Q 520 ${h / 2 - 5} 330 ${h / 2} L -470 ${h / 2 - 25} Q -520 0 -470 ${-h / 2 + 10} Z`}
        fill={body} stroke={INK} strokeWidth={W} />
      <path d={`M-470 ${h * 0.12} L 470 ${h * 0.12}`} stroke={stripe} strokeWidth={16} />
      {Array.from({length: 11}, (_, i) => {
        const x = -330 + i * 62, y = -h * 0.18;
        return style === 'comet'
          ? <rect key={i} x={x - 15} y={y - 17} width={30} height={34} rx={5} fill="#7CC8FF" stroke={INK} strokeWidth={5} />
          : <g key={i}><ellipse cx={x} cy={y} rx={14} ry={19} fill="#7CC8FF" stroke={INK} strokeWidth={5} />
              {wink > 0 && <ellipse cx={x} cy={y + 2} rx={4} ry={6 * (Math.sin(t * 9 + i) > 0.92 ? 0.2 : 1)} fill={INK} />}</g>;
      })}
      <path d={`M430 ${-h * 0.3} Q 480 ${-h * 0.32} 505 ${-h * 0.12} L 440 ${-h * 0.1} Z`} fill="#3B4A5C" stroke={INK} strokeWidth={6} />
      {face && (
        <g transform={`translate(330 ${h * 0.02})`}>
          <BlobFace r={118} open={1} lookX={0.4} mood={puff > 0.04 ? 'o' : 'smile'} />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ composition
export const Windows: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = frame / FPS;
  const looped = tr >= T.loop;
  const t = looped ? 0 : tr;
  let amp = 0;
  if (t >= T.crack && t < T.crack + 0.6) amp += 14 * Math.exp(-(t - T.crack) * 6);
  if (t >= T.cracks && t < T.cracks + 0.4) amp += 6 * Math.exp(-(t - T.cracks) * 8);
  const cam: Cam = shaken(camAt(tr, MOVES, START_A), tr, amp);

  // shot A: round window, square one pops in
  const sq = pop(t, T.square, 0.32);
  // shot B: comet flies right, cracks, splits
  const flyX = B.x - 760 + (t - T.comet) * 165;
  const split = t < T.crack + 0.25 ? 0 : t - T.crack - 0.25;
  // shot C: inflate / deflate (two quick extra breaths after)
  const breath = t < T.inflate ? 0 : t < T.deflate ? ramp(t, T.inflate, T.inflate + 0.35, easeOut) : 1 - ramp(t, T.deflate, T.deflate + 0.35, easeOut);
  // shot D: flexing panel, stress, cracks
  const flex = t >= T.flex && t < T.fleet ? Math.sin((t - T.flex) * 2 * Math.PI * 1.6) : 0;
  const hot = ramp(t, T.stress, T.stress + 0.5);
  const crackLen = ramp(t, T.cracks, T.cracks + 0.9, easeOut);

  const cues: Cue[] = [
    {f: 'pop', at: T.square, db: -22},
    {f: 'whoosh', at: T.comet - 0.1, db: -27},
    {f: 'ding', at: T.year, db: -26},
    {f: 'crack', at: T.crack, db: -14}, {f: 'thud', at: T.crack + 0.25, db: -16},
    {f: 'hiss', at: T.inflate - 0.1, db: -24}, {f: 'pff', at: T.deflate, db: -20},
    ...Array.from({length: Math.max(0, Math.floor((S[4].a - T.flex) * 1.6))}, (_, i) => ({f: 'creak', at: T.flex + (i + 0.25) / 1.6, db: -27})),
    {f: 'squeeze', at: T.stress, db: -25},
    {f: 'crack', at: T.cracks, db: -20}, {f: 'crack', at: T.cracks + 0.35, db: -24},
    {f: 'whoosh', at: T.round - 0.1, db: -27}, {f: 'chime', at: T.round + 0.6, db: -26},
    {f: 'whoosh', at: T.fleet - 0.05, db: -24}, {f: 'sparkle', at: T.fleet + 0.6, db: -27},
  ];

  const panel = (cx: number, kind: 'square' | 'round') => {
    const isSq = kind === 'square';
    const bulge = flex * 0.025;
    return (
      <g transform={`translate(${cx} ${D.y}) scale(${1 + bulge} ${1 - bulge * 0.5})`}>
        <rect x={-760} y={-1300} width={1520} height={2600} fill="#F4F6F8" stroke={INK} strokeWidth={W} />
        {Array.from({length: 12}, (_, i) => <line key={i} x1={-760} y1={-1100 + i * 200} x2={760} y2={-1100 + i * 200} stroke="#D3DAE1" strokeWidth={5} />)}
        {Array.from({length: 84}, (_, i) => <circle key={`r${i}`} cx={-700 + (i % 12) * 127} cy={-1200 + Math.floor(i / 12) * 400} r={7} fill="#C3CCD5" />)}
        {/* stretching arrows: cabin pressure pulls the skin outward */}
        {t >= T.flex && [-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * (420 + 20 * Math.max(0, flex))} 0) scale(${s} 1)`}>
            <path d="M0 -30 L 70 -30 L 70 -60 L 130 0 L 70 60 L 70 30 L 0 30 Z" fill="#FF8A3D" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          </g>
        ))}
        {/* stress: hotspots at sharp corners, an even soft ring around a round window */}
        {isSq && hot > 0 && [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => (
          <g key={i}>
            <defs><radialGradient id={`hs${i}`}><stop offset="0%" stopColor="#FF2E2E" stopOpacity={0.9} /><stop offset="100%" stopColor="#FF2E2E" stopOpacity={0} /></radialGradient></defs>
            <circle cx={sx * 160} cy={sy * 210} r={110 * hot * (1 + 0.15 * Math.sin(t * 9 + i))} fill={`url(#hs${i})`} />
          </g>
        ))}
        {!isSq && (
          <ellipse cx={0} cy={0} rx={235} ry={290} fill="none" stroke="#FFB547" strokeWidth={36} opacity={0.55 + 0.1 * Math.sin(t * 3)} />
        )}
        <Win w={isSq ? 320 : 300} h={isSq ? 420 : 400} r={isSq ? 14 : 150} t={t} id={`p-${kind}`} mood={isSq ? (hot > 0.5 ? 'o' : 'smile') : 'smile'}
          sweat={isSq && t > T.stress + 0.3 ? clamp((t - T.stress - 0.3) / 1.4) : 0} look={isSq ? 0.3 : 0} />
        {isSq && crackLen > 0 && (
          <path d={`M160 -210 l 40 -30 l -10 -40 l 45 -25 l -5 -45 l 40 -30`} fill="none" stroke={INK} strokeWidth={8}
            strokeDasharray={400} strokeDashoffset={400 * (1 - crackLen)} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </g>
    );
  };

  return (
    <AbsoluteFill style={{background: 'linear-gradient(#6FC0FF 0%, #BDE6FF 70%, #E3F5FF 100%)'}}>
      <Layer cam={cam} z={3000}><Clouds t={tr} /></Layer>
      <Layer cam={cam} z={1000}>
        {/* A: fuselage close-up */}
        <g>
          <rect x={-300} y={200} width={1680} height={1520} rx={60} fill="#F4F6F8" stroke={INK} strokeWidth={W} />
          {Array.from({length: 6}, (_, i) => <line key={i} x1={-300} y1={360 + i * 260} x2={1380} y2={360 + i * 260} stroke="#D3DAE1" strokeWidth={5} />)}
          <g transform={`translate(${lerp(540, 330, ramp(t, T.square - 0.25, T.square + 0.1))} 960)`}>
            <Win w={300} h={400} r={150} t={t} id="a-round" look={sq > 0.5 ? 0.9 : 0} />
          </g>
          {sq > 0.001 && (
            <g transform={`translate(760 960) scale(${sq})`}>
              <Win w={300} h={400} r={14} t={t} id="a-square" mood="smirk" look={-0.6} />
            </g>
          )}
        </g>
        {/* B: the Comet (1954) */}
        <g>
          {t >= T.year && <g transform={`translate(${B.x - 200} ${B.y - 420}) scale(${pop(t, T.year, 0.3)})`}><Label x={0} y={0} text="1954" size={110} anchor="middle" /></g>}
          {[0, 1].map((half) => {
            const dir = half ? 1 : -1;
            const dx = split > 0 ? dir * (120 * split + 60) : 0, dy = split > 0 ? 260 * split * split : 0, rot = split > 0 ? dir * 22 * split : 0;
            return (
              <g key={half} transform={`translate(${flyX + dx} ${B.y + dy}) rotate(${rot}) scale(0.82)`}>
                <defs><clipPath id={`half${half}`}><rect x={half ? 16 : -700} y={-400} width={716} height={800} /></clipPath></defs>
                <g clipPath={`url(#half${half})`}><Plane style="comet" t={t} /></g>
              </g>
            );
          })}
          {t >= T.crack && t < T.crack + 0.25 && (
            <path d={`M${flyX + 16} ${B.y - 60} l -20 30 l 25 25 l -20 30 l 22 30`} transform={`translate(0 0) scale(1)`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          )}
          {split > 0 && split < 1.6 && (
            <Puffs fill="#9AA3AD" items={[0, 1, 2, 3].map((i) => ({x: flyX + 20 + (rnd(i) - 0.5) * 120, y: B.y - 40 * split * (1 + i * 0.3) + (rnd(i + 4) - 0.5) * 80,
              r: 40 * Math.sin(Math.PI * Math.min(1, split / 1.6)) * (0.6 + rnd(i + 2) * 0.6) + 1}))} />
          )}
        </g>
        {/* C: cabin pressure: the plane inflates, then lets down */}
        <g transform={`translate(${C.x} ${C.y}) scale(${0.86 * (1 + 0.05 * breath)})`}>
          <Plane style="modern" face puff={0.12 * breath + 0.02 * wobble(t, T.deflate + 0.3, 3, 4)} t={t} />
          {breath > 0.05 && [-300, -100, 100].map((x, i) => (
            <g key={i} transform={`translate(${x} 0) scale(${breath})`}>
              <path d="M0 -20 L 0 -70 M -18 -52 L 0 -72 L 18 -52 M0 20 L 0 70 M -18 52 L 0 72 L 18 52" stroke="#FF8A3D" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
        </g>
        {/* D: skin panels, square then round window */}
        {panel(D.x, 'square')}
        {panel(D.x + 2000, 'round')}
        {/* E: modern airliner with round windows */}
        <g transform={`translate(${E.x - 80 + (tr - T.fleet) * 40} ${E.y}) scale(0.95)`}>
          <Plane style="modern" t={tr} wink={1} />
        </g>
      </Layer>
      <Sound voice={TL.voiceFile} voiceStart={TL.voiceStart} cues={cues} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {FPS, clamp, lerp, ramp, pop, wobble, easeOut, easeIn, rnd, timeline} from '../lib/time';
import {Cam, Cue, Layer, Move, Sound, camAt, shaken} from '../lib/stage';
import {BlobFace, INK, Label, Puffs, W} from '../lib/parts';

const TL = timeline(timing);
export const DURATION = TL.DURATION;
const {at, S} = TL;

const T = {
  steak: at(0, 0.35), //          "full of ACID" a steak drops in
  dissolve: at(0, 0.75), //       "break down MEAT" it fizzes away
  worry: S[1].a, //               "Why doesn't it digest ITSELF?"
  coat: at(2, 0.6), //            "it wears a RAINCOAT"
  wall: S[3].a - 0.05, //         cut: the stomach wall up close
  mucus: at(3, 0.22), //          "coated in thick MUCUS"
  bicarb: at(3, 0.55), //         "pump out BICARBONATE"
  soda: at(3, 0.88), //           "BAKING SODA"
  sneak: S[4].a, //               "Any acid that SNEAKS through"
  neutral: at(4, 0.75), //        "gets NEUTRALIZED"
  old1: at(5, 0.35), //           "worn-out lining cells" one pops off
  new1: at(5, 0.55), //           "get REPLACED"
  old2: at(5, 0.75), new2: at(5, 0.92),
  thin: at(6, 0.25), //           "When that shield BREAKS DOWN"
  rush: at(6, 0.5),
  ulcer: at(6, 0.85), //          "you get an ULCER"
  loop: TL.VOICE_END + 0.5,
};

const ST = {x: 540, y: 1000};
const WALL = {x: 5000, y: 1250}; // top of the cell row
const START_S: Cam = {x: 540, y: 980, z: 120};
const MOVES: Move[] = [
  {t0: T.worry - 0.1, t1: T.worry + 0.6, to: {x: 560, y: 1120, z: 300}},
  {t0: S[2].a - 0.1, t1: S[2].a + 0.5, to: START_S},
  {t0: T.wall, t1: T.wall, to: {x: WALL.x, y: WALL.y - 230, z: 250}, cut: true},
  {t0: T.wall + 0.1, t1: T.sneak, to: {x: WALL.x, y: WALL.y - 210, z: 330}},
  {t0: T.sneak, t1: T.neutral + 0.2, to: {x: WALL.x + 60, y: WALL.y - 170, z: 470}},
  {t0: S[5].a - 0.1, t1: S[5].a + 0.6, to: {x: WALL.x, y: WALL.y - 190, z: 340}},
  {t0: T.loop, t1: T.loop, to: START_S, cut: true},
];

// ------------------------------------------------------------------------------------------------ parts
const STOMACH = 'M-250 -330 Q -240 -470 -120 -470 Q -40 -470 -40 -380 Q -40 -300 60 -300 Q 330 -320 330 20 Q 330 330 40 360 Q -220 380 -300 140 Q -360 -60 -250 -330 Z';

const Drop: React.FC<{kind: 'acid' | 'water'; sneaky?: boolean}> = ({kind, sneaky}) => (
  <g strokeLinejoin="round">
    <path d="M0 -34 C 24 -4 26 22 0 24 C -26 22 -24 -4 0 -34 Z" fill={kind === 'acid' ? '#FF5A4E' : '#7CC8FF'} stroke={INK} strokeWidth={6} />
    {kind === 'acid' ? (
      <g stroke={INK} strokeWidth={4} strokeLinecap="round">
        <path d={sneaky ? 'M-12 0 L -3 4 M12 0 L 3 4' : 'M-12 -2 L -3 2 M12 -2 L 3 2'} />
        <circle cx={-7} cy={7} r={3} fill={INK} /><circle cx={7} cy={7} r={3} fill={INK} />
      </g>
    ) : (
      <g><circle cx={-7} cy={3} r={3.5} fill={INK} /><circle cx={7} cy={3} r={3.5} fill={INK} />
        <path d="M-6 11 Q 0 16 6 11" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" /></g>
    )}
  </g>
);

const Cell: React.FC<{mood: 'smile' | 'sleep' | 'o'; sore?: number; band?: boolean}> = ({mood, sore = 0, band}) => (
  <g>
    <rect x={-80} y={0} width={160} height={210} rx={34} fill={sore > 0 ? `rgb(${242},${lerp(165, 90, sore)},${lerp(180, 90, sore)})` : '#F7A9BE'} stroke={INK} strokeWidth={W} />
    <circle cx={0} cy={140} r={26} fill="#D9718C" />
    <g transform="translate(0 70)"><BlobFace r={58} open={mood === 'sleep' ? 0 : 1} mood={mood === 'sleep' ? 'sleep' : mood} /></g>
    {band && <g transform="translate(40 30) rotate(30)"><rect x={-30} y={-10} width={60} height={20} rx={8} fill="#F6D7A7" stroke={INK} strokeWidth={4} /><line x1={-4} y1={-6} x2={-4} y2={6} stroke={INK} strokeWidth={3} /><line x1={4} y1={-6} x2={4} y2={6} stroke={INK} strokeWidth={3} /></g>}
  </g>
);

// ------------------------------------------------------------------------------------------------ composition
export const Stomach: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = frame / FPS;
  const looped = tr >= T.loop;
  const t = looped ? 0 : tr;
  const wallShot = t >= T.wall && t < T.loop;
  let amp = 0;
  if (t >= T.ulcer && t < T.ulcer + 0.5) amp += 10 * Math.exp(-(t - T.ulcer) * 7);
  if (t >= T.coat && t < T.coat + 0.3) amp += 4 * Math.exp(-(t - T.coat) * 10);
  const cam = shaken(camAt(tr, MOVES, START_S), tr, amp);

  // stomach shot
  const slosh = Math.sin(t * 2.6) * 18 + (t >= T.worry && t < T.coat ? Math.sin(t * 7) * 22 : 0);
  const steakY = t < T.steak ? -900 : Math.min(160, -560 + 2400 * (t - T.steak) ** 2);
  const steakS = 1 - ramp(t, T.dissolve, T.dissolve + 0.9, easeIn);
  const coat = t >= T.coat ? pop(t, T.coat, 0.3) : 0;

  // wall shot
  const mucusH = 40 + 170 * ramp(t, T.mucus, T.mucus + 0.6, easeOut) * (1 - 0.0 * 0);
  const gap = ramp(t, T.thin, T.thin + 0.7); // a hole opening in the mucus over cell 3
  const cellsX = [-600, -400, -200, 0, 200, 400, 600];

  const cues: Cue[] = [
    {f: 'gulp', at: T.steak - 0.25, db: -20}, {f: 'plop', at: T.steak + 0.5, db: -19},
    {f: 'sizzle', at: T.dissolve, db: -24},
    {f: 'boing', at: T.worry + 0.2, db: -27},
    {f: 'pop', at: T.coat, db: -20}, {f: 'swish', at: T.coat + 0.05, db: -26},
    {f: 'whoosh', at: T.wall - 0.1, db: -26},
    {f: 'squish', at: T.mucus, db: -23},
    {f: 'bubble', at: T.bicarb, db: -22}, {f: 'bubble', at: T.bicarb + 0.2, db: -23}, {f: 'bubble', at: T.bicarb + 0.45, db: -24},
    {f: 'ding', at: T.soda, db: -25},
    {f: 'swish', at: T.sneak + 0.1, db: -27},
    {f: 'pff', at: T.neutral, db: -20}, {f: 'sparkle', at: T.neutral + 0.05, db: -26},
    {f: 'pop', at: T.old1, db: -22}, {f: 'sparkle', at: T.new1, db: -27}, {f: 'pop', at: T.old2, db: -23}, {f: 'sparkle', at: T.new2, db: -27},
    {f: 'squish', at: T.thin, db: -24}, {f: 'hiss', at: T.rush, db: -25},
    {f: 'thud', at: T.ulcer, db: -16},
  ];

  const sneakU = ramp(t, T.sneak + 0.1, T.neutral);
  const CELL3 = 3; // index of the cell under the hole

  return (
    <AbsoluteFill style={{background: wallShot ? '#FBE3EA' : 'linear-gradient(#FFE4EC 0%, #FFF3F6 100%)'}}>
      <Layer cam={cam} z={2200}>
        {Array.from({length: 40}, (_, i) => (
          <circle key={i} cx={-1500 + rnd(i) * 9000} cy={rnd(i + 40) * 2400} r={20 + rnd(i + 3) * 50} fill="#FFD3DF" opacity={0.6} />
        ))}
      </Layer>
      <Layer cam={cam} z={1000}>
        {!wallShot && (
          <g transform={`translate(${ST.x} ${ST.y}) scale(${1 + 0.03 * Math.sin(tr * 3.6)} ${1 - 0.03 * Math.sin(tr * 3.6)})`} strokeLinejoin="round">
            <path d="M-170 -460 L -150 -900 L -40 -900 L -60 -460 Z" fill="#F49AB0" stroke={INK} strokeWidth={W} />
            <defs><clipPath id="inside"><path d={STOMACH} /></clipPath></defs>
            <path d={STOMACH} fill="#F49AB0" stroke={INK} strokeWidth={W} />
            <g clipPath="url(#inside)">
              <path d={`M-400 ${40 + slosh} Q -200 ${0 - slosh} 0 ${40 + slosh} T 400 ${40 + slosh} L 400 500 L -400 500 Z`} fill="#B6E35A" stroke={INK} strokeWidth={6} />
              {Array.from({length: 8}, (_, i) => {
                const u = ((t * 0.6 + rnd(i)) % 1);
                return <circle key={i} cx={-220 + rnd(i + 3) * 480} cy={330 - u * 260} r={8 + rnd(i + 5) * 10} fill="none" stroke="#7FB52E" strokeWidth={5} opacity={1 - u} />;
              })}
              {steakS > 0.02 && t >= T.steak && (
                <g transform={`translate(${-90} ${steakY}) rotate(${(t - T.steak) * 120}) scale(${steakS})`}>
                  <path d="M-80 -40 Q -20 -80 70 -50 Q 110 0 60 40 Q -20 70 -80 30 Q -110 0 -80 -40 Z" fill="#C8584E" stroke={INK} strokeWidth={W} />
                  <path d="M-40 -20 Q 0 -40 40 -20" fill="none" stroke="#F3D3C8" strokeWidth={10} strokeLinecap="round" />
                </g>
              )}
              {t >= T.dissolve && t < T.dissolve + 1.2 && (
                <Puffs fill="#E8F7C0" items={[0, 1, 2, 3].map((k) => {
                  const u = clamp((t - T.dissolve - k * 0.15) / 0.9);
                  return {x: -90 + (rnd(k) - 0.5) * 140, y: 150 - u * 160, r: 20 * Math.sin(Math.PI * u) + 1};
                })} />
              )}
            </g>
            <path d={STOMACH} fill="none" stroke={INK} strokeWidth={W} />
            {/* raincoat: a yellow coat over the whole body, then the hood */}
            {coat > 0.01 && (
              <g transform={`scale(${1.05 * coat})`}>
                <path d={STOMACH} fill="#FFD23F" stroke={INK} strokeWidth={W} />
                <path d="M40 -40 Q 62 150 30 340" fill="none" stroke={INK} strokeWidth={6} />
                <path d="M-120 -40 Q 40 30 230 -50 L 210 0 Q 40 80 -110 10 Z" fill="#F2B800" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
                {[30, 140, 250].map((y) => <circle key={y} cx={66} cy={y} r={14} fill="#3F7FE0" stroke={INK} strokeWidth={5} />)}
                <path d="M-200 120 L -120 120" stroke={INK} strokeWidth={6} strokeLinecap="round" />
              </g>
            )}
            <g transform="translate(60 -150)">
              <BlobFace r={150} open={t >= 1.6 && t < 1.72 ? 0 : 1} lookY={t >= T.worry && t < T.coat ? 1 : 0} lookX={t >= T.worry && t < T.coat ? -0.5 : 0}
                mood={t >= T.worry && t < T.coat ? 'o' : t >= T.coat ? 'smirk' : 'smile'} />
            </g>
            {t >= T.worry + 0.3 && t < T.coat && (
              <g transform={`translate(260 -420) scale(${pop(t, T.worry + 0.3, 0.3)})`}><Label x={0} y={0} text="?" size={140} anchor="middle" /></g>
            )}
          </g>
        )}
        {wallShot && (
          <g strokeLinejoin="round">
            {/* acid zone */}
            <rect x={WALL.x - 1400} y={WALL.y - 1600} width={2800} height={1600} fill="#E4F6B8" />
            {/* cells */}
            {cellsX.map((dx, i) => {
              const old = (i === 2 && t >= T.old1) || (i === 5 && t >= T.old2);
              const fresh = (i === 2 && t >= T.new1) || (i === 5 && t >= T.new2);
              const oldT = i === 2 ? T.old1 : T.old2, newT = i === 2 ? T.new1 : T.new2;
              if (old && !fresh) {
                const s = t - oldT;
                return <g key={i} transform={`translate(${WALL.x + dx + 200 * s} ${WALL.y + 400 * s * s * 4 + 40 * s}) rotate(${s * 160})`}><Cell mood="sleep" band /></g>;
              }
              const sore = i === CELL3 ? ramp(t, T.ulcer - 0.2, T.ulcer + 0.2) : 0;
              const sc = fresh ? pop(t, newT, 0.3) : 1;
              return (
                <g key={i} transform={`translate(${WALL.x + dx} ${WALL.y}) scale(${sc})`}>
                  <Cell mood={sore > 0.5 ? 'o' : (i === 2 && !fresh) || (i === 5 && !fresh && t > T.old1 - 0.6) ? 'sleep' : 'smile'} sore={sore} band={!fresh && (i === 2 || i === 5)} />
                  {sore > 0.3 && <ellipse cx={0} cy={22} rx={60 * sore} ry={18 * sore} fill="#B8323A" stroke={INK} strokeWidth={5} />}
                </g>
              );
            })}
            {/* mucus gel with a hole opening over cell 3 */}
            <path d={(() => {
              let d = `M${WALL.x - 1400} ${WALL.y}`;
              for (let x = -1400; x <= 1400; x += 40) {
                const hole = gap * Math.max(0, 1 - Math.abs(x - cellsX[CELL3]) / 160);
                const h = mucusH * (1 - hole) + 8 * Math.sin(x * 0.02 + tr * 2);
                d += ` L${WALL.x + x} ${WALL.y - h}`;
              }
              return d + ` L${WALL.x + 1400} ${WALL.y} Z`;
            })()} fill="#BFE6F0" opacity={0.85} stroke={INK} strokeWidth={6} />
            {/* bicarbonate bubbles rising from the cells, staying in the gel */}
            {t >= T.bicarb && cellsX.flatMap((dx, i) => [0, 1].map((k) => {
              const u = ((t - T.bicarb) * 0.7 + rnd(i * 2 + k)) % 1;
              const hole = gap * Math.max(0, 1 - Math.abs(dx - cellsX[CELL3]) / 160);
              if (hole > 0.5) return null;
              return <circle key={`${i}${k}`} cx={WALL.x + dx + (rnd(i + k * 7) - 0.5) * 80} cy={WALL.y - 10 - u * mucusH * 0.85} r={14 * pop(t, T.bicarb + i * 0.05, 0.3)}
                fill="#fff" stroke={INK} strokeWidth={4} />;
            }))}
            {/* acid drops floating above */}
            {Array.from({length: 9}, (_, i) => {
              const x = WALL.x - 600 + i * 150 + Math.sin(tr * 1.3 + i) * 30;
              let y = WALL.y - 400 - (i % 3) * 130 + Math.sin(tr * 2 + i) * 20;
              let px = x;
              if (t >= T.rush && i >= 3 && i <= 5) { const u = ramp(t, T.rush + (i - 3) * 0.12, T.ulcer - 0.1); px = lerp(x, WALL.x + cellsX[CELL3] + (i - 4) * 40, u); y = lerp(y, WALL.y - 30, u); }
              if (t >= T.ulcer + 0.1 && i >= 3 && i <= 5) return null;
              return <g key={i} transform={`translate(${px} ${y}) scale(1.5)`}><Drop kind="acid" /></g>;
            })}
            {/* the sneaky drop that gets neutralized */}
            {t >= T.sneak && t < T.wall + 100 && (
              t < T.neutral
                ? <g transform={`translate(${WALL.x + 100 + Math.sin(t * 9) * 10 * (1 - sneakU)} ${lerp(WALL.y - 460, WALL.y - mucusH * 0.55, sneakU)}) scale(1.7)`}><Drop kind="acid" sneaky /></g>
                : t < S[5].a + 0.2 && <g transform={`translate(${WALL.x + 100} ${WALL.y - mucusH * 0.55 - (t - T.neutral) * 60}) scale(${1.7 * pop(t, T.neutral + 0.1, 0.3)})`}><Drop kind="water" /></g>
            )}
            {t >= T.neutral && t < T.neutral + 0.7 && [0, 1, 2, 3, 4].map((k) => {
              const a = (k / 5) * Math.PI * 2, u = clamp((t - T.neutral) / 0.7);
              return <path key={k} d="M0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill="#FFE07A" stroke={INK} strokeWidth={3}
                transform={`translate(${WALL.x + 100 + Math.cos(a) * (40 + 60 * u)} ${WALL.y - mucusH * 0.55 + Math.sin(a) * (40 + 60 * u)}) scale(${Math.sin(Math.PI * u) * 1.5})`} />;
            })}
            {/* baking soda box */}
            {t >= T.soda && t < S[4].a + 0.4 && (
              <g transform={`translate(${WALL.x + 300} ${WALL.y - 720}) rotate(-8) scale(${pop(t, T.soda, 0.3) * (1 - ramp(t, S[4].a, S[4].a + 0.3, easeIn))})`}>
                <rect x={-120} y={-150} width={240} height={300} rx={14} fill="#FF9F3D" stroke={INK} strokeWidth={W} />
                <rect x={-100} y={-90} width={200} height={120} rx={10} fill="#fff" stroke={INK} strokeWidth={5} />
                <text x={0} y={-40} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={36} fill={INK}>BAKING</text>
                <text x={0} y={5} textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={36} fill={INK}>SODA</text>
              </g>
            )}
          </g>
        )}
      </Layer>
      <Sound voice={TL.voiceFile} voiceStart={TL.voiceStart} cues={cues} />
    </AbsoluteFill>
  );
};

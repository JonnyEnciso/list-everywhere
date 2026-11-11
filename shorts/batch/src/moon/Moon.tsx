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
  year: at(0, 0.8), //            "from over fifty YEARS ago" 1969 label
  face: S[1].a, //                "Why are they still there?" the print opens its eyes
  earth: S[2].a - 0.05, //        cut: footprint on an Earth beach
  wind: at(2, 0.35), //           "WIND and rain"
  gone: at(2, 0.92), //           "wipe them out FAST"
  moon: S[3].a - 0.05, //         back on the Moon
  cloud: at(3, 0.45), //          "so no WIND" a cloud tries to appear
  poof: at(3, 0.9), //            "no RAIN" it gasps and poofs
  rocks: at(4, 0.5), //           "a slow drizzle of tiny SPACE ROCKS"
  years: at(5, 0.35), //          "tens of THOUSANDS of years" time-lapse
  wait: S[6].a, //                "just sitting there, WAITING"
  loop: TL.VOICE_END + 0.5,
};

const PRINT = {x: 560, y: 1330};
const BEACH = {x: 5000, y: 1330};
const START_M: Cam = {x: 560, y: 1180, z: 360};
const MOVES: Move[] = [
  {t0: 0.4, t1: S[0].b, to: {x: 560, y: 1000, z: 60}},
  {t0: T.face - 0.1, t1: T.face + 0.5, to: {x: 560, y: 1220, z: 380}},
  {t0: T.earth, t1: T.earth, to: {x: BEACH.x, y: BEACH.y - 160, z: 300}, cut: true},
  {t0: T.moon, t1: T.moon, to: {x: 560, y: 1080, z: 160}, cut: true},
  {t0: T.rocks - 0.4, t1: T.rocks + 0.5, to: {x: 560, y: 1200, z: 330}},
  {t0: T.years - 0.2, t1: T.years + 0.8, to: {x: 560, y: 980, z: 40}},
  {t0: T.wait, t1: T.wait + 0.8, to: {x: 560, y: 1220, z: 380}},
  {t0: T.loop, t1: T.loop, to: START_M, cut: true},
];

// ------------------------------------------------------------------------------------------------ parts
const BOOT = 'M-70 -190 Q -78 -230 -30 -236 Q 40 -240 64 -200 Q 84 -150 76 -40 Q 70 20 52 50 L 50 150 Q 46 200 0 204 Q -48 204 -52 150 L -56 50 Q -84 0 -82 -90 Z';
const Footprint: React.FC<{depth?: number; face?: number; mood?: 'smile' | 'smirk' | 'o' | 'sleep'; look?: number; pits?: number; id: string}> =
  ({depth = 1, face = 0, mood = 'smile', look = 0, pits = 0, id}) => (
    <g opacity={1} strokeLinejoin="round">
      <path d={BOOT} fill={`rgb(${lerp(185, 120, depth)},${lerp(185, 120, depth)},${lerp(192, 130, depth)})`} stroke={depth > 0.2 ? '#6E6E78' : 'none'} strokeWidth={8} />
      <defs><clipPath id={`boot-${id}`}><path d={BOOT} /></clipPath></defs>
      <g clipPath={`url(#boot-${id})`} opacity={depth}>
        {Array.from({length: 8}, (_, i) => <path key={i} d={`M-90 ${-200 + i * 52} L 0 ${-172 + i * 52} L 90 ${-200 + i * 52}`} fill="none" stroke="#5E5E68" strokeWidth={14} />)}
        <path d="M-80 -200 Q -90 0 -50 200" fill="none" stroke="#4F4F59" strokeWidth={24} opacity={0.5} />
        {Array.from({length: Math.round(pits * 14)}, (_, i) => <circle key={`p${i}`} cx={(rnd(i) - 0.5) * 140} cy={(rnd(i + 30) - 0.5) * 400} r={4 + rnd(i + 9) * 5} fill="#A9A9B2" />)}
      </g>
      {face > 0.01 && <g transform={`translate(0 -40) scale(${face})`}><BlobFace r={90} open={mood === 'sleep' ? 0 : 1} mood={mood} lookX={look} /></g>}
    </g>
  );

const Lander: React.FC = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {[-110, 110].map((x) => <path key={x} d={`M${x * 0.5} -60 L ${x} 40 M${x - 22} 40 L ${x + 22} 40`} stroke={INK} strokeWidth={12} />)}
    <rect x={-80} y={-120} width={160} height={70} rx={8} fill="#E8B640" stroke={INK} strokeWidth={W} />
    <path d="M-60 -120 L -70 -200 L 70 -200 L 60 -120 Z" fill="#DADDE2" stroke={INK} strokeWidth={W} />
    <rect x={-22} y={-182} width={44} height={36} rx={6} fill="#2F3A4A" />
  </g>
);

// ------------------------------------------------------------------------------------------------ composition
export const Moon: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = frame / FPS;
  const looped = tr >= T.loop;
  const t = looped ? 0 : tr;
  const earthShot = t >= T.earth && t < T.moon;
  const cam = shaken(camAt(tr, MOVES, START_M), tr, 0);

  const face = t >= T.face ? pop(t, T.face, 0.3) : 0;
  const lapse = ramp(t, T.years, S[5].b, (u) => u); // time-lapse progress
  const pits = 0.25 * ramp(t, T.rocks, S[5].a) + 0.35 * lapse;
  const mood: 'smile' | 'smirk' | 'o' | 'sleep' = t >= T.wait + 0.8 ? 'sleep' : t >= T.cloud && t < T.poof + 0.4 ? 'o' : t >= T.years ? 'smirk' : 'smile';
  const years = Math.round(lerp(0, 10000, ramp(t, T.years, T.years + 1.6, easeOut)) / 100) * 100;

  // Earth beach: wind + rain erase the print fast
  const erode = ramp(t, T.wind + 0.3, T.gone, (u) => u);

  const cues: Cue[] = [
    {f: 'ding', at: T.year, db: -26},
    {f: 'pop', at: T.face, db: -24}, {f: 'boing', at: T.face + 0.2, db: -28},
    {f: 'whoosh', at: T.earth - 0.1, db: -27},
    {f: 'whoosh', at: T.wind, db: -20}, {f: 'hiss', at: T.wind + 0.3, db: -22}, {f: 'rumble', at: T.wind + 0.1, db: -24},
    {f: 'whoosh', at: T.moon - 0.1, db: -27},
    {f: 'pop', at: T.cloud, db: -24}, {f: 'pff', at: T.poof, db: -19},
    ...Array.from({length: 8}, (_, i) => ({f: 'tick', at: T.rocks + i * 0.42, db: -24})),
    {f: 'sparkle', at: T.years, db: -26}, {f: 'tick', at: T.years + 0.3, db: -28},
    {f: 'chime', at: T.wait + 0.8, db: -28},
  ];

  if (earthShot) {
    return (
      <AbsoluteFill style={{background: 'linear-gradient(#7DC6FF 0%, #CFEFFF 100%)'}}>
        <Layer cam={cam} z={1000}>
          <rect x={BEACH.x - 1500} y={BEACH.y - 420} width={3000} height={2000} fill="#F2D29B" stroke={INK} strokeWidth={W} />
          {Array.from({length: 40}, (_, i) => <circle key={i} cx={BEACH.x - 1400 + rnd(i) * 2800} cy={BEACH.y - 380 + rnd(i + 9) * 1200} r={4 + rnd(i + 2) * 5} fill="#D9B676" />)}
          <g transform={`translate(${BEACH.x} ${BEACH.y}) rotate(-8) scale(${1 - 0.15 * erode})`}>
            <Footprint id="beach" depth={1 - erode} />
          </g>
          {/* wind gusts */}
          {t >= T.wind && [0, 1, 2, 3, 4].map((k) => {
            const u = ((t - T.wind) * 1.4 + k * 0.2) % 1;
            const y = BEACH.y - 350 + k * 150;
            return <path key={k} d={`M${BEACH.x - 700 + u * 1300} ${y} q 120 -40 240 0 q 60 20 40 -40`} fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={Math.sin(Math.PI * u)} />;
          })}
          {/* rain cloud */}
          {t >= T.wind && (
            <g transform={`translate(${BEACH.x + 120} ${BEACH.y - 640}) scale(${pop(t, T.wind, 0.3)})`}>
              {Array.from({length: 14}, (_, k) => {
                const u = ((t * 2.2 + rnd(k)) % 1);
                return <line key={k} x1={-200 + rnd(k + 4) * 400} y1={40 + u * 600} x2={-210 + rnd(k + 4) * 400} y2={70 + u * 600} stroke="#4FA3FF" strokeWidth={9} strokeLinecap="round" />;
              })}
              <Puffs fill="#9AA6B4" items={[{x: -150, y: 0, r: 80}, {x: -40, y: -50, r: 105}, {x: 90, y: -20, r: 95}, {x: 190, y: 20, r: 70}, {x: 20, y: 40, r: 80}]} />
              <g transform="translate(20 -10)"><BlobFace r={90} open={1} mood="smirk" lookY={1} /></g>
            </g>
          )}
        </Layer>
        <Sound voice={TL.voiceFile} voiceStart={TL.voiceStart} cues={cues} />
      </AbsoluteFill>
    );
  }

  // stars rotate during the time-lapse, Earth arcs across the sky
  const starRot = lapse * 160;
  const earthPos = {x: lerp(820, 250, lapse), y: lerp(330, 380, lapse) - Math.sin(Math.PI * lapse) * 120};
  return (
    <AbsoluteFill style={{background: '#0E1424'}}>
      <AbsoluteFill>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <g transform={`rotate(${starRot} 540 1400)`}>
            {Array.from({length: 90}, (_, i) => <circle key={i} cx={-600 + rnd(i) * 2300} cy={-600 + rnd(i + 90) * 2200} r={1.5 + rnd(i + 7) * 3} fill="#fff" opacity={0.4 + 0.5 * rnd(i + 3)} />)}
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <g transform={`translate(${earthPos.x} ${earthPos.y})`}>
            <circle cx={0} cy={0} r={95} fill="#3F8FE0" stroke={INK} strokeWidth={9} />
            <path d="M-58 -38 Q -26 -70 13 -51 Q 26 -19 -6 -6 Q -38 13 -58 -38 Z M19 26 Q 58 13 70 38 Q 51 70 26 58 Z" fill="#6CC46A" stroke={INK} strokeWidth={6} />
            <path d="M-95 0 A 95 95 0 0 0 95 0 A 95 38 0 0 1 -95 0 Z" fill="#000" opacity={0.25} />
          </g>
        </svg>
      </AbsoluteFill>
      <Layer cam={cam} z={1800}>
        <path d="M-2500 860 Q -1200 800 0 850 Q 1300 900 2800 840 L 2800 3000 L -2500 3000 Z" fill="#9E9EA8" stroke={INK} strokeWidth={14} />
        <g transform="translate(-160 860) scale(2.3)"><Lander /></g>
        <g transform="translate(420 860) scale(1.9)">
          <line x1={0} y1={0} x2={0} y2={-260} stroke={INK} strokeWidth={10} />
          <rect x={0} y={-260} width={150} height={96} fill="#fff" stroke={INK} strokeWidth={7} />
          <rect x={0} y={-260} width={64} height={52} fill="#3F7FE0" />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={0} y1={-196 + k * 16} x2={150} y2={-196 + k * 16} stroke="#E8343B" strokeWidth={8} />)}
          <rect x={0} y={-260} width={150} height={96} fill="none" stroke={INK} strokeWidth={7} />
        </g>
      </Layer>
      <Layer cam={cam} z={1000}>
        <path d="M-2500 900 Q -800 860 600 900 Q 1800 940 3000 880 L 3000 3200 L -2500 3200 Z" fill="#B9B9C2" stroke={INK} strokeWidth={W} />
        {[[120, 1050, 90], [930, 1180, 120], [230, 1700, 70], [880, 1660, 60], [-80, 1350, 110]].map(([x, y, r], i) => (
          <g key={i}><ellipse cx={x} cy={y} rx={r} ry={r * 0.35} fill="#A3A3AC" stroke={INK} strokeWidth={7} /><ellipse cx={x} cy={y - r * 0.08} rx={r * 0.8} ry={r * 0.22} fill="#8F8F99" /></g>
        ))}
        {/* trail of prints */}
        {[[300, 1000, -14, 0.45], [430, 1150, -8, 0.6]].map(([x, y, r, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><Footprint id={`trail${i}`} pits={pits} /></g>
        ))}
        <g transform={`translate(${PRINT.x} ${PRINT.y}) rotate(-6) scale(${0.9 + 0.02 * Math.sin(tr * 2)} 0.9)`}>
          <Footprint id="hero" face={face} mood={mood} look={t >= T.cloud && t < T.poof ? 0.8 : 0} pits={pits} depth={1 - 0.12 * lapse} />
        </g>
        {/* the cloud that can't exist here */}
        {t >= T.cloud && t < T.poof + 0.5 && (
          <g transform={`translate(${PRINT.x + 230} ${PRINT.y - 420})`}>
            {t < T.poof ? (
              <g transform={`scale(${pop(t, T.cloud, 0.3) * (1 - 0.15 * Math.sin((t - T.cloud) * 18) * ramp(t, T.poof - 0.4, T.poof))})`}>
                <Puffs fill="#fff" items={[{x: -70, y: 0, r: 55}, {x: 0, y: -30, r: 72}, {x: 80, y: 0, r: 55}, {x: 10, y: 25, r: 50}]} />
                <BlobFace r={70} open={1} mood={t > T.poof - 0.5 ? 'o' : 'smile'} lookX={-0.5} />
              </g>
            ) : (
              <Puffs fill="#fff" items={[0, 1, 2, 3, 4, 5].map((k) => {
                const a = (k / 6) * Math.PI * 2, u = clamp((t - T.poof) / 0.5);
                return {x: Math.cos(a) * 90 * u, y: Math.sin(a) * 60 * u, r: 26 * (1 - u) + 1};
              })} />
            )}
          </g>
        )}
        {/* micrometeorites: a slow drizzle of specks, little puffs where they land */}
        {t >= T.rocks - 0.3 && Array.from({length: 18}, (_, i) => {
          const period = 1.4, born = T.rocks - 0.3 + (i * 0.27) % period + Math.floor(i / 6) * 0.1;
          const age = t - born;
          if (age < 0) return null;
          const u = (age % period) / period;
          const x = PRINT.x - 300 + rnd(i) * 600, y1 = PRINT.y - 250 + rnd(i + 5) * 500;
          if (u < 0.7) {
            const v = u / 0.7;
            return <g key={i}><line x1={x + 60 * (1 - v) + 18} y1={y1 - 700 * (1 - v) - 40} x2={x + 60 * (1 - v)} y2={y1 - 700 * (1 - v)} stroke="#FFE07A" strokeWidth={4} strokeLinecap="round" />
              <circle cx={x + 60 * (1 - v)} cy={y1 - 700 * (1 - v)} r={6} fill="#C9CAD2" stroke={INK} strokeWidth={3} /></g>;
          }
          const w = (u - 0.7) / 0.3;
          return <circle key={i} cx={x} cy={y1} r={4 + 22 * w} fill="none" stroke="#E6E6EC" strokeWidth={6 * (1 - w)} />;
        })}
        {t >= T.year && t < T.face + 0.2 && (
          <g transform={`translate(${PRINT.x} ${PRINT.y - 420}) scale(${pop(t, T.year, 0.3) * (1 - ramp(t, T.face, T.face + 0.2, easeIn))})`}><Label x={0} y={0} text="1969" size={110} anchor="middle" /></g>
        )}
        {t >= T.face + 0.3 && t < T.earth && (
          <g transform={`translate(${PRINT.x + 200} ${PRINT.y - 270}) scale(${pop(t, T.face + 0.3, 0.3)})`}><Label x={0} y={0} text="?" size={150} anchor="middle" /></g>
        )}
        {t >= T.years && t < T.wait + 0.4 && (
          <g transform={`translate(${PRINT.x} ${PRINT.y - 640}) scale(${pop(t, T.years, 0.3) * (1 - ramp(t, T.wait + 0.1, T.wait + 0.4, easeIn))})`}>
            <Label x={0} y={0} text={`${years.toLocaleString('en-US')}+ years`} size={80} anchor="middle" color="#FFE07A" />
          </g>
        )}
        {t >= T.wait + 0.8 && [0, 1, 2].map((k) => {
          const u = ((t - T.wait - 0.8) * 0.8 + k / 3) % 1;
          return <g key={k} transform={`translate(${PRINT.x + 110 + u * 120} ${PRINT.y - 200 - u * 220}) scale(${0.6 + u * 0.6})`} opacity={Math.sin(Math.PI * u)}>
            <Label x={0} y={0} text="z" size={70} anchor="middle" /></g>;
        })}
      </Layer>
      <Sound voice={TL.voiceFile} voiceStart={TL.voiceStart} cues={cues} />
    </AbsoluteFill>
  );
};

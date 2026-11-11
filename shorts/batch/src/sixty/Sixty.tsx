import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {FPS, clamp, lerp, ramp, pop, wobble, easeOut, easeIn, rnd, timeline} from '../lib/time';
import {Cam, Cue, Layer, Move, Sound, camAt, shaken} from '../lib/stage';
import {BlobFace, Guy, INK, Label, Puffs, W} from '../lib/parts';

const TL = timeline(timing);
export const DURATION = TL.DURATION;
const {at, S} = TL;

const T = {
  sixtyL: at(0, 0.45), //         "SIXTY minutes"
  hundredL: at(0, 0.9), //        "not a HUNDRED?"
  ancient: S[1].a - 0.05, //      cut: Mesopotamia, bearded guy
  years: at(1, 0.6), //           "over four THOUSAND years ago"
  tablet: S[2].a - 0.05, //       "The Sumerians and Babylonians counted in sixties" clay tablet
  wedges: at(2, 0.3),
  sixtyT: at(2, 0.88),
  pie: S[3].a - 0.05, //          60-dot circle
  d2: at(3, 0.3), d3: at(3, 0.45), d4: at(3, 0.6), d5: at(3, 0.78), d10: at(3, 0.95),
  hundred: S[4].a - 0.05, //      100-dot circle split into thirds: one dot left over
  third: at(4, 0.55),
  stars: S[5].a - 0.05, //        "Later, ASTRONOMERS..."
  time: at(5, 0.75), //           "...to divide up TIME" the sky circle becomes a clock dial
  clock: S[6].a - 0.05, //        back to the clock: shrug
  shrug: at(6, 0.15),
  check: at(6, 0.85), //          "every time we check a CLOCK" wink + tick
  loop: TL.VOICE_END + 0.5,
};

const CLOCK = {x: 540, y: 900, r: 330};
const ANC = {x: 5000, y: 1300};
const TAB = {x: 9000, y: 960};
const PIE = {x: 13000, y: 960};
const SKY = {x: 17000, y: 960};
const START_X: Cam = {x: 540, y: 960, z: 80};
const MOVES: Move[] = [
  {t0: T.ancient, t1: T.ancient, to: {x: ANC.x, y: ANC.y - 330, z: 200}, cut: true},
  {t0: T.ancient + 0.1, t1: T.tablet - 0.1, to: {x: ANC.x + 30, y: ANC.y - 320, z: 300}},
  {t0: T.tablet, t1: T.tablet, to: {x: TAB.x, y: TAB.y, z: 100}, cut: true},
  {t0: T.tablet + 0.1, t1: T.pie - 0.1, to: {x: TAB.x, y: TAB.y, z: 220}},
  {t0: T.pie, t1: T.pie, to: {x: PIE.x, y: PIE.y, z: 60}, cut: true},
  {t0: T.hundred, t1: T.hundred, to: {x: PIE.x + 4000, y: PIE.y, z: 60}, cut: true},
  {t0: T.stars, t1: T.stars, to: {x: SKY.x + 4000, y: SKY.y, z: 0}, cut: true},
  {t0: T.stars + 0.1, t1: T.clock - 0.1, to: {x: SKY.x + 4000, y: SKY.y - 60, z: 160}},
  {t0: T.clock, t1: T.clock, to: START_X, cut: true},
];

// ------------------------------------------------------------------------------------------------ parts
const Clock: React.FC<{t: number; shrug: number; wink: number; mood: 'smile' | 'smirk' | 'o'; minute: number}> = ({t, shrug, wink, mood, minute}) => {
  const r = CLOCK.r;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* shrugging arms */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${s * r * 0.92} ${r * 0.2} Q ${s * (r + 110)} ${r * 0.1 - 140 * shrug} ${s * (r + 70)} ${-60 - 160 * shrug}`} fill="none" stroke={INK} strokeWidth={26} />
          <path d={`M${s * r * 0.92} ${r * 0.2} Q ${s * (r + 110)} ${r * 0.1 - 140 * shrug} ${s * (r + 70)} ${-60 - 160 * shrug}`} fill="none" stroke="#fff" strokeWidth={12} />
          <circle cx={s * (r + 70)} cy={-60 - 160 * shrug} r={22} fill="#fff" stroke={INK} strokeWidth={8} />
        </g>
      ))}
      <circle cx={0} cy={0} r={r + 34} fill="#E2463F" stroke={INK} strokeWidth={W} />
      <circle cx={0} cy={0} r={r} fill="#FFF8EC" stroke={INK} strokeWidth={W} />
      {Array.from({length: 60}, (_, i) => {
        const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
        return <line key={i} x1={Math.sin(a) * (r - 14)} y1={-Math.cos(a) * (r - 14)} x2={Math.sin(a) * (r - (big ? 52 : 30))} y2={-Math.cos(a) * (r - (big ? 52 : 30))}
          stroke={INK} strokeWidth={big ? 10 : 5} />;
      })}
      <g transform={`translate(0 ${r * 0.28})`}><BlobFace r={r * 0.6} open={wink > 0.5 ? 0.2 : 1} mood={mood} /></g>
      <line x1={0} y1={0} x2={Math.sin(minute) * (r - 70)} y2={-Math.cos(minute) * (r - 70)} stroke={INK} strokeWidth={14} />
      <line x1={0} y1={0} x2={Math.sin(minute / 12 + 1.9) * (r - 150)} y2={-Math.cos(minute / 12 + 1.9) * (r - 150)} stroke={INK} strokeWidth={20} />
      <circle cx={0} cy={0} r={18} fill="#E2463F" stroke={INK} strokeWidth={6} />
    </g>
  );
};

/** n dots on a ring, split into `parts` coloured sectors; leftover = dots cut by a boundary pop out */
const DotRing: React.FC<{n: number; parts: number; t: number; t0: number; leftover?: boolean; lift?: number}> = ({n, parts, t, t0, leftover, lift = 0}) => {
  const R = 330;
  const cols = ['#FFB547', '#7CC8FF', '#9BE07A', '#F7A9BE', '#C8A6F2', '#FFE07A', '#8FE3D6', '#FF9F3D', '#B5C3FF', '#FFD0A8'];
  const per = n / parts;
  const grow = pop(t, t0, 0.3);
  return (
    <g strokeLinejoin="round">
      <circle cx={0} cy={0} r={R + 60} fill="#FFFDF7" stroke={INK} strokeWidth={W} />
      {parts > 1 && Array.from({length: parts}, (_, k) => {
        const a = (k / parts) * Math.PI * 2;
        return <line key={k} x1={0} y1={0} x2={Math.sin(a) * (R + 60) * grow} y2={-Math.cos(a) * (R + 60) * grow} stroke={INK} strokeWidth={8} strokeDasharray="20 12" />;
      })}
      {Array.from({length: n}, (_, i) => {
        const a = ((i + 0.5) / n) * Math.PI * 2;
        const sector = Math.floor((i + 0.5) / per);
        const cutDot = leftover && i === n - 1; // 33 + 33 + 33 = 99: the 100th dot has nowhere to go
        const pr = n > 80 ? 11 : 15;
        const dx = cutDot ? lift * 140 : 0, dy = cutDot ? -lift * 40 : 0;
        return (
          <g key={i} transform={`translate(${Math.sin(a) * R + dx} ${-Math.cos(a) * R + dy}) scale(${cutDot ? 1 + lift * 2.6 : 1})`}>
            <circle cx={0} cy={0} r={pr} fill={cutDot ? '#FF6B5E' : parts > 1 ? cols[sector % cols.length] : '#FFB547'} stroke={INK} strokeWidth={4} />
            {cutDot && lift > 0.3 && <g><circle cx={-4} cy={-2} r={2} fill={INK} /><circle cx={4} cy={-2} r={2} fill={INK} /><path d="M-5 6 Q 0 2 5 6" fill="none" stroke={INK} strokeWidth={1.8} /></g>}
          </g>
        );
      })}
    </g>
  );
};

const Beard: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-48 -214 Q -60 -120 6 -96 Q 72 -120 62 -214 Q 40 -180 6 -186 Q -24 -180 -48 -214 Z" fill="#5B3A29" stroke={INK} strokeWidth={W} />
    <path d="M-60 -282 Q 6 -300 72 -282" fill="none" stroke="#3F7FE0" strokeWidth={18} strokeLinecap="round" />
  </g>
);

// ------------------------------------------------------------------------------------------------ composition
export const Sixty: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = frame / FPS;
  const looped = tr >= T.loop;
  const t = looped ? 0 : tr;
  const cam = shaken(camAt(tr, MOVES, START_X), tr, 0);

  const steps: [number, number][] = [[T.d2, 2], [T.d3, 3], [T.d4, 4], [T.d5, 5], [T.d10, 10]];
  let parts = 1, partT = T.pie;
  for (const [st, n] of steps) if (t >= st) { parts = n; partT = st; }
  const lift = ramp(t, T.third + 0.25, T.third + 0.75, easeOut);
  const shrug = t >= T.shrug ? Math.max(0, Math.sin(Math.min(1, (t - T.shrug) / 1.4) * Math.PI)) : 0;
  const ticks = Math.floor(Math.max(0, tr - T.check) * 1) + (t >= T.check ? 1 : 0);
  const minute = 0.7 + (ticks * Math.PI * 2) / 60;

  const cues: Cue[] = [
    {f: 'tick', at: 0.6, db: -24}, {f: 'tick', at: 1.6, db: -24}, {f: 'tick', at: 2.6, db: -24},
    {f: 'pop', at: T.sixtyL, db: -22}, {f: 'pop', at: T.hundredL, db: -22}, {f: 'boing', at: T.hundredL + 0.1, db: -28},
    {f: 'whoosh', at: T.ancient - 0.1, db: -26}, {f: 'ding', at: T.years, db: -26},
    {f: 'whoosh', at: T.tablet - 0.1, db: -27},
    ...Array.from({length: 6}, (_, i) => ({f: 'chk', at: T.wedges + i * 0.22, db: -24})),
    {f: 'chime', at: T.sixtyT, db: -25},
    {f: 'whoosh', at: T.pie - 0.1, db: -27},
    ...steps.map(([st]) => ({f: 'swish', at: st, db: -25})), ...steps.map(([st]) => ({f: 'ding', at: st + 0.12, db: -29})),
    {f: 'whoosh', at: T.hundred - 0.1, db: -27}, {f: 'swish', at: T.third, db: -25}, {f: 'boing', at: T.third + 0.3, db: -21},
    {f: 'whoosh', at: T.stars - 0.1, db: -27}, {f: 'sparkle', at: T.stars + 0.3, db: -27}, {f: 'chime', at: T.time, db: -26},
    {f: 'whoosh', at: T.clock - 0.1, db: -27}, {f: 'boing', at: T.shrug + 0.1, db: -24},
    {f: 'tick', at: T.check, db: -20}, {f: 'tick', at: T.check + 1, db: -21}, {f: 'tick', at: T.check + 2, db: -22},
  ];

  const ancient = t >= T.ancient && t < T.tablet;
  const night = t >= T.stars && t < T.clock;
  const bg = night ? '#14203A' : ancient ? 'linear-gradient(#FFC979 0%, #FFE7B8 100%)' : t >= T.tablet && t < T.stars ? '#FFF3DE' : 'linear-gradient(#DDF1FF 0%, #F4FAFF 100%)';

  return (
    <AbsoluteFill style={{background: bg}}>
      {night && (
        <AbsoluteFill>
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            {Array.from({length: 110}, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 200) * 1920} r={1.5 + rnd(i + 9) * 3.5} fill="#fff" opacity={0.4 + 0.5 * rnd(i + 2)} />)}
          </svg>
        </AbsoluteFill>
      )}
      {ancient && (
        <Layer cam={cam} z={2000}>
          <g transform={`translate(${ANC.x + 300} ${ANC.y - 60})`} strokeLinejoin="round">
            {[0, 1, 2, 3].map((k) => <rect key={k} x={-420 + k * 90} y={-170 - k * 150} width={840 - k * 180} height={170} fill={k % 2 ? '#D9A35B' : '#C98A4B'} stroke={INK} strokeWidth={14} />)}
            <rect x={-40} y={-260} width={80} height={260} fill="#8E5E3A" stroke={INK} strokeWidth={10} />
          </g>
          {[-900, 1300].map((dx, i) => (
            <g key={i} transform={`translate(${ANC.x + dx} ${ANC.y - 40})`} strokeLinecap="round">
              <path d="M0 0 Q 20 -260 0 -520" stroke={INK} strokeWidth={34} fill="none" />
              <path d="M0 0 Q 20 -260 0 -520" stroke="#A5713F" strokeWidth={20} fill="none" />
              {[-60, -20, 20, 60, 100].map((a) => <path key={a} d={`M0 -520 q ${Math.sin(a * Math.PI / 180) * 180} -60 ${Math.sin(a * Math.PI / 180) * 300} 40`} stroke="#4FA94D" strokeWidth={30} fill="none" />)}
            </g>
          ))}
        </Layer>
      )}
      <Layer cam={cam} z={1000}>
        {/* clock shot */}
        {(t < T.ancient || t >= T.clock) && (
          <g>
            <g transform={`translate(${CLOCK.x} ${CLOCK.y}) scale(${1 + 0.015 * Math.sin(tr * 3.3)})`}>
              <Clock t={t} shrug={shrug} wink={t >= T.check + 0.3 && t < T.check + 0.6 ? 1 : 0} mood={t >= T.shrug && t < T.check ? 'o' : t >= T.check ? 'smirk' : 'smile'} minute={minute} />
            </g>
            {t >= T.sixtyL && t < T.ancient && <g transform={`translate(${CLOCK.x - 250} ${CLOCK.y + 560}) scale(${pop(t, T.sixtyL, 0.3)})`}><Label x={0} y={0} text="60" size={170} anchor="middle" color="#9BE07A" /></g>}
            {t >= T.hundredL && t < T.ancient && <g transform={`translate(${CLOCK.x + 230} ${CLOCK.y + 560}) scale(${pop(t, T.hundredL, 0.3)})`}><Label x={0} y={0} text="100?" size={170} anchor="middle" color="#FF9F3D" /></g>}
            {t >= T.shrug + 0.2 && t < T.check && <g transform={`translate(${CLOCK.x + 280} ${CLOCK.y - 440}) scale(${pop(t, T.shrug + 0.2, 0.3)})`}><Label x={0} y={0} text="?" size={190} anchor="middle" /></g>}
          </g>
        )}
        {/* ancient Mesopotamia */}
        {ancient && (
          <g>
            <rect x={ANC.x - 1500} y={ANC.y - 40} width={3000} height={1400} fill="#E9C37E" stroke={INK} strokeWidth={W} />
            <g transform={`translate(${ANC.x - 80} ${ANC.y}) scale(1.4)`}>
              <Guy face="smile" breathe={Math.sin(tr * 3.8)} handF={{x: 70, y: -150}} handB={{x: -50, y: -100}} />
              <Beard />
              <g transform="translate(92 -170) rotate(8)">
                <rect x={-40} y={-56} width={80} height={110} rx={14} fill="#C98A4B" stroke={INK} strokeWidth={W} />
                {[0, 1, 2].map((r) => <path key={r} d={`M-22 ${-32 + r * 28} l 10 8 l 10 -8 M8 ${-32 + r * 28} l 10 8`} stroke={INK} strokeWidth={5} fill="none" />)}
              </g>
            </g>
            {t >= T.years && <g transform={`translate(${ANC.x + 120} ${ANC.y - 760}) scale(${pop(t, T.years, 0.3)})`}><Label x={0} y={0} text="4,000+ years ago" size={84} anchor="middle" /></g>}
          </g>
        )}
        {/* clay tablet with wedges */}
        {t >= T.tablet && t < T.pie && (
          <g transform={`translate(${TAB.x} ${TAB.y})`} strokeLinejoin="round">
            <rect x={-330} y={-420} width={660} height={760} rx={70} fill="#C98A4B" stroke={INK} strokeWidth={W} />
            <rect x={-290} y={-380} width={580} height={680} rx={50} fill="#D9A35B" />
            {Array.from({length: 6}, (_, i) => {
              const row = Math.floor(i / 3), col = i % 3, s = pop(t, T.wedges + i * 0.22, 0.2);
              return <g key={i} transform={`translate(${-170 + col * 170} ${-230 + row * 190}) scale(${s})`}>
                <path d="M-34 -50 L 34 -50 L 0 -30 Z M0 -30 L 0 60" stroke={INK} strokeWidth={14} fill="#8E5E3A" strokeLinecap="round" />
              </g>;
            })}
            {t >= T.sixtyT && <g transform={`translate(0 230) scale(${pop(t, T.sixtyT, 0.3)})`}><Label x={0} y={30} text="60" size={150} anchor="middle" color="#FFE07A" /></g>}
          </g>
        )}
        {/* 60 dots: halves, thirds, quarters, fifths, tenths */}
        {t >= T.pie && t < T.hundred && (
          <g>
            <g transform={`translate(${PIE.x} ${PIE.y})`}><DotRing n={60} parts={parts} t={t} t0={partT} /></g>
            <g transform={`translate(${PIE.x} ${PIE.y}) scale(${t >= T.d2 ? 1 + 0.2 * Math.max(0, wobble(t, partT, 3, 6)) : 0})`}>
              {t >= T.d2 && <Label x={0} y={30} text={`÷${parts}`} size={110} anchor="middle" />}
            </g>
            {t >= T.d2 && <g transform={`translate(${PIE.x} ${PIE.y + 560})`}><Label x={0} y={0} text={`${60 / parts} each`} size={90} anchor="middle" color="#9BE07A" /></g>}
            <g transform={`translate(${PIE.x} ${PIE.y - 520})`}><Label x={0} y={0} text="60" size={130} anchor="middle" color="#FFB547" /></g>
          </g>
        )}
        {/* 100 dots: thirds don't work */}
        {t >= T.hundred && t < T.stars && (
          <g>
            <g transform={`translate(${PIE.x + 4000} ${PIE.y})`}><DotRing n={100} parts={t >= T.third ? 3 : 1} t={t} t0={T.third} leftover lift={lift} /></g>
            <g transform={`translate(${PIE.x + 4000} ${PIE.y - 520})`}><Label x={0} y={0} text="100" size={130} anchor="middle" color="#FF9F3D" /></g>
            {t >= T.third && <g transform={`translate(${PIE.x + 4000} ${PIE.y + 30})`}><Label x={0} y={0} text="÷3" size={110} anchor="middle" /></g>}
            {lift > 0.5 && <g transform={`translate(${PIE.x + 4000} ${PIE.y + 560}) scale(${pop(t, T.third + 0.6, 0.3)})`}><Label x={0} y={0} text="33 + 33 + 33 + 1" size={80} anchor="middle" color="#FF6B5E" /></g>}
          </g>
        )}
        {/* astronomer under the stars; the sky circle becomes a dial */}
        {night && (
          <g>
            <rect x={SKY.x + 2500} y={SKY.y + 420} width={3000} height={1200} fill="#2B3A5A" stroke={INK} strokeWidth={W} />
            <g transform={`translate(${SKY.x + 3700} ${SKY.y + 430}) scale(1.3)`}>
              <Guy face="smile" breathe={Math.sin(tr * 3.8)} handF={{x: 74, y: -190}} handB={{x: 20, y: -150}} look={1} />
              <Beard />
              <g transform="translate(70 -200) rotate(-35)">
                <rect x={-20} y={-24} width={240} height={48} rx={10} fill="#C98A4B" stroke={INK} strokeWidth={W} />
                <rect x={200} y={-34} width={40} height={68} rx={8} fill="#8E5E3A" stroke={INK} strokeWidth={W} />
              </g>
            </g>
            <g transform={`translate(${SKY.x + 4150} ${SKY.y - 420})`}>
              <circle cx={0} cy={0} r={300} fill="none" stroke="#FFE07A" strokeWidth={6} strokeDasharray="4 18" opacity={0.8} />
              {Array.from({length: 60}, (_, i) => {
                const a = (i / 60) * Math.PI * 2, s = clamp((t - T.stars - 0.3) * 2 - i * 0.02);
                if (s <= 0) return null;
                return <line key={i} x1={Math.sin(a) * 300} y1={-Math.cos(a) * 300} x2={Math.sin(a) * (300 - (i % 5 === 0 ? 50 : 26) * s)} y2={-Math.cos(a) * (300 - (i % 5 === 0 ? 50 : 26) * s)} stroke="#FFE07A" strokeWidth={i % 5 === 0 ? 9 : 5} />;
              })}
              {t >= T.time && (
                <g transform={`scale(${pop(t, T.time, 0.35)})`}>
                  <line x1={0} y1={0} x2={Math.sin(t * 1.5) * 220} y2={-Math.cos(t * 1.5) * 220} stroke="#FFE07A" strokeWidth={14} strokeLinecap="round" />
                  <line x1={0} y1={0} x2={Math.sin(t * 0.3 + 2) * 140} y2={-Math.cos(t * 0.3 + 2) * 140} stroke="#FFE07A" strokeWidth={20} strokeLinecap="round" />
                  <circle cx={0} cy={0} r={16} fill="#FFE07A" />
                </g>
              )}
            </g>
          </g>
        )}
      </Layer>
      <Sound voice={TL.voiceFile} voiceStart={TL.voiceStart} cues={cues} />
    </AbsoluteFill>
  );
};

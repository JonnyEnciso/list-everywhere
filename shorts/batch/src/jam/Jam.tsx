import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import timing from './timing.json';
import {FPS, clamp, lerp, ramp, pop, easeOut, easeIn, easeInOut, timeline} from '../lib/time';
import {Sound, Cue} from '../lib/stage';

/* "Phantom traffic jams" in a minimal motion-graphics style: dark navy grid, flat orange pictograms (no outlines),
   thin white lines, kinetic captions with key words in big orange capitals. The ring-road jam is a real car-following
   simulation (optimal-velocity model), so the backward-moving wave emerges from the physics. */

const TL = timeline(timing);
export const DURATION = TL.DURATION;
const {at, S} = TL;

const C = {bg: '#0D1426', grid: '#18213A', orange: '#F26522', white: '#FFFFFF', dim: '#3A4560', red: '#FF3B2F'};
const FONT = 'Inter Display, Inter, sans-serif';

// captions: *word* = emphasised (orange, capitals, bigger)
const CAPTIONS = [
  'Why do traffic *jams* appear out of *nowhere?*',
  'In 2008, researchers in Japan put *22 cars* on a *circular* track.',
  'No lights, no crashes. Just a steady *30 km/h.*',
  'A jam showed up *anyway.*',
  'One driver eased off a little, the next braked a bit *harder*, and so on.',
  'The wave grew into a full *stop* that crept *backward* around the track.',
  'When cars are packed too close, traffic can jam *all by itself.*',
];

const T = {
  ring: S[1].a + 0.2, //        cars pop onto the ring, one by one
  icons: S[2].a, //             no lights / no crashes
  gauge: at(2, 0.6), //         steady 30 km/h gauge
  ease: S[2].b - 0.3, //        one driver eases off (the perturbation), so the jam is there by "anyway"
  chain: S[4].a, //             highlight: each braking harder
  wave: S[5].a, //              arrow: the wave moves backward
  outro: S[6].a,
  loop: TL.VOICE_END + 0.6,
};

// ------------------------------------------------------------------------------------------------ the simulation
// Optimal-velocity model (Bando et al.): dv/dt = a (V(h) - v), V(h) = tanh(h - 2) + tanh(2). With 22 cars on a ring of
// length 44 the spacing is h = 2, where the uniform flow is unstable for a < 2 V'(2) = 2, so a small slow-down grows into
// a stop-and-go wave that travels backward against the traffic.
const N = 22, L = 44, A = 0.7, SIM_PER_SEC = 9, SUB = 8;
const V = (h: number) => Math.tanh(h - 2) + Math.tanh(2);
const FRAMES = Math.ceil(DURATION * FPS) + 2;
const POS: Float32Array[] = [], VEL: Float32Array[] = [];
{
  const x = new Float32Array(N), v = new Float32Array(N);
  for (let i = 0; i < N; i++) { x[i] = (i * L) / N; v[i] = V(L / N); }
  const dt = SIM_PER_SEC / FPS / SUB;
  let kicked = false;
  for (let f = 0; f < FRAMES; f++) {
    const t = f / FPS;
    if (t >= T.ring) {
      if (!kicked && t >= T.ease) { v[0] *= 0.3; kicked = true; } // one driver eases off
      for (let s = 0; s < SUB; s++) {
        const acc = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          let h = x[(i + 1) % N] - x[i]; if (h < 0) h += L;
          acc[i] = A * (V(h) - v[i]);
        }
        for (let i = 0; i < N; i++) { v[i] = Math.max(0, v[i] + acc[i] * dt); x[i] = (x[i] + v[i] * dt) % L; }
      }
    }
    POS.push(Float32Array.from(x)); VEL.push(Float32Array.from(v));
  }
}

// ------------------------------------------------------------------------------------------------ captions
/** real text width from the browser's font metrics (Inter Display is installed), cached */
const widths = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null = null;
const measure = (text: string, weight: number, size: number) => {
  const key = `${weight}|${size}|${text}`;
  const hit = widths.get(key);
  if (hit !== undefined) return hit;
  if (typeof document === 'undefined') return text.length * size * 0.55;
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return text.length * size * 0.55;
  ctx.font = `${weight} ${size}px "Inter Display", Inter, sans-serif`;
  const w = ctx.measureText(text).width;
  widths.set(key, w);
  return w;
};
const syl = (w: string) => Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) || []).length);
const Caption: React.FC<{i: number; t: number}> = ({i, t}) => {
  const words = CAPTIONS[i].split(' ').map((w) => ({text: w.replace(/\*/g, ''), em: w.includes('*')}));
  const total = words.reduce((s, w) => s + syl(w.text), 0);
  const dur = S[i].b - S[i].a;
  let acc = 0;
  const timed = words.map((w) => { const t0 = S[i].a + (acc / total) * dur * 0.92; acc += syl(w.text); return {...w, t0}; });
  // layout: wrap into lines ~900 px wide
  const size = (w: {em: boolean}) => (w.em ? 124 : 76);
  const width = (w: {text: string; em: boolean}) => measure(w.em ? w.text.toUpperCase() : w.text, w.em ? 800 : 700, size(w)) + 24;
  const lines: (typeof timed)[] = [[]];
  let lw = 0;
  for (const w of timed) {
    if (lw + width(w) > 980 && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
    lines[lines.length - 1].push(w); lw += width(w);
  }
  let y = 470 - (lines.length - 1) * 60;
  return (
    <g>
      {lines.map((line, li) => {
        const lineW = line.reduce((s, w) => s + width(w), 0);
        let x = 540 - lineW / 2;
        const lineH = Math.max(...line.map(size));
        y += li === 0 ? 0 : lineH * 1.05;
        return (
          <g key={li}>
            {line.map((w, wi) => {
              const p = pop(t, w.t0, 0.22);
              const el = (
                <text key={wi} x={x + width(w) / 2 - 11} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={w.em ? 800 : 700}
                  fontSize={size(w)} fill={w.em ? C.orange : C.white}
                  transform={`translate(${x + width(w) / 2} ${y}) scale(${p}) translate(${-(x + width(w) / 2)} ${-y})`} opacity={t >= w.t0 ? 1 : 0}>
                  {w.em ? w.text.toUpperCase() : w.text}
                </text>
              );
              x += width(w);
              return el;
            })}
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ pictograms
const mix = (a: string, b: string, u: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), u))).join(',')})`;
};
const Car: React.FC<{color?: string; glow?: number; ring?: boolean}> = ({color = C.orange, glow = 0, ring}) => (
  <g>
    {glow > 0.05 && <rect x={-36} y={-20} width={20} height={40} rx={8} fill={C.red} opacity={glow} transform="translate(-6 0)" />}
    <rect x={-30} y={-17} width={60} height={34} rx={11} fill={color} />
    <rect x={8} y={-12} width={10} height={24} rx={4} fill={C.bg} opacity={0.55} />
    {ring && <rect x={-40} y={-27} width={80} height={54} rx={18} fill="none" stroke={C.white} strokeWidth={5} />}
  </g>
);
const Person: React.FC<{color?: string}> = ({color = C.orange}) => (
  <g fill={color}>
    <circle cx={0} cy={-150} r={33} />
    <rect x={-35} y={-110} width={70} height={130} rx={30} />
    <rect x={-22} y={10} width={16} height={60} rx={8} /><rect x={6} y={10} width={16} height={60} rx={8} />
  </g>
);
const Cross: React.FC<{s: number}> = ({s}) => (
  <g transform={`scale(${s})`} stroke={C.red} strokeWidth={14} strokeLinecap="round">
    <line x1={-46} y1={-46} x2={46} y2={46} /><line x1={46} y1={-46} x2={-46} y2={46} />
  </g>
);

// ------------------------------------------------------------------------------------------------ composition
const RING = {x: 540, y: 1180, r: 330};
export const Jam: React.FC = () => {
  const frame = useCurrentFrame();
  const tr = frame / FPS;
  const looped = tr >= T.loop;
  const t = looped ? 0 : tr;
  const f = Math.min(POS.length - 1, Math.round(t * FPS));

  // scene 0: a straight road where cars bunch up and stop for no visible reason
  const road = t < S[1].a;
  const ringIn = ramp(t, S[1].a - 0.1, S[1].a + 0.4, easeOut);
  // jam centre (slowest car) for the backward-wave arrow
  let slow = 0;
  for (let i = 1; i < N; i++) if (VEL[f][i] < VEL[f][slow]) slow = i;
  const slowAng = (POS[f][slow] / L) * Math.PI * 2;
  const zoomOut = ramp(t, T.outro, T.outro + 1.2, easeInOut);

  const cues: Cue[] = [
    {f: 'bed', at: 0, db: -24},
    {f: 'whoosh', at: 0.05, db: -26},
    ...CAPTIONS.flatMap((_, i) => [{f: 'tick', at: S[i].a, db: -26}]),
    ...Array.from({length: N}, (_, i) => ({f: 'tick', at: T.ring + i * 0.05, db: -30})),
    {f: 'pop', at: T.icons, db: -24}, {f: 'pop', at: T.icons + 0.5, db: -24},
    {f: 'ding', at: T.gauge, db: -27},
    {f: 'squeeze', at: S[3].a + 0.3, db: -26},
    {f: 'swish', at: T.wave, db: -26},
    {f: 'chime', at: T.outro + 0.4, db: -28},
  ];

  const roadCars = Array.from({length: 6}, (_, i) => {
    const u = ramp(t, 0.3 + i * 0.12, 1.6 + i * 0.1, easeOut);
    return {x: lerp(120 + i * 150, 330 + i * 78, u), glow: u > 0.6 ? 1 : 0};
  });

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 19}, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke={C.grid} strokeWidth={2} />)}
        {Array.from({length: 33}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke={C.grid} strokeWidth={2} />)}

        {/* captions: one sentence at a time, words popping in */}
        {S.map((s, i) => (t >= s.a - 0.05 && (i === S.length - 1 || t < S[i + 1].a - 0.05)) ? <Caption key={i} i={i} t={t} /> : null)}

        {road && (
          <g>
            <line x1={60} y1={1230} x2={1020} y2={1230} stroke={C.white} strokeWidth={6} />
            <line x1={60} y1={1110} x2={1020} y2={1110} stroke={C.white} strokeWidth={6} />
            {roadCars.map((c, i) => <g key={i} transform={`translate(${c.x} 1170)`}><Car glow={c.glow} /></g>)}
            {t > 1.4 && (
              <text x={540} y={960} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={220} fill={C.orange}
                transform={`translate(540 900) scale(${pop(t, 1.4, 0.3)}) translate(-540 -900)`}>?</text>
            )}
          </g>
        )}

        {!road && (
          <g transform={`translate(${RING.x} ${RING.y}) scale(${lerp(1, 0.78, zoomOut)}) translate(${-RING.x} ${-RING.y})`}>
            <circle cx={RING.x} cy={RING.y} r={RING.r * ringIn} fill="none" stroke={C.white} strokeWidth={6} />
            <circle cx={RING.x} cy={RING.y} r={(RING.r - 80) * ringIn} fill="none" stroke={C.dim} strokeWidth={4} strokeDasharray="14 18" />
            {Array.from({length: N}, (_, i) => {
              const born = T.ring + i * 0.05;
              if (t < born) return null;
              const ang = (POS[f][i] / L) * Math.PI * 2 - Math.PI / 2;
              const v = VEL[f][i];
              const brake = clamp((0.85 - v) / 0.8);
              const hl = t >= T.chain && t < T.wave && i === 0;
              return (
                <g key={i} transform={`translate(${RING.x + Math.cos(ang) * (RING.r - 40)} ${RING.y + Math.sin(ang) * (RING.r - 40)}) rotate(${(ang * 180) / Math.PI + 90}) scale(${pop(t, born, 0.25)})`}>
                  <Car glow={t > T.ease ? brake : 0} ring={hl} color={t > T.ease ? mix(C.orange, C.red, clamp((0.5 - v) / 0.45)) : C.orange} />
                </g>
              );
            })}
            {/* the backward-moving wave */}
            {t >= T.wave && t < T.loop && (() => {
              const a0 = slowAng - Math.PI / 2;
              const r = RING.r + 70;
              const sweep = 0.7;
              const path = `M${RING.x + Math.cos(a0 + 0.15) * r} ${RING.y + Math.sin(a0 + 0.15) * r} A ${r} ${r} 0 0 0 ${RING.x + Math.cos(a0 - sweep) * r} ${RING.y + Math.sin(a0 - sweep) * r}`;
              const tip = {x: RING.x + Math.cos(a0 - sweep) * r, y: RING.y + Math.sin(a0 - sweep) * r};
              const dir = a0 - sweep - Math.PI / 2;
              const s = pop(t, T.wave, 0.3);
              return (
                <g opacity={s}>
                  <path d={path} fill="none" stroke={C.orange} strokeWidth={14} strokeLinecap="round" />
                  <path d={`M${tip.x + Math.cos(dir) * 34} ${tip.y + Math.sin(dir) * 34} L ${tip.x + Math.cos(dir + 2.4) * 30} ${tip.y + Math.sin(dir + 2.4) * 30} L ${tip.x + Math.cos(dir - 2.4) * 30} ${tip.y + Math.sin(dir - 2.4) * 30} Z`} fill={C.orange} />
                </g>
              );
            })()}
            {/* centre: icons, gauge, then a frustrated driver */}
            {t >= T.icons && t < T.gauge && (
              <g>
                <g transform={`translate(${RING.x - 110} ${RING.y}) scale(${pop(t, T.icons, 0.3)})`}>
                  <rect x={-34} y={-90} width={68} height={180} rx={24} fill={C.dim} />
                  {[-55, 0, 55].map((y, k) => <circle key={k} cx={0} cy={y} r={20} fill={k === 0 ? C.red : k === 1 ? '#FFC23D' : '#5CD67A'} />)}
                  <Cross s={pop(t, T.icons + 0.25, 0.25)} />
                </g>
                <g transform={`translate(${RING.x + 110} ${RING.y}) scale(${pop(t, T.icons + 0.5, 0.3)})`}>
                  <g transform="translate(-26 -10) rotate(-25)"><Car /></g><g transform="translate(26 10) rotate(200)"><Car /></g>
                  <Cross s={pop(t, T.icons + 0.75, 0.25)} />
                </g>
              </g>
            )}
            {t >= T.gauge && t < S[3].a && (
              <g transform={`translate(${RING.x} ${RING.y}) scale(${pop(t, T.gauge, 0.3)})`}>
                <circle cx={0} cy={0} r={120} fill="#2A3350" stroke={C.white} strokeWidth={8} />
                {Array.from({length: 9}, (_, k) => { const a = Math.PI * (0.75 + k * 0.1875); return <line key={k} x1={Math.cos(a) * 95} y1={Math.sin(a) * 95} x2={Math.cos(a) * 110} y2={Math.sin(a) * 110} stroke={C.white} strokeWidth={5} />; })}
                <line x1={0} y1={0} x2={Math.cos(Math.PI * (0.75 + 0.55 * ramp(t, T.gauge, T.gauge + 0.6, easeOut))) * 88} y2={Math.sin(Math.PI * (0.75 + 0.55 * ramp(t, T.gauge, T.gauge + 0.6, easeOut))) * 88}
                  stroke={C.orange} strokeWidth={10} strokeLinecap="round" />
                <circle cx={0} cy={0} r={12} fill={C.white} />
                <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.white}>30</text>
              </g>
            )}
            {t >= S[3].a && (
              <g transform={`translate(${RING.x} ${RING.y + 70}) scale(${0.85 * pop(t, S[3].a, 0.3)})`}>
                <Person />
                {[-40, 0, 40].map((dx, k) => (
                  <path key={k} d={`M${dx} -205 q 14 -18 0 -36 t 0 -36`} fill="none" stroke={k === 1 ? C.white : '#8D96AB'} strokeWidth={6} strokeLinecap="round"
                    transform={`translate(0 ${-((t * 30 + k * 12) % 24)})`} />
                ))}
              </g>
            )}
          </g>
        )}
      </svg>
      {/* no voice yet: lift the effects and the music bed, which are mixed to sit under a voice */}
      <Sound voice={TL.voiceFile} voiceStart={TL.voiceStart} cues={TL.voiceFile ? cues : cues.map((c) => ({...c, db: c.db + 18}))} />
    </AbsoluteFill>
  );
};

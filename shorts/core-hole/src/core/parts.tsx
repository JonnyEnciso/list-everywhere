import React from 'react';

export const INK = '#1b1b22';
export const W = 9;

/** noodle limb: black outline + white fill along a quadratic curve */
const Noodle: React.FC<{d: string; w?: number}> = ({d, w = 20}) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={INK} strokeWidth={w} />
    <path d={d} stroke="#fff" strokeWidth={w - W * 1.1} />
  </g>
);

// ------------------------------------------------------------------------------------------------ shovel
export type ShovelPose = {tipX: number; tipY: number; ang: number}; // ang: direction handle-top -> blade tip (deg)
export const shovelPoints = (p: ShovelPose) => {
  const r = (p.ang * Math.PI) / 180, dx = Math.cos(r), dy = Math.sin(r);
  const neck = {x: p.tipX - dx * 62, y: p.tipY - dy * 62};
  const top = {x: neck.x - dx * 230, y: neck.y - dy * 230};
  const along = (f: number) => ({x: top.x + dx * 230 * f, y: top.y + dy * 230 * f});
  return {neck, top, along};
};
export const Shovel: React.FC<{pose: ShovelPose}> = ({pose}) => {
  const {neck, top} = shovelPoints(pose);
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <line x1={top.x} y1={top.y} x2={neck.x} y2={neck.y} stroke={INK} strokeWidth={22} />
      <line x1={top.x} y1={top.y} x2={neck.x} y2={neck.y} stroke="#C98A4B" strokeWidth={10} />
      <g transform={`translate(${neck.x} ${neck.y}) rotate(${pose.ang - 90})`}>
        <path d="M-30 0 L 30 0 L 26 44 Q 0 74 -26 44 Z" fill="#AEB8C2" stroke={INK} strokeWidth={W} />
        <path d="M-18 10 L -16 40" stroke="#D8DEE4" strokeWidth={6} />
      </g>
      <line x1={top.x - 18} y1={top.y} x2={top.x + 18} y2={top.y} stroke={INK} strokeWidth={20} transform={`rotate(${pose.ang - 90} ${top.x} ${top.y})`} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ guy
export type Face = 'neutral' | 'smile' | 'smug' | 'worried' | 'shock';
export const Guy: React.FC<{shovel?: ShovelPose; face?: Face; breathe?: number; squash?: number; sweat?: number;
  look?: number; blink?: number}> = ({shovel, face = 'neutral', breathe = 0, squash = 1, sweat = 0, look = 0, blink = 0}) => {
  const sy = (1 + breathe * 0.009) * squash, sx = 1 / Math.sqrt(squash);
  const sh = shovel ? shovelPoints(shovel) : null;
  const h1 = sh ? sh.along(0.12) : {x: 60, y: -150};
  const h2 = sh ? sh.along(0.55) : {x: 46, y: -100};
  const back = sh ? h2 : {x: -50, y: -86};
  const front = h1;
  const ex = 20 + look * 4;
  return (
    <g transform={`scale(${sx} ${sy})`}>
      {/* back arm */}
      <Noodle d={`M-18 -138 Q ${(-18 + back.x) / 2 - 20} ${(-138 + back.y) / 2 + 20} ${back.x} ${back.y}`} />
      {/* legs */}
      <Noodle d="M-14 -72 Q -20 -36 -22 -8" />
      <Noodle d="M16 -72 Q 20 -36 24 -8" />
      <ellipse cx={-14} cy={-6} rx={24} ry={11} fill="#fff" stroke={INK} strokeWidth={W} />
      <ellipse cx={34} cy={-6} rx={24} ry={11} fill="#fff" stroke={INK} strokeWidth={W} />
      {/* body */}
      <path d="M-40 -96 Q -46 -170 0 -172 Q 46 -170 40 -96 Q 38 -62 0 -60 Q -38 -62 -40 -96 Z" fill="#fff" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      <path d="M-34 -100 Q -36 -150 -14 -164" fill="none" stroke="#E6EAEE" strokeWidth={10} strokeLinecap="round" />
      {sh && shovel && <Shovel pose={shovel} />}
      {/* front arm */}
      <Noodle d={`M18 -140 Q ${(18 + front.x) / 2 + 24} ${(-140 + front.y) / 2 + 26} ${front.x} ${front.y}`} />
      <circle cx={front.x} cy={front.y} r={13} fill="#fff" stroke={INK} strokeWidth={W * 0.8} />
      {sh && <circle cx={h2.x} cy={h2.y} r={13} fill="#fff" stroke={INK} strokeWidth={W * 0.8} />}
      {/* head */}
      <circle cx={6} cy={-236} r={68} fill="#fff" stroke={INK} strokeWidth={W} />
      <path d="M-50 -250 Q -54 -200 -20 -180" fill="none" stroke="#E6EAEE" strokeWidth={12} strokeLinecap="round" />
      {/* eyes */}
      {blink > 0.5 ? (
        <g stroke={INK} strokeWidth={6} strokeLinecap="round">
          <line x1={ex - 7} y1={-240} x2={ex + 7} y2={-240} /><line x1={ex + 22} y1={-238} x2={ex + 36} y2={-238} />
        </g>
      ) : (
        <g fill={INK}>
          <ellipse cx={ex} cy={-240} rx={face === 'shock' ? 8 : 6.5} ry={face === 'shock' ? 12 : 10} />
          <ellipse cx={ex + 29} cy={-238} rx={face === 'shock' ? 8 : 6.5} ry={face === 'shock' ? 12 : 10} />
        </g>
      )}
      {/* brows */}
      <g stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none">
        {face === 'worried' || face === 'shock' ? (
          <><path d={`M${ex - 10} -258 L ${ex + 6} -264`} /><path d={`M${ex + 22} -263 L ${ex + 38} -257`} /></>
        ) : face === 'smug' ? (
          <><path d={`M${ex - 10} -262 Q ${ex} -268 ${ex + 8} -262`} /><path d={`M${ex + 22} -266 Q ${ex + 30} -272 ${ex + 38} -264`} /></>
        ) : (
          <><path d={`M${ex - 10} -260 Q ${ex} -264 ${ex + 8} -260`} /><path d={`M${ex + 22} -259 Q ${ex + 30} -263 ${ex + 38} -258`} /></>
        )}
      </g>
      {/* mouth */}
      {face === 'smile' || face === 'smug' ? (
        <path d={`M${ex - 2} -210 Q ${ex + 16} ${face === 'smug' ? -196 : -192} ${ex + 34} -212`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      ) : face === 'shock' ? (
        <ellipse cx={ex + 16} cy={-204} rx={11} ry={14} fill={INK} />
      ) : face === 'worried' ? (
        <path d={`M${ex + 2} -202 q 8 -8 15 0 t 15 0`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      ) : (
        <path d={`M${ex + 6} -206 L ${ex + 26} -206`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      )}
      {sweat > 0 && (
        <g transform={`translate(${-48} ${-262 + sweat * 40}) scale(${Math.min(1, sweat * 4) * (sweat > 0.85 ? (1 - sweat) / 0.15 : 1)})`}>
          <path d="M0 -20 C 13 0 13 13 0 13 C -13 13 -13 0 0 -20 Z" fill="#9ED8FF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={-3} cy={3} rx={2.5} ry={5} fill="#fff" />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ face on a blob (core / goo)
export const BlobFace: React.FC<{r: number; open: number; lookY?: number; lookX?: number; mood?: 'smirk' | 'smile' | 'o' | 'sleep'}> = ({r, open, lookY = 0, lookX = 0, mood = 'smile'}) => {
  const ey = -r * 0.12, ex = r * 0.3, er = r * 0.16;
  const lid = 1 - open;
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={s * ex} cy={ey} rx={er} ry={er * 1.15 * Math.max(0.08, open)} fill="#fff" stroke={INK} strokeWidth={W * 0.8} />
          {open > 0.3 && <circle cx={s * ex + lookX * er * 0.4} cy={ey + lookY * er * 0.45} r={er * 0.5 * Math.min(1, open * 1.4)} fill={INK} />}
          {open > 0.3 && <circle cx={s * ex + lookX * er * 0.4 + er * 0.18} cy={ey + lookY * er * 0.45 - er * 0.2} r={er * 0.15} fill="#fff" />}
          {lid > 0.6 && <path d={`M${s * ex - er} ${ey} Q ${s * ex} ${ey + er * 0.7} ${s * ex + er} ${ey}`} fill="none" stroke={INK} strokeWidth={W * 0.8} strokeLinecap="round" />}
        </g>
      ))}
      {mood === 'smile' && <path d={`M${-r * 0.22} ${r * 0.25} Q 0 ${r * 0.45} ${r * 0.22} ${r * 0.25}`} fill="none" stroke={INK} strokeWidth={W} strokeLinecap="round" />}
      {mood === 'smirk' && <path d={`M${-r * 0.2} ${r * 0.3} Q ${r * 0.08} ${r * 0.4} ${r * 0.26} ${r * 0.18}`} fill="none" stroke={INK} strokeWidth={W} strokeLinecap="round" />}
      {mood === 'o' && <ellipse cx={0} cy={r * 0.32} rx={r * 0.09} ry={r * 0.12} fill={INK} />}
      {mood === 'sleep' && <path d={`M${-r * 0.1} ${r * 0.3} L ${r * 0.1} ${r * 0.3}`} stroke={INK} strokeWidth={W} strokeLinecap="round" />}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ drill rig
/** base centre at origin (ground), tower up to y = -330 */
export const Rig: React.FC<{spin: number; shake?: number}> = ({spin, shake = 0}) => (
  <g strokeLinejoin="round" strokeLinecap="round" transform={`translate(${shake} 0)`}>
    <path d="M-62 0 L -10 -330 M62 0 L 10 -330" stroke={INK} strokeWidth={22} fill="none" />
    <path d="M-62 0 L -10 -330 M62 0 L 10 -330" stroke="#E2463F" strokeWidth={10} fill="none" />
    {[[-52, -60, 50, -60], [-42, -130, 40, -130], [-31, -200, 30, -200], [-21, -270, 20, -270], [-52, -60, 40, -130], [-42, -130, 30, -200], [-31, -200, 20, -270]].map(([a, b, c, d], i) => (
      <g key={i}><line x1={a} y1={b} x2={c} y2={d} stroke={INK} strokeWidth={14} /><line x1={a} y1={b} x2={c} y2={d} stroke="#E2463F" strokeWidth={5} /></g>
    ))}
    <rect x={-26} y={-352} width={52} height={30} rx={6} fill="#FFC845" stroke={INK} strokeWidth={W} />
    {/* motor (right of the tower) */}
    <rect x={72} y={-62} width={78} height={62} rx={10} fill="#5C9BD6" stroke={INK} strokeWidth={W} />
    <rect x={103} y={-82} width={16} height={24} rx={4} fill="#8892A0" stroke={INK} strokeWidth={6} />
    <circle cx={111} cy={-31} r={14} fill="#FFC845" stroke={INK} strokeWidth={6} />
    <line x1={111} y1={-31} x2={111 + 10 * Math.cos(spin * 2)} y2={-31 + 10 * Math.sin(spin * 2)} stroke={INK} strokeWidth={5} />
  </g>
);

/** rotating drill pipe from y0 down to y1 (x centred at 0), bit at the bottom */
export const Pipe: React.FC<{y0: number; y1: number; spin: number; bend?: number}> = ({y0, y1, spin, bend = 0}) => {
  const len = Math.max(0, y1 - y0);
  const off = ((spin * 18) % 36 + 36) % 36;
  const stripes = [];
  for (let y = y0 - 36 + off; y < y1; y += 36) stripes.push(y);
  const bx = bend * 26;
  return (
    <g>
      <defs><clipPath id="pipe-clip"><rect x={-11} y={y0} width={22} height={len} /></clipPath></defs>
      <path d={`M0 ${y0} Q 0 ${y1 - 40} ${bx} ${y1}`} stroke={INK} strokeWidth={26} fill="none" />
      <path d={`M0 ${y0} Q 0 ${y1 - 40} ${bx} ${y1}`} stroke="#B9C2CC" strokeWidth={13} fill="none" />
      {bend === 0 && (
        <g clipPath="url(#pipe-clip)">{stripes.map((y, i) => <line key={i} x1={-8} y1={y} x2={8} y2={y + 12} stroke="#7E8894" strokeWidth={5} />)}</g>
      )}
      <g transform={`translate(${bx} ${y1}) rotate(${bend * -14})`}>
        <path d="M-22 -6 L 22 -6 L 0 46 Z" fill="#7E8894" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
        <path d={`M${-14 + (off / 36) * 8} 4 L ${10 + (off / 36) * 4} 14 M${-8 + (off / 36) * 6} 20 L ${6 + (off / 36) * 3} 28`} stroke="#C3CCD5" strokeWidth={5} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ thermometer
export const Thermo: React.FC<{fill: number}> = ({fill}) => (
  <g strokeLinejoin="round">
    <rect x={-16} y={-150} width={32} height={150} rx={16} fill="#fff" stroke={INK} strokeWidth={W} />
    <circle cx={0} cy={10} r={26} fill="#FF4B3E" stroke={INK} strokeWidth={W} />
    <rect x={-7} y={-140 + 130 * (1 - fill)} width={14} height={130 * fill + 10} rx={7} fill="#FF4B3E" />
    <circle cx={0} cy={10} r={18} fill="#FF4B3E" />
    {[0.2, 0.4, 0.6, 0.8].map((f) => <line key={f} x1={6} y1={-140 + 130 * (1 - f)} x2={14} y2={-140 + 130 * (1 - f)} stroke={INK} strokeWidth={4} />)}
  </g>
);

// ------------------------------------------------------------------------------------------------ puffs (smoke / steam) with ONE merged outline
export const Puffs: React.FC<{items: {x: number; y: number; r: number}[]; fill: string}> = ({items, fill}) => (
  <g>
    {items.map((p, i) => <circle key={`o${i}`} cx={p.x} cy={p.y} r={p.r + 6} fill={INK} />)}
    {items.map((p, i) => <circle key={`f${i}`} cx={p.x} cy={p.y} r={p.r} fill={fill} />)}
  </g>
);

export const Label: React.FC<{x: number; y: number; text: string; size?: number; anchor?: 'start' | 'middle' | 'end'; color?: string}> = ({x, y, text, size = 56, anchor = 'start', color = '#fff'}) => (
  <text x={x} y={y} fontFamily="Arial Black, Arial, sans-serif" fontWeight={900} fontSize={size} fill={color} stroke={INK}
    strokeWidth={size * 0.2} strokeLinejoin="round" paintOrder="stroke" textAnchor={anchor}>{text}</text>
);

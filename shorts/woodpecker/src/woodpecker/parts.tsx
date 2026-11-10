import React from 'react';

export const INK = '#1b1b22';
export const W = 7; // outline weight in local units (bird is drawn at 1.55x -> ~11 px)
const PINK = '#F7A9BE';
const PINK_DEEP = '#D9718C';

// ------------------------------------------------------------------------------------------------ brain
const blobPath = (r: number, bumps = 9, amp = 0.07, sx = 1.25) => {
  const n = 72;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(a * bumps));
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr * sx).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`;
  }
  return d + 'Z';
};

export const Brain: React.FC<{r: number; mood?: 'calm' | 'worried' | 'happy' | 'none'; squashX?: number;
  sweat?: number; ink?: number}> = ({r, mood = 'none', squashX = 1, sweat = 0, ink = W}) => {
  const sw = Math.max(ink * (r / 60), 2.2);
  const fold = sw * 0.7;
  return (
    <g transform={`scale(${squashX}, ${1 / Math.sqrt(squashX)})`}>
      <path d={blobPath(r)} fill={PINK} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M0 ${-r * 0.92} Q ${r * 0.12} ${-r * 0.3} 0 ${r * 0.2}`} fill="none" stroke={PINK_DEEP} strokeWidth={fold} strokeLinecap="round" />
      <path d={`M${-r * 0.85} ${-r * 0.15} q ${r * 0.25} ${-r * 0.3} ${r * 0.5} 0 t ${r * 0.3} ${-r * 0.1}`} fill="none" stroke={PINK_DEEP} strokeWidth={fold} strokeLinecap="round" />
      <path d={`M${r * 0.3} ${-r * 0.5} q ${r * 0.25} ${r * 0.25} ${r * 0.55} ${r * 0.05}`} fill="none" stroke={PINK_DEEP} strokeWidth={fold} strokeLinecap="round" />
      {mood !== 'none' && (
        <g>
          <ellipse cx={-r * 0.32} cy={r * 0.12} rx={r * 0.09} ry={r * 0.13} fill={INK} />
          <ellipse cx={r * 0.32} cy={r * 0.12} rx={r * 0.09} ry={r * 0.13} fill={INK} />
          {mood === 'worried' && (
            <g stroke={INK} strokeWidth={sw * 0.9} strokeLinecap="round" fill="none">
              <path d={`M${-r * 0.48} ${-r * 0.12} L ${-r * 0.2} ${-r * 0.2}`} />
              <path d={`M${r * 0.48} ${-r * 0.12} L ${r * 0.2} ${-r * 0.2}`} />
              <path d={`M${-r * 0.2} ${r * 0.52} q ${r * 0.1} ${-r * 0.12} ${r * 0.2} 0 t ${r * 0.2} 0`} />
            </g>
          )}
          {(mood === 'happy' || mood === 'calm') && (
            <path d={`M${-r * 0.22} ${r * 0.38} Q 0 ${r * (mood === 'happy' ? 0.62 : 0.5)} ${r * 0.22} ${r * 0.38}`}
              stroke={INK} strokeWidth={sw * 0.9} strokeLinecap="round" fill="none" />
          )}
        </g>
      )}
      {sweat > 0 && (
        <g transform={`translate(${r * 1.05}, ${-r * 0.55 + sweat * r * 0.25}) scale(${Math.min(1, sweat * 3)})`}>
          <path d={`M0 ${-r * 0.22} C ${r * 0.14} 0 ${r * 0.14} ${r * 0.14} 0 ${r * 0.14} C ${-r * 0.14} ${r * 0.14} ${-r * 0.14} 0 0 ${-r * 0.22} Z`}
            fill="#9ED8FF" stroke={INK} strokeWidth={sw * 0.8} strokeLinejoin="round" />
          <ellipse cx={-r * 0.03} cy={r * 0.03} rx={r * 0.025} ry={r * 0.05} fill="#fff" />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ spring
export const Spring: React.FC<{x0: number; x1: number; y: number; h?: number; coils?: number}> = ({x0, x1, y, h = 22, coils = 6}) => {
  let d = `M${x0} ${y}`;
  const n = coils * 2;
  for (let i = 1; i < n; i++) d += ` L${x0 + ((x1 - x0) * i) / n} ${y + (i % 2 ? -h : h)}`;
  d += ` L${x1} ${y}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={9} />
      <path d={d} stroke="#C9D3DC" strokeWidth={4.5} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ pillow
export const Pillow: React.FC<{w: number; h: number}> = ({w, h}) => {
  const x = w / 2, y = h / 2, b = 14; // convex, puffy sides with little corner tufts
  return (
    <g strokeLinejoin="round">
      <path d={`M${-x} ${-y} Q 0 ${-y - b} ${x} ${-y} Q ${x + b} 0 ${x} ${y} Q 0 ${y + b} ${-x} ${y} Q ${-x - b} 0 ${-x} ${-y} Z`}
        fill="#FFF6E4" stroke={INK} strokeWidth={W} />
      {[[-x, -y], [x, -y], [x, y], [-x, y]].map(([cx, cy], i) => (
        <path key={i} d={`M${cx} ${cy} l ${Math.sign(cx) * 9} ${Math.sign(cy) * 4} M${cx} ${cy} l ${Math.sign(cx) * 4} ${Math.sign(cy) * 9}`}
          stroke={INK} strokeWidth={W * 0.8} strokeLinecap="round" />
      ))}
      <path d={`M${-x * 0.5} ${-y * 0.45} Q ${-x * 0.1} ${-y * 0.62} ${x * 0.35} ${-y * 0.5}`} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      <path d={`M${-x * 0.3} ${y * 0.2} q ${x * 0.3} ${y * 0.25} ${x * 0.6} 0`} fill="none" stroke="#EAD3A8" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ star
export const Star: React.FC<{r: number}> = ({r}) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`;
  }
  return <path d={d + 'Z'} fill="#FFD84A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
};

// ------------------------------------------------------------------------------------------------ hammer
/** pivot (hand end of the handle) at origin, handle up, head across the top, striking face on the LEFT */
export const Hammer: React.FC = () => (
  <g strokeLinejoin="round">
    <rect x={-13} y={-215} width={26} height={225} rx={12} fill="#C98A4B" stroke={INK} strokeWidth={W} />
    <rect x={-60} y={-262} width={135} height={62} rx={10} fill="#9BA6B2" stroke={INK} strokeWidth={W} />
    <rect x={-60} y={-262} width={135} height={18} rx={8} fill="#C3CCD5" />
    <rect x={-60} y={-262} width={135} height={62} rx={10} fill="none" stroke={INK} strokeWidth={W} />
  </g>
);

// ------------------------------------------------------------------------------------------------ bird
export type BirdProps = {
  angle: number; // head angle about the neck (deg, negative = pulled back)
  lookX?: number; // pupil offset -1..1
  blink?: number; // 0 open .. 1 shut
  brow?: 'focus' | 'calm' | 'annoyed';
  xray?: number; // 0..1 lens size
  xrayContent?: 'spring' | 'brain';
  springLen?: number; // 1 = relaxed
  springOut?: number; // seconds since the spring popped out (-1 = still inside)
  pillow?: number; // 0..1 scale
  pillowSquash?: number; // 0..1
  brainPulse?: number;
  headOnly?: boolean;
  brainR?: number;
  brainSquash?: number;
};

export const PIVOT = {x: -110, y: -62};
export const HEAD = {x: -112, y: -130, r: 62};
export const BEAK_TIP = {x: 6, y: -128};

export const Bird: React.FC<BirdProps> = ({angle, lookX = 0.3, blink = 0, brow = 'focus', xray = 0, xrayContent = 'spring',
  springLen = 1, springOut = -1, pillow = 0, pillowSquash = 0, brainPulse = 0, headOnly = false, brainR = 15, brainSquash = 1}) => {
  const lean = angle * 0.12;
  const eye = {x: -92, y: -142};
  const lensR = (HEAD.r - W / 2) * xray;
  const clipId = `head-clip`;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <g transform={`rotate(${lean} -60 120)`}>
        {!headOnly && (
          <g>
            {/* tail, propped on the trunk */}
            <path d="M-118 70 L-52 262 L-14 250 L-62 64 Z" fill="#23232c" stroke={INK} strokeWidth={W} />
            {/* body */}
            <ellipse cx={-102} cy={28} rx={66} ry={112} fill="#2b2b35" stroke={INK} strokeWidth={W} />
            <path d="M-60 -60 Q -10 20 -52 128 Q -92 70 -80 -40 Z" fill="#fff" />
            <path d="M-60 -60 Q -10 20 -52 128" fill="none" stroke={INK} strokeWidth={W * 0.8} />
            {/* wing */}
            <path d="M-150 -40 Q -186 70 -128 172 Q -96 96 -104 -30 Z" fill="#1f1f27" stroke={INK} strokeWidth={W} />
            {[[-140, 10], [-132, 52], [-142, 92], [-124, 120], [-122, 20]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx={7} ry={5} fill="#fff" />
            ))}
            {/* feet gripping the bark */}
            <path d="M-46 52 q 26 -4 40 10 M-46 52 q 24 8 34 26" fill="none" stroke={INK} strokeWidth={W + 6} />
            <path d="M-46 52 q 26 -4 40 10 M-46 52 q 24 8 34 26" fill="none" stroke="#8C8F96" strokeWidth={W - 2} />
            <path d="M-50 96 q 26 -4 40 10 M-50 96 q 24 8 34 26" fill="none" stroke={INK} strokeWidth={W + 6} />
            <path d="M-50 96 q 26 -4 40 10 M-50 96 q 24 8 34 26" fill="none" stroke="#8C8F96" strokeWidth={W - 2} />
          </g>
        )}
        <g transform={`rotate(${angle} ${PIVOT.x} ${PIVOT.y})`}>
          {/* neck */}
          {!headOnly && <path d="M-150 -96 Q -140 -40 -128 -20 L -72 -26 Q -70 -70 -78 -96 Z" fill="#fff" stroke={INK} strokeWidth={W} />}
          {/* beak (behind the head outline) */}
          <path d={`M-62 -150 L ${BEAK_TIP.x} ${BEAK_TIP.y} L -62 -110 Z`} fill="#6F757E" stroke={INK} strokeWidth={W} />
          <path d={`M-58 -129 L ${BEAK_TIP.x - 8} ${BEAK_TIP.y}`} stroke="#4C5159" strokeWidth={3} />
          {/* pillow strapped on the beak */}
          {pillow > 0 && (
            <g transform={`translate(${BEAK_TIP.x - 4}, ${BEAK_TIP.y}) scale(${pillow * (1 - 0.42 * pillowSquash)}, ${pillow * (1 + 0.2 * pillowSquash)})`}>
              <Pillow w={78} h={92} />
            </g>
          )}
          <defs>
            <clipPath id={clipId}><circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} /></clipPath>
          </defs>
          <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill="#fff" />
          <g clipPath={`url(#${clipId})`}>
            <ellipse cx={-122} cy={-196} rx={70} ry={42} fill="#E8343B" />
            <ellipse cx={-176} cy={-120} rx={26} ry={40} fill="#E8343B" />
            <path d="M-62 -116 Q -112 -96 -180 -132 L -180 -108 Q -112 -72 -62 -98 Z" fill={INK} />
          </g>
          {/* eye */}
          <ellipse cx={eye.x} cy={eye.y} rx={16} ry={17} fill="#fff" stroke={INK} strokeWidth={W * 0.7} />
          <circle cx={eye.x + lookX * 6} cy={eye.y + 1} r={8} fill={INK} />
          <circle cx={eye.x + lookX * 6 + 2.5} cy={eye.y - 2.5} r={2.6} fill="#fff" />
          {blink > 0 && (
            <g>
              <ellipse cx={eye.x} cy={eye.y - 17 + 17 * blink} rx={17} ry={17 * blink} fill="#fff" stroke="none" />
              <path d={`M${eye.x - 16} ${eye.y - 17 + 34 * blink * 0.98} L ${eye.x + 16} ${eye.y - 17 + 34 * blink * 0.98}`}
                stroke={INK} strokeWidth={W * 0.7} />
            </g>
          )}
          {/* brow */}
          {brow === 'focus' && <path d={`M${eye.x - 18} ${eye.y - 30} L ${eye.x + 16} ${eye.y - 22}`} stroke={INK} strokeWidth={W} />}
          {brow === 'calm' && <path d={`M${eye.x - 18} ${eye.y - 28} Q ${eye.x} ${eye.y - 36} ${eye.x + 16} ${eye.y - 28}`} fill="none" stroke={INK} strokeWidth={W} />}
          {brow === 'annoyed' && <path d={`M${eye.x - 18} ${eye.y - 34} L ${eye.x + 16} ${eye.y - 18}`} stroke={INK} strokeWidth={W + 1} />}
          {/* x-ray lens */}
          {xray > 0.001 && (
            <g>
              <circle cx={HEAD.x} cy={HEAD.y} r={lensR} fill="#1E3557" />
              <g clipPath={`url(#${clipId})`}>
                <g opacity={xray}>
                  {/* skull: hard bony shell */}
                  <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r - 14} fill="none" stroke="#BFE3FF" strokeWidth={6} />
                  <path d={`M-66 -142 L ${BEAK_TIP.x - 6} ${BEAK_TIP.y - 1} L -66 -116`} fill="none" stroke="#BFE3FF" strokeWidth={5} />
                  {xrayContent === 'spring' && springOut < 0 && (
                    <g>
                      <Spring x0={-60 - 50 * springLen} x1={-60} y={-130} h={13} coils={5} />
                      <g transform={`translate(${-60 - 50 * springLen - brainR * 1.1}, -130)`}><Brain r={brainR} /></g>
                    </g>
                  )}
                  {xrayContent === 'spring' && springOut >= 0 && (
                    <g transform={`translate(${-129 - brainR * 0.1}, -130)`}><Brain r={brainR} /></g>
                  )}
                  {xrayContent === 'brain' && (
                    <g transform={`translate(-124, -132) scale(${1 + 0.18 * brainPulse})`}><Brain r={brainR} mood="calm" squashX={brainSquash} /></g>
                  )}
                </g>
              </g>
              <circle cx={HEAD.x} cy={HEAD.y} r={lensR} fill="none" stroke="#7FC4FF" strokeWidth={3} opacity={0.9} />
            </g>
          )}
          <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill="none" stroke={INK} strokeWidth={W} />
          {/* the spring flying out (not clipped) */}
          {xrayContent === 'spring' && springOut >= 0 && springOut < 1.6 && (() => {
            const s = springOut;
            const x = -85 - 260 * s;
            const y = -130 - 420 * s + 700 * s * s;
            const sc = s < 1.2 ? 1 : 1 - (s - 1.2) / 0.4;
            return (
              <g transform={`translate(${x}, ${y}) rotate(${-260 * s}) scale(${sc})`}>
                <Spring x0={-28} x1={28} y={0} h={14} coils={5} />
              </g>
            );
          })()}
        </g>
      </g>
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ round head (comparison)
export const RoundHead: React.FC<{r: number}> = ({r}) => (
  <g>
    <ellipse cx={0} cy={r * 1.05} rx={r * 0.55} ry={r * 0.4} fill="#fff" stroke={INK} strokeWidth={W * 1.6} />
    <circle cx={0} cy={0} r={r} fill="#fff" stroke={INK} strokeWidth={W * 1.6} />
    <circle cx={-r * 0.58} cy={r * 0.04} r={r * 0.36} fill="#EEF1F4" />
  </g>
);

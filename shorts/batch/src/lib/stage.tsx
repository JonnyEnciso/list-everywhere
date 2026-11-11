import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {FPS, easeInOut, lerp} from './time';

// ------------------------------------------------------------------------------------------------ 2.5D multiplane camera
export type Cam = {x: number; y: number; z: number};
export type Move = {t0: number; t1: number; to: Cam; cut?: boolean; ease?: (u: number) => number};
export const START: Cam = {x: 540, y: 960, z: 0};
export const kOf = (z: number) => 1000 / (1000 - z);

/** piecewise camera: holds are perfectly still, glides ease, zoom is interpolated in log space */
export const camAt = (t: number, moves: Move[], start: Cam = START): Cam => {
  let c = start;
  for (const m of moves) {
    if (t < m.t0) break;
    if (m.cut || t >= m.t1) { c = m.to; continue; }
    const u = (m.ease ?? easeInOut)((t - m.t0) / (m.t1 - m.t0));
    const k = Math.exp(lerp(Math.log(kOf(c.z)), Math.log(kOf(m.to.z)), u));
    c = {x: lerp(c.x, m.to.x, u), y: lerp(c.y, m.to.y, u), z: 1000 - 1000 / k};
    break;
  }
  return c;
};

/** screen shake (sums of sines, never random jumps) applied to a camera */
export const shaken = (cam: Cam, t: number, amp: number): Cam => {
  if (amp <= 0) return cam;
  const k = kOf(cam.z);
  return {...cam, x: cam.x - (amp * (0.6 * Math.sin(t * 83.6) + 0.4 * Math.sin(t * 44.6))) / k,
    y: cam.y - (amp * (0.6 * Math.sin(t * 73.5 + 1) + 0.4 * Math.sin(t * 33.3))) / k};
};

/** a flat layer at depth z (character plane = 1000); blur is in screen px */
export const Layer: React.FC<{cam: Cam; z: number; blur?: number; children: React.ReactNode}> = ({cam, z, blur = 0, children}) => {
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

/** screen-space svg overlay */
export const Screen: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={style}>
    <svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>{children}</svg>
  </AbsoluteFill>
);

// ------------------------------------------------------------------------------------------------ sound
export type Cue = {f: string; at: number; db: number};
/** voice at 0 dB + one cue list of effects from public/sfx (levels in dB, quiet under the voice) */
export const Sound: React.FC<{voice: string | null; voiceStart: number; cues: Cue[]}> = ({voice, voiceStart, cues}) => (
  <>
    {voice && (
      <Sequence from={Math.round(voiceStart * FPS)} layout="none">
        <Audio src={staticFile(voice)} />
      </Sequence>
    )}
    {cues.map((c, i) => (
      <Sequence key={i} from={Math.max(0, Math.round(c.at * FPS))} layout="none">
        <Audio src={staticFile(`sfx/${c.f}.wav`)} volume={10 ** (c.db / 20)} />
      </Sequence>
    ))}
  </>
);

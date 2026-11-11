import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './lib/time';
import * as Windows from './windows/Windows';
import * as Onion from './onion/Onion';
import * as Stomach from './stomach/Stomach';
import * as Moon from './moon/Moon';
import * as Sixty from './sixty/Sixty';

const SHORTS: [string, React.FC, number][] = [
  ['Windows', Windows.Windows, Windows.DURATION],
  ['Onion', Onion.Onion, Onion.DURATION],
  ['Stomach', Stomach.Stomach, Stomach.DURATION],
  ['Moon', Moon.Moon, Moon.DURATION],
  ['Sixty', Sixty.Sixty, Sixty.DURATION],
];

export const RemotionRoot = () => (
  <>
    {SHORTS.map(([id, C, d]) => (
      <Composition key={id} id={id} component={C} durationInFrames={Math.round(d * FPS)} fps={FPS} width={1080} height={1920} />
    ))}
  </>
);

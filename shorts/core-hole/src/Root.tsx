import {Composition} from 'remotion';
import {CoreHole, DURATION, FPS} from './core/CoreHole';

export const RemotionRoot = () => (
  <Composition id="CoreHole" component={CoreHole} durationInFrames={Math.round(DURATION * FPS)}
    fps={FPS} width={1080} height={1920} />
);

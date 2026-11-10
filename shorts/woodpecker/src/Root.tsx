import {Composition} from 'remotion';
import {Woodpecker, DURATION, FPS} from './woodpecker/Woodpecker';

export const RemotionRoot = () => (
  <Composition id="Woodpecker" component={Woodpecker} durationInFrames={Math.round(DURATION * FPS)}
    fps={FPS} width={1080} height={1920} />
);

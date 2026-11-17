import {Composition} from 'remotion';
import {Short} from './Short';
import data from './data/video.json';
import type {VideoData} from './types';

const FPS = 30;
const video = data as VideoData;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={Math.max(1, Math.ceil((video.duracion + 0.5) * FPS))}
  />
);

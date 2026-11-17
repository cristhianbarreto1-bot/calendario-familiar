import {useCurrentFrame, useVideoConfig} from 'remotion';

export const BarraProgreso: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width} = useVideoConfig();
  return (
    <div style={{position: 'absolute', bottom: 0, left: 0, height: 14, width: (frame / durationInFrames) * width, background: '#ffe23f'}} />
  );
};

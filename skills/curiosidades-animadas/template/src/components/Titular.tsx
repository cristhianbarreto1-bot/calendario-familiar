import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Titular: React.FC<{texto: string}> = ({texto}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 10}});
  return (
    <div
      style={{
        position: 'absolute',
        top: 190,
        left: 60,
        right: 60,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(${interpolate(s, [0, 1], [-200, 0])}px) rotate(-2deg)`,
      }}
    >
      <div
        style={{
          background: '#ff3b3b',
          color: '#fff',
          fontFamily: 'Montserrat, "Arial Black", Impact, sans-serif',
          fontWeight: 900,
          fontSize: 70,
          padding: '18px 36px',
          borderRadius: 24,
          border: '7px solid #1b1b1b',
          textAlign: 'center',
          lineHeight: 1.05,
          boxShadow: '0 12px 0 #1b1b1b',
          textTransform: 'uppercase',
        }}
      >
        {texto}
      </div>
    </div>
  );
};

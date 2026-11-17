import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Elemento} from '../types';

const Forma: React.FC<{el: Elemento; s: number}> = ({el, s}) => {
  const c = el.color;
  switch (el.tipo) {
    case 'planeta':
      return (
        <svg width={s} height={s} viewBox="-120 -120 240 240">
          <circle r={80} fill={c ?? '#ff9f43'} stroke="#2a2a2a" strokeWidth={6} />
          <path d="M -60 -30 Q 0 -10 60 -40" stroke="#00000033" strokeWidth={14} fill="none" />
          <path d="M -70 20 Q 0 40 70 10" stroke="#00000033" strokeWidth={12} fill="none" />
          <ellipse rx={118} ry={26} fill="none" stroke="#ffe08a" strokeWidth={10} transform="rotate(-18)" />
        </svg>
      );
    case 'sol':
      return (
        <svg width={s} height={s} viewBox="-120 -120 240 240">
          {new Array(12).fill(0).map((_, i) => (
            <line key={i} x1={0} y1={-90} x2={0} y2={-115} stroke="#ffb400" strokeWidth={12} strokeLinecap="round" transform={`rotate(${i * 30})`} />
          ))}
          <circle r={75} fill={c ?? '#ffd23f'} stroke="#e08e00" strokeWidth={6} />
        </svg>
      );
    case 'luna':
      return (
        <svg width={s} height={s} viewBox="-100 -100 200 200">
          <circle r={80} fill={c ?? '#e9e9f2'} stroke="#9a9ab0" strokeWidth={5} />
          <circle cx={-25} cy={-20} r={14} fill="#c9c9d6" />
          <circle cx={30} cy={25} r={20} fill="#c9c9d6" />
          <circle cx={20} cy={-40} r={8} fill="#c9c9d6" />
        </svg>
      );
    case 'estrella':
      return (
        <svg width={s} height={s} viewBox="-100 -100 200 200">
          <polygon points="0,-90 22,-28 88,-28 35,12 55,78 0,38 -55,78 -35,12 -88,-28 -22,-28" fill={c ?? '#ffe23f'} stroke="#2a2a2a" strokeWidth={6} strokeLinejoin="round" />
        </svg>
      );
    case 'nube':
      return (
        <svg width={s} height={s * 0.6} viewBox="-150 -80 300 160">
          <g fill={c ?? '#fff'} stroke="#2a2a2a" strokeWidth={5}>
            <ellipse cx={-60} cy={20} rx={80} ry={50} />
            <ellipse cx={60} cy={20} rx={80} ry={50} />
            <ellipse cx={0} cy={-15} rx={80} ry={60} />
          </g>
        </svg>
      );
    case 'gota':
      return (
        <svg width={s} height={s} viewBox="-100 -110 200 220">
          <path d="M 0 -95 C 50 -20 75 20 75 45 A 75 75 0 0 1 -75 45 C -75 20 -50 -20 0 -95 Z" fill={c ?? '#4fc3ff'} stroke="#1b6c99" strokeWidth={6} />
        </svg>
      );
    case 'rayo':
      return (
        <svg width={s} height={s} viewBox="-100 -100 200 200">
          <polygon points="20,-95 -55,10 -5,10 -25,95 55,-15 5,-15" fill={c ?? '#ffe23f'} stroke="#2a2a2a" strokeWidth={6} strokeLinejoin="round" />
        </svg>
      );
    case 'corazon':
      return (
        <svg width={s} height={s} viewBox="-100 -100 200 200">
          <path d="M 0 80 C -110 10 -80 -80 0 -35 C 80 -80 110 10 0 80 Z" fill={c ?? '#ff4d6d'} stroke="#2a2a2a" strokeWidth={6} />
        </svg>
      );
    case 'flecha':
      return (
        <svg width={s} height={s * 0.5} viewBox="-120 -60 240 120">
          <path d="M -110 -18 H 30 V -55 L 115 0 L 30 55 V 18 H -110 Z" fill={c ?? '#ff3b3b'} stroke="#2a2a2a" strokeWidth={6} strokeLinejoin="round" />
        </svg>
      );
    case 'pregunta':
    case 'exclamacion':
    case 'numero':
    case 'texto':
    case 'emoji': {
      const texto = el.tipo === 'pregunta' ? '?' : el.tipo === 'exclamacion' ? '!' : el.valor ?? '';
      const esEmoji = el.tipo === 'emoji';
      return (
        <div
          style={{
            fontSize: s * (el.tipo === 'texto' ? 0.28 : 0.8),
            fontFamily: esEmoji ? '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' : 'Montserrat, "Arial Black", Impact, sans-serif',
            fontWeight: 900,
            color: c ?? (el.tipo === 'numero' ? '#ffe23f' : '#fff'),
            WebkitTextStroke: esEmoji ? undefined : `${Math.max(4, s * 0.025)}px #1b1b1b`,
            paintOrder: 'stroke fill',
            textAlign: 'center',
            lineHeight: 1,
            whiteSpace: el.tipo === 'texto' ? 'pre-wrap' : 'nowrap',
            maxWidth: el.tipo === 'texto' ? 900 : undefined,
            textShadow: esEmoji ? undefined : '0 10px 0 rgba(0,0,0,0.35)',
          }}
        >
          {texto}
        </div>
      );
    }
    case 'imagen':
      return el.valor ? <Img src={staticFile(el.valor)} style={{width: s, height: s, objectFit: 'contain'}} /> : null;
    default:
      return null;
  }
};

export const ElementoView: React.FC<{elemento: Elemento}> = ({elemento: el}) => {
  const frame0 = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const frame = frame0 - Math.round((el.retraso ?? 0) * fps);
  if (frame < 0) return null;

  const s = el.tamano ?? 260;
  const anim = el.animacion ?? 'entrar';
  const aparicion = spring({frame, fps, config: {damping: 9, mass: 0.6}});

  let dy = 0;
  let rot = el.rotacion ?? 0;
  let escala = interpolate(aparicion, [0, 1], [0, 1]);
  if (anim === 'flotar') dy = Math.sin(frame / 15) * 20;
  if (anim === 'rebote') dy = -Math.abs(Math.sin(frame / 8)) * 40;
  if (anim === 'girar') rot += frame * 2;
  if (anim === 'latido') escala *= 1 + Math.max(0, Math.sin(frame / 5)) * 0.12;
  if (anim === 'ninguna') escala = 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: el.x * width,
        top: el.y * height + dy,
        transform: `translate(-50%, -50%) scale(${escala}) rotate(${rot}deg)`,
        filter: 'drop-shadow(0 12px 0 rgba(0,0,0,0.25))',
      }}
    >
      <Forma el={el} s={s} />
    </div>
  );
};

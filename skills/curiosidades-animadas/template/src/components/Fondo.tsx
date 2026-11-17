import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import type {Fondo} from '../types';

const W = 1080;
const H = 1920;

const Estrellas: React.FC<{n: number; semilla: string; hasta?: number}> = ({n, semilla, hasta = 1}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const x = random(`${semilla}x${i}`) * W;
        const y = random(`${semilla}y${i}`) * H * hasta;
        const r = 1.5 + random(`${semilla}r${i}`) * 4;
        const brillo = 0.4 + 0.6 * Math.abs(Math.sin(frame / 12 + i));
        return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={brillo} />;
      })}
    </>
  );
};

const Nubes: React.FC<{color?: string; y0?: number}> = ({color = '#fff', y0 = 200}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const x = ((random(`n${i}`) * W + frame * (0.8 + i * 0.4)) % (W + 500)) - 250;
        const y = y0 + i * 260 + random(`ny${i}`) * 80;
        const s = 0.8 + random(`ns${i}`) * 0.7;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
            <ellipse cx={0} cy={0} rx={130} ry={60} fill={color} />
            <ellipse cx={-80} cy={20} rx={90} ry={50} fill={color} />
            <ellipse cx={90} cy={18} rx={100} ry={52} fill={color} />
            <ellipse cx={10} cy={-40} rx={80} ry={60} fill={color} />
          </g>
        );
      })}
    </>
  );
};

export const FondoView: React.FC<{tipo: Fondo}> = ({tipo}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const contenido = (() => {
    switch (tipo) {
      case 'espacio':
        return (
          <>
            <defs>
              <radialGradient id="neb" cx="70%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#5b2a86" />
                <stop offset="55%" stopColor="#1a1446" />
                <stop offset="100%" stopColor="#05030f" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill="url(#neb)" />
            <Estrellas n={140} semilla="esp" />
          </>
        );
      case 'noche':
        return (
          <>
            <defs>
              <linearGradient id="noc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0b1033" />
                <stop offset="100%" stopColor="#2b3a74" />
              </linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#noc)" />
            <Estrellas n={70} semilla="noc" hasta={0.6} />
            <path d={`M0 ${H * 0.78} Q ${W * 0.3} ${H * 0.7} ${W * 0.6} ${H * 0.77} T ${W} ${H * 0.74} V ${H} H 0 Z`} fill="#0d1430" />
          </>
        );
      case 'oceano':
        return (
          <>
            <defs>
              <linearGradient id="oce" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38c6e8" />
                <stop offset="45%" stopColor="#0f6fa8" />
                <stop offset="100%" stopColor="#06213f" />
              </linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#oce)" />
            {new Array(18).fill(0).map((_, i) => {
              const x = random(`bx${i}`) * W;
              const vel = 2 + random(`bv${i}`) * 4;
              const y = H - ((frame * vel + random(`by${i}`) * H) % (H + 100));
              return <circle key={i} cx={x + Math.sin(t * 2 + i) * 10} cy={y} r={6 + random(`br${i}`) * 14} fill="none" stroke="#bff3ff" strokeWidth={3} opacity={0.6} />;
            })}
            <path d={`M0 ${H * 0.9} Q ${W * 0.25} ${H * 0.86} ${W * 0.5} ${H * 0.9} T ${W} ${H * 0.88} V ${H} H 0 Z`} fill="#e3c27a" />
          </>
        );
      case 'cielo':
        return (
          <>
            <defs>
              <linearGradient id="cie" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4fb3ff" />
                <stop offset="100%" stopColor="#c9ecff" />
              </linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#cie)" />
            <Nubes />
            <path d={`M0 ${H * 0.85} Q ${W * 0.4} ${H * 0.78} ${W} ${H * 0.84} V ${H} H 0 Z`} fill="#6cc04a" />
          </>
        );
      case 'ciudad':
        return (
          <>
            <defs>
              <linearGradient id="ciu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff8a5b" />
                <stop offset="100%" stopColor="#ffd27a" />
              </linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#ciu)" />
            {new Array(9).fill(0).map((_, i) => {
              const w = 110 + random(`cw${i}`) * 60;
              const h = 450 + random(`ch${i}`) * 650;
              const x = i * 125 - 20;
              return (
                <g key={i}>
                  <rect x={x} y={H - h - 180} width={w} height={h + 180} fill={i % 2 ? '#3d2f5b' : '#2c2346'} />
                  {new Array(Math.floor(h / 90)).fill(0).map((__, j) => (
                    <rect key={j} x={x + 20} y={H - h - 140 + j * 90} width={w - 40} height={30} fill="#ffe08a" opacity={random(`v${i}-${j}`) > 0.4 ? 0.85 : 0.15} />
                  ))}
                </g>
              );
            })}
          </>
        );
      case 'selva':
        return (
          <>
            <rect width={W} height={H} fill="#bfe8a4" />
            {[0, 1, 2].map((capa) => (
              <path
                key={capa}
                d={`M0 ${H * (0.55 + capa * 0.12)} Q ${W * 0.25} ${H * (0.48 + capa * 0.12)} ${W * 0.5} ${H * (0.56 + capa * 0.12)} T ${W} ${H * (0.52 + capa * 0.12)} V ${H} H 0 Z`}
                fill={['#7cc35a', '#4f9a3c', '#2f6e2a'][capa]}
                transform={`translate(${Math.sin(t + capa) * 15} 0)`}
              />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${80 + i * 230} ${H * 0.62}) rotate(${Math.sin(t * 1.5 + i) * 3})`}>
                <rect x={-14} y={0} width={28} height={420} fill="#6b4423" />
                <circle cx={0} cy={0} r={120} fill="#3f8f32" />
                <circle cx={-70} cy={40} r={80} fill="#4fa83e" />
                <circle cx={70} cy={40} r={80} fill="#4fa83e" />
              </g>
            ))}
          </>
        );
      case 'desierto':
        return (
          <>
            <defs>
              <linearGradient id="des" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb347" />
                <stop offset="100%" stopColor="#ffe3a3" />
              </linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#des)" />
            <circle cx={W * 0.75} cy={H * 0.22} r={130} fill="#fff4c2" opacity={0.95} />
            <path d={`M0 ${H * 0.7} Q ${W * 0.3} ${H * 0.6} ${W * 0.6} ${H * 0.7} T ${W} ${H * 0.66} V ${H} H 0 Z`} fill="#e7a650" />
            <path d={`M0 ${H * 0.82} Q ${W * 0.4} ${H * 0.75} ${W} ${H * 0.83} V ${H} H 0 Z`} fill="#d18b3a" />
          </>
        );
      case 'laboratorio':
        return (
          <>
            <rect width={W} height={H} fill="#dff3f1" />
            {new Array(12).fill(0).map((_, i) => (
              <line key={i} x1={0} y1={i * 160} x2={W} y2={i * 160} stroke="#bfe0dc" strokeWidth={4} />
            ))}
            {new Array(7).fill(0).map((_, i) => (
              <line key={`v${i}`} x1={i * 160} y1={0} x2={i * 160} y2={H} stroke="#bfe0dc" strokeWidth={4} />
            ))}
            <rect x={0} y={H * 0.78} width={W} height={H * 0.22} fill="#5d6b7a" />
            <rect x={0} y={H * 0.78} width={W} height={24} fill="#8796a5" />
          </>
        );
      case 'cuerpo':
        return (
          <>
            <defs>
              <radialGradient id="cue" cx="50%" cy="50%" r="75%">
                <stop offset="0%" stopColor="#ff8aa1" />
                <stop offset="100%" stopColor="#8a1538" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill="url(#cue)" />
            {new Array(14).fill(0).map((_, i) => {
              const x = ((random(`gx${i}`) * W + frame * (3 + random(`gv${i}`) * 4)) % (W + 200)) - 100;
              const y = random(`gy${i}`) * H;
              return (
                <ellipse key={i} cx={x} cy={y} rx={46} ry={30} fill="#d9223f" stroke="#a3112b" strokeWidth={6} transform={`rotate(${(frame + i * 20) % 360} ${x} ${y})`} opacity={0.75} />
              );
            })}
          </>
        );
      default:
        return <rect width={W} height={H} fill="#222" />;
    }
  })();

  const deriva = interpolate(Math.sin(t / 2), [-1, 1], [-10, 10]);

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{transform: `translateY(${deriva}px) scale(1.03)`}}>
        {contenido}
      </svg>
    </AbsoluteFill>
  );
};

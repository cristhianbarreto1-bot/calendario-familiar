import {interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import type {Expresion} from '../types';

/**
 * "Dato": personaje 2D original del canal. Un frijol redondo con ojos grandes.
 * La boca se mueve según el volumen real de la voz (lip-sync aproximado).
 */
export const Personaje: React.FC<{
  expresion: Expresion;
  x: number;
  senala: boolean;
  tamano: number;
  desdeFrame: number;
  voz: string;
  color?: string;
  haciaDerecha: boolean;
}> = ({expresion, x, senala, tamano, desdeFrame, voz, color = '#ffcf3f', haciaDerecha}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const audio = useAudioData(staticFile(voz));

  // Apertura de boca 0..1 a partir del audio, en el frame global
  let apertura = 0;
  if (audio) {
    const muestras = visualizeAudio({fps, frame: frame + desdeFrame, audioData: audio, numberOfSamples: 16});
    const promedio = muestras.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    apertura = Math.min(1, promedio * 9);
  }

  const entrada = spring({frame, fps, config: {damping: 11, mass: 0.7}});
  const rebote = Math.sin(frame / 6) * 8 + apertura * -10;
  const parpadeo = frame % 75 > 70 ? 0.1 : 1;

  const escala = 1.15 * tamano * interpolate(entrada, [0, 1], [0.4, 1]);
  const cx = x * width;
  const cy = height * 0.72;
  const dir = haciaDerecha ? 1 : -1;

  const ojos = (() => {
    const base = {rx: 34, ry: 40 * parpadeo};
    if (expresion === 'sorprendido' || expresion === 'asustado') return {rx: 40, ry: 50 * parpadeo, pupila: 12};
    if (expresion === 'riendo' || expresion === 'feliz') return {...base, ry: expresion === 'riendo' ? 8 : 34 * parpadeo, pupila: 16};
    return {...base, pupila: 16};
  })();

  const cejas = {
    normal: {y: -150, rot: 0},
    feliz: {y: -158, rot: -8},
    sorprendido: {y: -175, rot: -12},
    pensativo: {y: -150, rot: 14},
    asustado: {y: -168, rot: 18},
    riendo: {y: -160, rot: -10},
  }[expresion];

  const bocaAbierta = Math.max(apertura, expresion === 'sorprendido' || expresion === 'asustado' ? 0.55 : 0);
  const bocaAlto = 6 + bocaAbierta * 55;
  const bocaAncho = expresion === 'feliz' || expresion === 'riendo' ? 70 : 52;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{position: 'absolute', inset: 0}}
    >
      <g transform={`translate(${cx} ${cy + rebote}) scale(${escala * dir} ${escala})`}>
        {/* sombra */}
        <ellipse cx={0} cy={250} rx={150} ry={26} fill="#000" opacity={0.25} />
        {/* piernas */}
        <rect x={-70} y={170} width={30} height={80} rx={14} fill="#333" />
        <rect x={40} y={170} width={30} height={80} rx={14} fill="#333" />
        {/* brazo trasero */}
        <path d="M -150 20 Q -210 80 -190 140" stroke="#333" strokeWidth={22} fill="none" strokeLinecap="round" />
        {/* cuerpo */}
        <path
          d="M 0 -230 C 150 -230 190 -90 180 40 C 170 170 90 210 0 210 C -90 210 -170 170 -180 40 C -190 -90 -150 -230 0 -230 Z"
          fill={color}
          stroke="#2a2a2a"
          strokeWidth={10}
        />
        <ellipse cx={-70} cy={-150} rx={40} ry={22} fill="#fff" opacity={0.35} />
        {/* brazo delantero: señala o saluda */}
        {senala ? (
          <g transform={`rotate(${-20 + Math.sin(frame / 5) * 4} 150 10)`}>
            <path d="M 150 10 L 290 -60" stroke="#333" strokeWidth={22} strokeLinecap="round" />
            <circle cx={295} cy={-62} r={20} fill="#333" />
            <path d="M 305 -70 L 345 -90" stroke="#333" strokeWidth={12} strokeLinecap="round" />
          </g>
        ) : (
          <path d={`M 150 20 Q 215 ${80 + Math.sin(frame / 7) * 10} 195 140`} stroke="#333" strokeWidth={22} fill="none" strokeLinecap="round" />
        )}
        {/* cejas */}
        <g stroke="#2a2a2a" strokeWidth={12} strokeLinecap="round">
          <line x1={-95} y1={cejas.y} x2={-35} y2={cejas.y} transform={`rotate(${cejas.rot} -65 ${cejas.y})`} />
          <line x1={35} y1={cejas.y} x2={95} y2={cejas.y} transform={`rotate(${-cejas.rot} 65 ${cejas.y})`} />
        </g>
        {/* ojos */}
        {[-65, 65].map((ox) =>
          expresion === 'riendo' ? (
            <path key={ox} d={`M ${ox - 32} -75 Q ${ox} -125 ${ox + 32} -75`} stroke="#2a2a2a" strokeWidth={12} fill="none" strokeLinecap="round" />
          ) : (
          <g key={ox}>
            <ellipse cx={ox} cy={-85} rx={ojos.rx} ry={Math.max(4, ojos.ry)} fill="#fff" stroke="#2a2a2a" strokeWidth={7} />
            {ojos.ry > 12 ? (
              <circle cx={ox + 10} cy={-80 + (expresion === 'pensativo' ? -18 : 0)} r={ojos.pupila} fill="#1b1b1b" />
            ) : null}
          </g>
          ),
        )}
        {/* mejillas */}
        <circle cx={-115} cy={-15} r={22} fill="#ff7a7a" opacity={0.45} />
        <circle cx={115} cy={-15} r={22} fill="#ff7a7a" opacity={0.45} />
        {/* boca */}
        <ellipse cx={0} cy={10 + bocaAlto / 2} rx={bocaAncho} ry={bocaAlto / 2 + 4} fill="#5a1220" stroke="#2a2a2a" strokeWidth={7} />
        {bocaAlto > 25 ? <ellipse cx={0} cy={10 + bocaAlto * 0.8} rx={bocaAncho * 0.5} ry={bocaAlto * 0.18} fill="#ff6f86" /> : null}
        {expresion === 'asustado' ? (
          <path d="M 150 -170 q 10 25 0 40 q -10 -15 0 -40" fill="#7fd6ff" />
        ) : null}
      </g>
    </svg>
  );
};

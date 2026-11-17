import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Palabra} from '../types';

const POR_GRUPO = 3;

/** Subtítulos grandes palabra por palabra, la palabra actual resaltada. */
export const Subtitulos: React.FC<{palabras: Palabra[]}> = ({palabras}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  if (palabras.length === 0) return null;

  // Agrupar en bloques de N palabras (corta también en puntuación)
  const grupos: Palabra[][] = [];
  let actual: Palabra[] = [];
  for (const p of palabras) {
    actual.push(p);
    if (actual.length >= POR_GRUPO || /[.,!?;:]$/.test(p.palabra)) {
      grupos.push(actual);
      actual = [];
    }
  }
  if (actual.length) grupos.push(actual);

  const grupo = grupos.find((g, i) => {
    const fin = grupos[i + 1]?.[0].inicio ?? g[g.length - 1].fin + 0.4;
    return t >= g[0].inicio && t < fin;
  });
  if (!grupo) return null;

  const inicioGrupo = Math.round(grupo[0].inicio * fps);
  const pop = spring({frame: frame - inicioGrupo, fps, config: {damping: 12, mass: 0.5}});

  return (
    <div
      style={{
        position: 'absolute',
        top: 840,
        left: 50,
        right: 50,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 26px',
        transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})`,
      }}
    >
      {grupo.map((p, i) => {
        const activa = t >= p.inicio && t < p.fin + 0.05;
        return (
          <span
            key={i}
            style={{
              fontFamily: 'Montserrat, "Arial Black", Impact, sans-serif',
              fontWeight: 900,
              fontSize: activa ? 104 : 96,
              color: activa ? '#ffe23f' : '#ffffff',
              WebkitTextStroke: '14px #111',
              paintOrder: 'stroke fill',
              textTransform: 'uppercase',
              textShadow: '0 10px 0 rgba(0,0,0,0.5)',
              lineHeight: 1.15,
            }}
          >
            {p.palabra.replace(/[.,;:]$/, '')}
          </span>
        );
      })}
    </div>
  );
};

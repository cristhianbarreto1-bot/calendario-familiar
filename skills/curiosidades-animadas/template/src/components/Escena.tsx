import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Escena} from '../types';
import {FondoView} from './Fondo';
import {Personaje} from './Personaje';
import {ElementoView} from './Elementos';
import {Titular} from './Titular';

export const EscenaView: React.FC<{
  escena: Escena;
  desdeFrame: number;
  voz: string;
  colorPersonaje?: string;
}> = ({escena, desdeFrame, voz, colorPersonaje}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // Transición de entrada: pequeño zoom + fundido muy corto
  const entrada = spring({frame, fps, config: {damping: 14, mass: 0.6}});
  const escalaEntrada = interpolate(entrada, [0, 1], [1.08, 1]);
  const opacidad = interpolate(frame, [0, 4], [0, 1], {extrapolateRight: 'clamp'});

  // Zoom lento tipo "Ken Burns" para que nada quede estático
  const zoomLento = escena.zoom === false ? 1 : interpolate(frame, [0, durationInFrames], [1, 1.06]);

  const sacudida = escena.sacudir && frame < 12
    ? Math.sin(frame * 2.3) * (12 - frame) * 1.6
    : 0;

  const posX = {izquierda: 0.27, centro: 0.5, derecha: 0.73}[escena.personaje?.posicion ?? 'centro'];

  return (
    <AbsoluteFill
      style={{
        opacity: opacidad,
        transform: `scale(${escalaEntrada * zoomLento}) translateX(${sacudida}px)`,
      }}
    >
      <FondoView tipo={escena.fondo} />
      {(escena.elementos ?? []).map((el, i) => (
        <ElementoView key={i} elemento={el} />
      ))}
      {escena.personaje ? (
        <Personaje
          expresion={escena.personaje.expresion}
          x={posX}
          senala={escena.personaje.senala ?? false}
          tamano={escena.personaje.tamano ?? 1}
          desdeFrame={desdeFrame}
          voz={voz}
          color={colorPersonaje}
          haciaDerecha={escena.personaje.posicion !== 'derecha'}
        />
      ) : null}
      {escena.titular ? <Titular texto={escena.titular} /> : null}
      {escena.sfx ? <Audio src={staticFile(`sfx/${escena.sfx}.wav`)} volume={0.55} /> : null}
    </AbsoluteFill>
  );
};

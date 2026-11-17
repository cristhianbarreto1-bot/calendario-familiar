import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import data from './data/video.json';
import type {VideoData} from './types';
import {EscenaView} from './components/Escena';
import {Subtitulos} from './components/Subtitulos';
import {BarraProgreso} from './components/BarraProgreso';

const video = data as VideoData;

export const Short: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {video.escenas.map((escena, i) => {
        const desde = Math.round(escena.inicio * fps);
        const duracion = Math.max(1, Math.round(escena.fin * fps) - desde);
        return (
          <Sequence key={i} from={desde} durationInFrames={duracion} name={`Escena ${i + 1}`}>
            <EscenaView
              escena={escena}
              desdeFrame={desde}
              voz={video.voz}
              colorPersonaje={video.colorPersonaje}
            />
          </Sequence>
        );
      })}
      <Subtitulos palabras={video.subtitulos} />
      <BarraProgreso />
      <Audio src={staticFile(video.voz)} />
      {video.musica ? (
        <Audio src={staticFile(video.musica)} volume={video.volumenMusica ?? 0.12} loop />
      ) : null}
    </AbsoluteFill>
  );
};

export type Fondo =
  | 'espacio'
  | 'oceano'
  | 'cielo'
  | 'ciudad'
  | 'selva'
  | 'laboratorio'
  | 'desierto'
  | 'noche'
  | 'cuerpo';

export type Expresion =
  | 'normal'
  | 'feliz'
  | 'sorprendido'
  | 'pensativo'
  | 'asustado'
  | 'riendo';

export type Animacion = 'rebote' | 'flotar' | 'girar' | 'latido' | 'entrar' | 'ninguna';

export type Elemento = {
  tipo:
    | 'planeta'
    | 'sol'
    | 'luna'
    | 'estrella'
    | 'nube'
    | 'gota'
    | 'rayo'
    | 'corazon'
    | 'flecha'
    | 'pregunta'
    | 'exclamacion'
    | 'numero'
    | 'texto'
    | 'emoji'
    | 'imagen';
  /** texto, número, emoji o ruta de imagen dentro de public/ */
  valor?: string;
  /** posición relativa 0..1 */
  x: number;
  y: number;
  tamano?: number;
  color?: string;
  rotacion?: number;
  animacion?: Animacion;
  /** segundos desde el inicio de la escena */
  retraso?: number;
};

export type Escena = {
  inicio: number;
  fin: number;
  fondo: Fondo;
  personaje?: {
    expresion: Expresion;
    posicion: 'izquierda' | 'centro' | 'derecha';
    senala?: boolean;
    tamano?: number;
  } | null;
  elementos?: Elemento[];
  titular?: string;
  sfx?: 'pop' | 'whoosh' | 'ding' | 'boing' | 'tension' | null;
  zoom?: boolean;
  sacudir?: boolean;
};

export type Palabra = {palabra: string; inicio: number; fin: number};

export type VideoData = {
  titulo: string;
  voz: string;
  musica?: string | null;
  volumenMusica?: number;
  duracion: number;
  colorPersonaje?: string;
  escenas: Escena[];
  subtitulos: Palabra[];
};

---
name: curiosidades-animadas
description: Crea YouTube Shorts / Reels / TikToks animados en 2D del nicho "curiosidades" (datos sorprendentes de ciencia, animales, cuerpo humano, espacio, historia) en ~10 minutos. Propone 5 ideas con guion, prepara el texto para la voz en off de ElevenLabs, y monta el video vertical completo (personaje animado con lip-sync, fondos, elementos, subtítulos palabra por palabra, música y efectos) con Remotion. Usar cuando el usuario diga "hacé un short", "nuevo video de curiosidades", "dame ideas para shorts", "armá el video con la voz", "curiosidades animadas", o pida producir contenido corto animado para su canal.
---

# Curiosidades Animadas: shorts animados en 5 pasos

Flujo: **carpeta → plantilla → 5 ideas → voz en ElevenLabs → montaje automático**.
El objetivo es un short de 30 a 50 segundos, vertical 1080×1920, con un personaje 2D propio ("Dato")
que reacciona a lo que dice la voz, subtítulos grandes y ritmo rápido (un cambio visual cada 2 a 4 s).

Rutas: `SKILL_DIR` es la carpeta de esta skill. `BASE` es la carpeta de trabajo del usuario
(por defecto `~/curiosidades-animadas`; preguntar solo la primera vez y recordarla).

## Paso 1 · Preparación (solo la primera vez)
1. Verificar requisitos: `node -v` (≥18), `ffmpeg -version`, `python3 -c "import numpy"`.
   Si falta algo, decir exactamente qué instalar (Node.js LTS desde nodejs.org; ffmpeg; `pip install numpy`).
2. Crear `BASE` si no existe. Si existe `BASE/canal.md`, leerlo: tiene el tono, el color del personaje,
   la voz elegida y la lista de temas ya publicados (para no repetirlos).
   Si no existe, crearlo con la plantilla de `references/canal.md`.

## Paso 2 · Instalación de la plantilla (por cada video)
```bash
bash "$SKILL_DIR/scripts/nuevo_proyecto.sh" "$BASE/<AAAA-MM-DD>-<tema-corto>"
```
Copia el motor de animación (`template/`, un proyecto Remotion), instala dependencias (la primera vez tarda
1 o 2 minutos; luego se reutiliza la caché) y genera los efectos y la música base libres de derechos.
Antes de editar escenas, leer `references/escenas.md` (el "motor gráfico": fondos, expresiones y elementos disponibles).

## Paso 3 · Generación de ideas
Leer `references/guiones.md` y proponer **5 ideas** en una tabla: título gancho, dato central,
por qué engancha, subtema (animales/espacio/cuerpo/historia/ciencia). Reglas:
- Datos **verdaderos y verificables**. Si hay duda, buscar en la web y anotar la fuente. Nunca inventar datos.
- No repetir temas que figuren en `canal.md`.
- Variar subtemas entre ideas.

El usuario elige una (o pide "elegí vos"). Escribir el guion completo con la estructura
gancho → dato → giro → remate + CTA (85 a 120 palabras ≈ 35 a 45 s) y guardarlo en `<proyecto>/guion.txt`
**solo con el texto que se va a leer** (sin acotaciones).

## Paso 4 · Audio (voz en off)
Opción A (manual, como en el método original):
- Mostrar el guion listo para copiar y las indicaciones de `references/elevenlabs.md`.
- El usuario lo genera en elevenlabs.io, lo descarga y lo guarda como `<proyecto>/public/voz.mp3`.
- Esperar confirmación y verificar que el archivo existe.

Opción B (automática, si existe `ELEVENLABS_API_KEY`):
```bash
python3 "$SKILL_DIR/scripts/elevenlabs_tts.py" "<proyecto>" --voz <voice_id>
```

Luego calcular los tiempos de cada palabra (para subtítulos y para sincronizar escenas):
```bash
python3 "$SKILL_DIR/scripts/tiempos.py" "<proyecto>"
```
Usa la alineación exacta de ElevenLabs si existe, si no faster-whisper si está instalado, y si no
reparte las palabras según los silencios del audio (aproximado pero suficiente).
Si el guion leído difiere del audio (el usuario cambió algo), corregir `guion.txt` y repetir.

## Paso 5 · Animación y montaje
1. Leer `src/data/video.json` (ya trae `duracion` y `subtitulos` con tiempos).
2. Dividir la locución en **escenas de 2 a 4 s** alineadas con los tiempos de las palabras: cada escena
   empieza cuando arranca la frase o la idea que ilustra. La última escena termina en `duracion`.
3. Para cada escena elegir fondo, expresión del personaje, posición, 1 a 3 elementos que **ilustren
   literalmente** lo que se dice, un sfx en los momentos clave y un `titular` solo en el gancho y en el CTA.
   Seguir las reglas de composición de `references/escenas.md` (zonas, variedad, ritmo).
4. Escribir el `video.json` completo, poner `titulo` y `colorPersonaje` (de `canal.md`).
5. Verificar: `npx tsc --noEmit` y renderizar 2 o 3 fotogramas de control:
   `npx remotion still Short out/control.png --frame=<n>`. Mirar las imágenes y corregir superposiciones.
6. Renderizar: `npx remotion render Short out/short.mp4`.
7. Si un tema necesita algo que no está en el catálogo (un pulpo, una pirámide, un cerebro...),
   está permitido crear un componente SVG nuevo en `src/components/` y agregarlo como `tipo` en
   `Elementos.tsx` y `types.ts`. Mantener el estilo: contorno `#2a2a2a` de 5 a 7 px y colores planos y saturados.

## Entrega
- Ruta del MP4 final.
- Título (≤60 caracteres, con gancho), descripción de 2 líneas con 3 a 5 hashtags (#curiosidades #sabiasque ...)
  y un comentario fijado con una pregunta para generar respuestas.
- Agregar el tema a la lista de publicados de `canal.md`.
- Recordar el checklist de `references/monetizacion.md` (sobre todo que el contenido debe aportar valor original y
  que en YouTube hay que marcar "contenido alterado o sintético" si corresponde).

## Modo lote
Si el usuario pide "hacé 3 videos", repetir los pasos 2 a 5 por idea. Con la opción A de voz, pedir las 3 voces
juntas para no frenar el flujo. No producir videos casi idénticos: variar fondos, estructura del gancho y subtemas.

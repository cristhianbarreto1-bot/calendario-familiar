# Voz en off con ElevenLabs

## Manual (web)
1. Entrar a elevenlabs.io → **Text to Speech**.
2. Modelo: **Eleven Multilingual v2** (mejor español). Elegir una voz enérgica y clara. Usar siempre la misma voz:
   es parte de la identidad del canal (anotarla en `canal.md`).
3. Ajustes sugeridos: Stability 35 a 45 %, Similarity 75 a 85 %, Style 30 a 40 %, Speed 1.05 a 1.1.
4. Pegar el guion **tal cual** (puntos y signos de pregunta cambian la entonación). Generar y escuchar.
5. Descargar en MP3 y guardar como `public/voz.mp3` dentro de la carpeta del proyecto.

## Automático (API)
- Crear una API key en ElevenLabs y definirla: `export ELEVENLABS_API_KEY=...` (Windows: `setx ELEVENLABS_API_KEY ...`).
- `voice_id`: en la web, abrir la voz → "Copy voice ID".
- `python3 scripts/elevenlabs_tts.py <proyecto> --voz <voice_id>` crea `voz.mp3` y `alineacion.json` (tiempos exactos).

## Licencia
Para monetizar hace falta un plan pago de ElevenLabs (el gratuito exige atribución y no permite uso comercial).

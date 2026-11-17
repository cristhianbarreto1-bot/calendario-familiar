#!/usr/bin/env python3
"""(Opcional) Genera la voz con la API de ElevenLabs y guarda los tiempos exactos.

Reemplaza el paso manual de "generar en la web, descargar y copiar a la carpeta".
Requiere la variable de entorno ELEVENLABS_API_KEY.

Uso:
  python3 elevenlabs_tts.py <proyecto> --voz <voice_id> [--guion guion.txt]
        [--modelo eleven_multilingual_v2] [--estabilidad 0.4] [--estilo 0.35] [--velocidad 1.08]

Crea public/voz.mp3 y public/alineacion.json (luego correr tiempos.py).
"""
import argparse
import base64
import json
import os
import sys
import urllib.request
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("proyecto")
    ap.add_argument("--voz", required=True, help="voice_id de ElevenLabs")
    ap.add_argument("--guion", default=None)
    ap.add_argument("--modelo", default="eleven_multilingual_v2")
    ap.add_argument("--estabilidad", type=float, default=0.4)
    ap.add_argument("--similitud", type=float, default=0.8)
    ap.add_argument("--estilo", type=float, default=0.35)
    ap.add_argument("--velocidad", type=float, default=1.08)
    args = ap.parse_args()

    clave = os.environ.get("ELEVENLABS_API_KEY")
    if not clave:
        sys.exit("Falta ELEVENLABS_API_KEY. Alternativa: generá la voz en elevenlabs.io y guardala como public/voz.mp3")

    proy = Path(args.proyecto)
    guion = Path(args.guion) if args.guion else proy / "guion.txt"
    texto = guion.read_text(encoding="utf-8").strip()

    cuerpo = {
        "text": texto,
        "model_id": args.modelo,
        "voice_settings": {
            "stability": args.estabilidad,
            "similarity_boost": args.similitud,
            "style": args.estilo,
            "use_speaker_boost": True,
            "speed": args.velocidad,
        },
    }
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{args.voz}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(cuerpo).encode(),
        headers={"xi-api-key": clave, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())

    pub = proy / "public"
    pub.mkdir(parents=True, exist_ok=True)
    (pub / "voz.mp3").write_bytes(base64.b64decode(data["audio_base64"]))
    alin = {k: data[k] for k in ("alignment", "normalized_alignment") if k in data}
    (pub / "alineacion.json").write_text(json.dumps(alin, ensure_ascii=False), encoding="utf-8")
    print(f"Voz guardada en {pub / 'voz.mp3'} y tiempos en {pub / 'alineacion.json'}")


if __name__ == "__main__":
    main()

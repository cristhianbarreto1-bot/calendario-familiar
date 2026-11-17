#!/usr/bin/env python3
"""Calcula el tiempo de cada palabra de la locución y lo escribe en video.json.

Uso:
  python3 tiempos.py <proyecto> [--guion guion.txt] [--metodo auto|elevenlabs|whisper|proporcional]

<proyecto> es la carpeta del proyecto (la que tiene public/ y src/data/video.json).
Busca la voz en public/<video.json:voz> (por defecto public/voz.mp3).

Métodos (auto los prueba en este orden):
  elevenlabs   -> usa public/alineacion.json creado por elevenlabs_tts.py (exacto)
  whisper      -> usa faster-whisper si está instalado (pip install faster-whisper)
  proporcional -> reparte las palabras del guion según la duración y los silencios (aprox.)

Escribe en video.json: "duracion" y "subtitulos": [{palabra, inicio, fin}, ...]
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def duracion_audio(ruta: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(ruta)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def silencios(ruta: Path, umbral="-35dB", minimo=0.18):
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(ruta), "-af", f"silencedetect=noise={umbral}:d={minimo}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    fin = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(ini, fin))


def por_elevenlabs(alin: Path):
    data = json.loads(alin.read_text(encoding="utf-8"))
    a = data.get("normalized_alignment") or data.get("alignment") or data
    chars = a["characters"]
    ini = a["character_start_times_seconds"]
    fin = a["character_end_times_seconds"]
    palabras, actual, t0, t1 = [], "", None, None
    for c, s, e in zip(chars, ini, fin):
        if c.isspace():
            if actual:
                palabras.append({"palabra": actual, "inicio": round(t0, 3), "fin": round(t1, 3)})
            actual, t0 = "", None
            continue
        if t0 is None:
            t0 = s
        actual += c
        t1 = e
    if actual:
        palabras.append({"palabra": actual, "inicio": round(t0, 3), "fin": round(t1, 3)})
    return palabras


def por_whisper(voz: Path):
    from faster_whisper import WhisperModel  # type: ignore

    modelo = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = modelo.transcribe(str(voz), language="es", word_timestamps=True)
    palabras = []
    for seg in segs:
        for w in seg.words or []:
            texto = w.word.strip()
            if texto:
                palabras.append({"palabra": texto, "inicio": round(w.start, 3), "fin": round(w.end, 3)})
    return palabras


def proporcional(voz: Path, guion: str):
    palabras = guion.split()
    if not palabras:
        sys.exit("El guion está vacío: pasá --guion con el texto de la locución.")
    total = duracion_audio(voz)
    sil = [(s, e) for s, e in silencios(voz)]
    # tramos con voz = complemento de los silencios
    tramos, cursor = [], 0.0
    for s, e in sil:
        if s > cursor + 0.05:
            tramos.append((cursor, s))
        cursor = max(cursor, e)
    if cursor < total - 0.05:
        tramos.append((cursor, total))
    if not tramos:
        tramos = [(0.0, total)]
    hablado = sum(e - s for s, e in tramos)
    pesos = [len(re.sub(r"\W", "", p)) + 2 + (4 if re.search(r"[.!?]$", p) else 0) for p in palabras]
    escala = hablado / sum(pesos)

    def a_real(x):  # tiempo "hablado" -> tiempo real, saltando silencios
        for s, e in tramos:
            if x <= e - s:
                return s + x
            x -= e - s
        return total

    res, acc = [], 0.0
    for p, w in zip(palabras, pesos):
        ini, acc = acc, acc + w * escala
        res.append({"palabra": p, "inicio": round(a_real(ini), 3), "fin": round(a_real(acc), 3)})
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("proyecto")
    ap.add_argument("--guion", help="archivo .txt con el texto exacto de la locución")
    ap.add_argument("--metodo", default="auto", choices=["auto", "elevenlabs", "whisper", "proporcional"])
    args = ap.parse_args()

    proy = Path(args.proyecto)
    vj = proy / "src" / "data" / "video.json"
    video = json.loads(vj.read_text(encoding="utf-8"))
    voz = proy / "public" / video.get("voz", "voz.mp3")
    if not voz.exists():
        sys.exit(f"No encuentro la voz en {voz}. Descargala de ElevenLabs y guardala ahí.")

    guion_txt = ""
    if args.guion:
        guion_txt = Path(args.guion).read_text(encoding="utf-8")
    elif (proy / "guion.txt").exists():
        guion_txt = (proy / "guion.txt").read_text(encoding="utf-8")

    alin = proy / "public" / "alineacion.json"
    palabras, usado = None, None
    orden = [args.metodo] if args.metodo != "auto" else ["elevenlabs", "whisper", "proporcional"]
    for m in orden:
        try:
            if m == "elevenlabs" and alin.exists():
                palabras = por_elevenlabs(alin)
            elif m == "whisper":
                palabras = por_whisper(voz)
            elif m == "proporcional":
                palabras = proporcional(voz, guion_txt)
            if palabras:
                usado = m
                break
        except ImportError:
            continue
        except Exception as e:  # noqa: BLE001
            print(f"[aviso] método {m} falló: {e}", file=sys.stderr)

    if not palabras:
        sys.exit("No pude calcular los tiempos. Pasá --guion guion.txt para usar el método proporcional.")

    video["duracion"] = round(duracion_audio(voz), 3)
    video["subtitulos"] = palabras
    vj.write_text(json.dumps(video, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK ({usado}): {len(palabras)} palabras, duración {video['duracion']} s -> {vj}")


if __name__ == "__main__":
    main()

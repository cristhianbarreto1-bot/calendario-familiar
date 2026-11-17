#!/usr/bin/env python3
"""Genera efectos de sonido y una música de fondo libre de derechos (sintetizados).

Uso: python3 sonidos_base.py <carpeta_public>
Crea: sfx/pop.wav, whoosh.wav, ding.wav, boing.wav, tension.wav y musica/fondo.wav
Todo es generado por código, así que no hay problemas de copyright.
"""
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100


def guardar(ruta: Path, x: np.ndarray) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.9, -1, 1)
    datos = (x * 32767).astype(np.int16)
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(datos.tobytes())


def t(seg: float) -> np.ndarray:
    return np.linspace(0, seg, int(SR * seg), endpoint=False)


def env(n: int, ataque=0.005, caida=6.0) -> np.ndarray:
    tt = np.arange(n) / SR
    a = np.minimum(1, tt / ataque)
    return a * np.exp(-tt * caida)


def pop():
    x = t(0.15)
    f = 900 * np.exp(-x * 25) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.001, 30)


def whoosh():
    x = t(0.6)
    ruido = np.random.default_rng(1).normal(size=len(x))
    # filtro paso banda "barrido" simple con media móvil variable
    out = np.zeros_like(ruido)
    acc = 0.0
    for i, r in enumerate(ruido):
        k = 0.02 + 0.3 * np.sin(np.pi * i / len(x))
        acc += k * (r - acc)
        out[i] = acc
    return out * np.sin(np.pi * x / x[-1]) ** 2


def ding():
    x = t(1.2)
    e = env(len(x), 0.002, 3.5)
    return (np.sin(2 * np.pi * 1318 * x) + 0.5 * np.sin(2 * np.pi * 2637 * x) + 0.3 * np.sin(2 * np.pi * 1975 * x)) * e


def boing():
    x = t(0.5)
    f = 220 + 180 * np.sin(2 * np.pi * 9 * x) * np.exp(-x * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.002, 5)


def tension():
    x = t(1.5)
    f = 80 + 60 * x
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.6 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    return s * np.minimum(1, x / 1.2)


def musica(segundos=32, bpm=100):
    """Loop alegre tipo 'ukelele/marimba' para curiosidades: acordes I-V-vi-IV."""
    beat = 60 / bpm
    total = np.zeros(int(SR * segundos))
    acordes = [[261.6, 329.6, 392.0], [196.0, 246.9, 293.7], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6]]
    n_beats = int(segundos / beat)
    for b in range(n_beats):
        acorde = acordes[(b // 4) % 4]
        inicio = int(b * beat * SR)
        # arpegio marimba
        for j, nota in enumerate([acorde[0], acorde[1], acorde[2], acorde[1]]):
            ini = inicio + int(j * beat / 4 * SR)
            x = t(0.35)
            tono = np.sin(2 * np.pi * nota * 2 * x) + 0.3 * np.sin(2 * np.pi * nota * 8 * x)
            s = tono * env(len(x), 0.002, 9) * 0.35
            fin = min(len(total), ini + len(s))
            total[ini:fin] += s[: fin - ini]
        # bajo
        x = t(beat * 0.9)
        s = np.sin(2 * np.pi * acorde[0] / 2 * x) * env(len(x), 0.005, 3) * 0.5
        fin = min(len(total), inicio + len(s))
        total[inicio:fin] += s[: fin - inicio]
        # click de percusión suave
        if b % 2 == 1:
            x = t(0.05)
            s = np.random.default_rng(b).normal(size=len(x)) * env(len(x), 0.0005, 80) * 0.25
            total[inicio : inicio + len(s)] += s
    return total


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    pub = Path(sys.argv[1])
    for nombre, fn in [("pop", pop), ("whoosh", whoosh), ("ding", ding), ("boing", boing), ("tension", tension)]:
        guardar(pub / "sfx" / f"{nombre}.wav", fn())
    guardar(pub / "musica" / "fondo.wav", musica())
    print(f"Sonidos generados en {pub}")


if __name__ == "__main__":
    main()

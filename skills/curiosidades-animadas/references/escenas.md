# Motor gráfico: catálogo y reglas de `video.json`

Lienzo 1080×1920 a 30 fps. Los tiempos van en **segundos**. Las posiciones `x` e `y` van de 0 a 1 (relativas).

## Esquema
```json
{
  "titulo": "Los pulpos tienen tres corazones",
  "voz": "voz.mp3",
  "musica": "musica/fondo.wav",          // o null; puede ser cualquier archivo de public/
  "volumenMusica": 0.1,                  // 0.08 a 0.15; la voz siempre manda
  "duracion": 38.2,                      // lo escribe tiempos.py
  "colorPersonaje": "#ffcf3f",
  "escenas": [
    {
      "inicio": 0, "fin": 2.6,
      "fondo": "oceano",
      "titular": "¿Sabías que...?",     // opcional, cartel rojo arriba
      "sfx": "whoosh",                   // pop | whoosh | ding | boing | tension | null
      "sacudir": false,                  // temblor de cámara al entrar (sorpresas)
      "zoom": true,                      // zoom lento (true por defecto)
      "personaje": {"expresion": "sorprendido", "posicion": "izquierda", "senala": true, "tamano": 1},
      "elementos": [
        {"tipo": "numero", "valor": "3", "x": 0.72, "y": 0.3, "tamano": 380, "animacion": "rebote"},
        {"tipo": "corazon", "x": 0.72, "y": 0.36, "tamano": 180, "animacion": "latido", "retraso": 0.5}
      ]
    }
  ],
  "subtitulos": [ {"palabra": "¿Sabías", "inicio": 0, "fin": 0.4} ]   // lo escribe tiempos.py
}
```

## Fondos
`espacio` · `noche` · `oceano` · `cielo` · `ciudad` · `selva` · `desierto` · `laboratorio` · `cuerpo` (interior rojo con glóbulos)

## Personaje "Dato"
- `expresion`: `normal`, `feliz`, `sorprendido`, `pensativo`, `asustado` (gota de sudor), `riendo`
- `posicion`: `izquierda`, `centro`, `derecha`. `senala: true` levanta el brazo hacia el lado contrario.
- Mueve la boca solo según el volumen de la voz. Respira, parpadea y entra con rebote.
- `personaje: null` deja la escena solo con elementos (usar como mucho 1 de cada 4 escenas).

## Elementos
| tipo | uso | `valor` |
|---|---|---|
| planeta, sol, luna, estrella, nube, gota, rayo, corazon | íconos SVG | – |
| flecha | señalar algo (usar `rotacion`) | – |
| pregunta, exclamacion | signos gigantes | – |
| numero | cifras grandes amarillas | "3", "1.000", "-89°C" |
| texto | frase corta en pantalla (≤3 palabras) | texto |
| emoji | cualquier emoji como objeto | "🐙" |
| imagen | PNG/SVG propio en `public/` | "img/piramide.png" |

Opciones comunes: `tamano` (px, 120 a 420), `color`, `rotacion`, `retraso` (s desde el inicio de la escena),
`animacion`: `entrar` (por defecto), `rebote`, `flotar`, `girar`, `latido`, `ninguna`.

## Reglas de composición (importantes)
- **Zonas**: titular arriba (y≈0.1); **elementos en y 0.15 a 0.38**; **subtítulos en y≈0.44 a 0.55 (dejarla libre)**;
  personaje abajo (y≈0.6 a 0.95). Nunca poner elementos sobre la zona de subtítulos.
- `texto` y `numero` anchos: usar x=0.5 o, si el personaje está a un costado, x del lado opuesto (0.68 a 0.72) con texto corto.
- Personaje a la izquierda → elementos a la derecha (x 0.65 a 0.8), y al revés.
- Cambiar algo en cada escena: fondo, posición del personaje o elementos. No repetir el mismo fondo más de 2 escenas seguidas.
- `sacudir` + `sfx: "boing"` o `"tension"` solo en el giro sorpresa.
- `ding` cuando se revela un dato. `pop` cuando aparecen elementos. `whoosh` en cambios de lugar.
- El gancho siempre lleva `titular` y un elemento grande. La última escena lleva el CTA en `titular`.
- Emojis: en Windows y Mac se ven en color. Si el render los muestra como cuadrados, reemplazarlos por íconos SVG.

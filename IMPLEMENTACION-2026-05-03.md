# Registro de implementación — 3 de mayo de 2026

Resumen de cambios en `code/victor-prieto-landing-example/` (landings WalkDog / Victor Prieto) durante la sesión del 3 de mayo de 2026.

---

## Opción 1 (`landing-opcion-1`)

### Hero / vídeo
- El bloque del vídeo dejó de verse como “tarjeta” extra: en `.video-card` se retiraron fondo semitransparente, borde, `backdrop-filter`, padding y sombra alrededor del reproductor. Se mantiene el flex para agrupar vídeo y CTA.

**Archivos:** `landing-opcion-1.css`

### Sección «Esto es lo que viven la mayoría de dueños»
- Tres **cards** en grid (`.problem__grid`): cada artículo lleva **imagen arriba** (`.problem__thumb`) y texto debajo (`.problem__body` con `h3` + `p`).
- Assets por card: **`card-pg-1.webp`**, **`card-pg-2.webp`**, **`card-pg-3.webp`** (misma carpeta que el HTML).
- **Imagen completa (sin recorte):** las miniaturas usan `width: 100%` y `height: auto` (sin `aspect-ratio` forzado ni `object-fit: cover`), para que se vea el encuadre completo de cada `.webp`.
- Las cards de resultados (`.result-cards`) siguen con estilo propio: padding uniforme, sin confundirse con el layout flex de las cards del bloque problema.

**Archivos:** `landing-opcion-1.html`, `landing-opcion-1.css`

---

## Opción 2 (`landing-opcion-2`)

### Sección «Resultados y pruebas sociales»
- Estructura **`.proof-card`** + **`.proof-card__thumb`** con imágenes locales `card-1.webp` … `card-4.webp`; el copy de la métrica queda en el **`alt`** de cada imagen.
- Miniaturas sin forzar recorte en CSS: `width: 100%`, `height: auto` en `.proof-card__thumb img`.

**Archivos:** `landing-opcion-2.html`, `landing-opcion-2.css`

### Bloque problema (tres cards con fotos)
- **No forma parte de la opción 2:** la sección tipo «Esto es lo que viven la mayoría de dueños» con `card-pg-*` se descartó en esta variante; el flujo pasa del **hero** a **Resultados y pruebas sociales**.

**Archivos:** `landing-opcion-2.html`, `landing-opcion-2.css` (sin reglas `.problem`)

### Sección «Sobre el instructor»
- Foto desde **`instructor.png`** en `.about__image`.
- Foto visible al completo en el bloque: `background-size: 100% 100%` en el degradado y **`contain`** para la imagen del instructor.

**Archivos:** `landing-opcion-2.css`

---

## Dependencias de archivos estáticos

Colocar en `victor-prieto-landing-example/` junto a las landings:

| Archivo | Uso |
|--------|-----|
| `card-pg-1.webp`, `card-pg-2.webp`, `card-pg-3.webp` | Opción 1 — imágenes del bloque problema (una por card) |
| `card-1.webp` … `card-4.webp` | Opción 2 — prueba social |
| `instructor.png` | Opción 2 — bloque «Sobre el instructor» |

---

## Notas

- **Opción 1:** embudo con problema en tres cards + imágenes `card-pg-*`; no incluye la cuadrícula de cuatro métricas ni el bloque «Sobre el instructor» de la opción 2.
- **Opción 2:** hero oscuro + cuatro cards de métricas + guion + instructor + CTA; scripts compartidos (`landing-drive-video.js`, `landing-anti-inspect.js`) sin cambios en esta sesión.

---

*Actualizado el 3 de mayo de 2026.*

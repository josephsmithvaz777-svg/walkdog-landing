# Changelog — WalkDog Landing (Víctor Prieto)

Registro de avances por sesión de desarrollo.

---

## 13 de julio de 2026

### Botón flotante promo ELITE

- Nuevo FAB fijo abajo a la derecha con imagen `assets/btn-promo-elite-floating.webp` (PROMO / Plan ELITE).
- Contenedor circular (`border-radius` + `clip-path`) para que no se vea cuadrado.
- Botón **X** negro con borde blanco, tamaño proporcional al círculo (~24% del diámetro), estilo alineado a la referencia.
- Clic del badge → checkout plan **premium** (`data-checkout-plan="premium"`).
- Cerrar guarda preferencia en `localStorage` (`wd_promo_elite_dismissed`) para no volver a mostrarlo.
- Se eleva si el banner de cookies está abierto.
- Script nuevo: `landing-promo-float.js`.

### Menú — móvil y escritorio

- **Móvil:** orden invertido → **Iniciar sesión** antes del botón hamburguesa.
- **Escritorio:** logo WalkDog más grande y desplazado un poco a la derecha; altura de barra ajustada.
- **Móvil:** logo también un poco más grande (ajuste previo de la misma sesión).

**Despliegue landing:**

```
index.html
landing.css
landing-promo-float.js
assets/btn-promo-elite-floating.webp
```

---

## 12 de julio de 2026

### Copy — frase con «tú»

- Frase actualizada en **membresías** y **sección final `#cta`**:
  - **tu perro cambia cuando tú aprendes a guiarlo**

### Menú landing — Beneficios, Testimonios y login CTA

- Enlaces nuevos: **Beneficios** (`#beneficios` → banner ENTRENAMIENTO REAL) y **Testimonios** (`#testimonios`).
- Orden: Inicio · Conócenos · Beneficios · Testimonios · Planes.
- **Iniciar sesión** separado de la pastilla crema, con degradado amarillo CTA (`--gradient-warm`).
- Scroll spy actualizado para las nuevas secciones.
- Scroll extra en **Planes**; Beneficios ancla al caption del banner.

### Cookies de publicidad (landing)

- Banner tipo **Autorización de uso de cookies** (panel blanco, acentos amarillos WalkDog).
- Modal **Configuración** con categorías: seguridad (siempre activas), publicidad (toggle), técnicas (siempre activas).
- Botones: Configuración / Acepto todas las cookies / Guardar preferencias.
- Cookie `wd_cookie_consent` (180 días). Publicidad solo si acepta o activa el toggle.
- Config en `landing-urls.js` → `ads.metaPixelId` / `ads.adsenseClient`.
- Página `politica-cookies.html` + enlaces en footer.

### Login plataforma (`formacion.walkdogentrena.com/login`)

- Columna izquierda con **foto de Víctor Prieto** (`public/images/victor-prieto.webp`).
- Tagline debajo del título: *tu perro cambia cuando tú aprendes a guiarlo*.
- Logo WalkDog en la topbar (reemplaza texto).
- Estilos en `resources/css/app.css` y `resources/views/layouts/guest.blade.php`.

**Despliegue landing:**

```
index.html
landing.css
landing-nav.js
```

**Despliegue plataforma:**

```
resources/views/layouts/guest.blade.php
resources/css/app.css
public/images/victor-prieto.webp
public/images/walkdog-logo.webp
public/build/
```

---

## 5 de julio de 2026

### CTAs — texto unificado

- Todos los botones amarillos (`btn-pricing-v2`) muestran **¡SUSCRIBIRME YA!** en mayúsculas.
- Aplica al hero (video), secciones intermedias, tarjetas de planes y sección final `#cta`.
- El botón del hero deja la flecha `→`; el texto queda igual que el resto.

### Copy — titular y frases

| Ubicación | Antes | Ahora |
|-----------|--------|--------|
| **Membresías** (`#membresias`) — título | *(cambiado temporalmente)* | **SISTEMA VÍCTOR PRIETO** (restaurado) |
| **Membresías** — subtítulo | *No entreno perros. Formo dueños que su perro respeta naturalmente.* | **tu perro cambia cuando tú aprendes a guiarlo** |
| **Sección final** (`#cta`) — título | *(cambiado temporalmente)* | **EL SISTEMA / VÍCTOR PRIETO** (restaurado) |
| **Sección final** — subtítulo | *No entreno perros…* | **tu perro cambia cuando tú aprendes a guiarlo** |

Las menciones a Víctor Prieto dentro de las tarjetas de planes (mentorías, bonus ELITE, etc.) no se modificaron.

### Menú superior — diseño y comportamiento

- **Siempre visible** en escritorio (ya no se oculta ni aparece con hover).
- **Más compacto:** menos padding vertical en la pastilla y en los enlaces; barra más baja (`--site-nav-height: 3.35rem`).
- **Más ancho:** logo pegado al borde izquierdo y menú al derecho (`--site-nav-gutter` más estrecho que `--page-gutter`); se quitó `container` del nav.
- **Página activa:** enlace resaltado al hacer scroll — **Inicio** (hero y secciones superiores) / **Planes** (desde `#membresias`).
- **Colores WalkDog:** hover naranja (`--warm-end`); activo amarillo (`--warm-start`) con subrayado en degradado `--gradient-warm`.
- **Scroll spy** en `landing-nav.js` (`data-nav-section` en Inicio y Planes).

### Redes sociales (Conócenos)

- Orden en el popup: **Instagram** → **Facebook** → **WhatsApp**.
- URLs oficiales:
  - [instagram.com/walkdogperu](https://www.instagram.com/walkdogperu/)
  - [facebook.com/walkdogperu](https://www.facebook.com/walkdogperu)
  - WhatsApp: `https://wa.link/xcijqx`

### Checkout — topbar (sesión anterior, incluido en deploy)

- Logo imagen, «← Volver a planes», «¿Ya tienes cuenta? Iniciar sesión».
- Sin menú completo (menos fricción en conversión).

**Cache busting (landing):** `landing.css?v=20260705c`, `landing-nav.js?v=4`, `landing-urls.js?v=4`, `landing-drive-video.js?v=20260704b`

**Cache busting (checkout):** `landing.css?v=20260704g`, `landing-urls.js?v=4`, `landing-checkout.js?v=17`

### Despliegue Hostinger (`public_html/`)

**Mínimo (cambios del 5 jul):**

```
index.html
landing.css
landing-nav.js
```

**Deploy completo recomendado:**

```
index.html
landing.css
landing-nav.js
landing-urls.js
landing-plans.js
landing-drive-video.js
checkout.html
landing-checkout.js
assets/walkdog-logo.webp
assets/VICTOR-PRIETO.webp   (si falta)
```

Tras subir: probar en incógnito o Ctrl+F5. Si el menú no responde, revisar en F12 → Red que `landing-nav.js` no devuelva **404**.

---

## 4 de julio de 2026

### Navegación landing (`index.html`)

- Logo **WalkDog** (`assets/walkdog-logo.webp`) a la izquierda; menú en pastilla blanca a la derecha.
- Enlaces: **Inicio**, **Conócenos** (popup: Instagram, Facebook, WhatsApp), **Planes** (`#membresias`), **Iniciar sesión** (plataforma).
- Nav transparente dentro de `.landing-flow` (sin franja negra).
- Escritorio: menú en pastilla blanca siempre visible *(ajustado el 5 jul: antes era hover)*.
- Móvil: hamburguesa + dropdown.
- Redes en `landing-urls.js`: [Instagram](https://www.instagram.com/walkdogperu/), [Facebook](https://www.facebook.com/walkdogperu), WhatsApp `https://wa.link/xcijqx`.

### Móvil — tipografía y video hero

- Títulos más pequeños (`--fs-h1`, `--fs-h2` y media queries).
- Badges del video fuera del frame; fix en `landing-drive-video.js` (`lockVideoAspect` usa ancho del frame × 16:9).

### Checkout — topbar (sin menú completo)

- Logo con imagen en lugar del texto «WalkDog».
- Se mantiene **«← Volver a planes»**.
- **«¿Ya tienes cuenta? Iniciar sesión»** en la topbar (enlace a `WalkDogUrls.login`).
- El enlace de login del formulario sigue al pie; ambos usan `data-platform-login`.
- Sin menú de navegación completo (menos fricción en conversión).

**Cache busting (landing):** `landing.css?v=20260704f`, `landing-nav.js`, `landing-urls.js?v=4`, `landing-drive-video.js?v=20260704b`

**Cache busting (checkout):** `landing.css?v=20260704g`, `landing-urls.js?v=4`, `landing-checkout.js?v=17`

### Despliegue landing (Hostinger)

Subir como mínimo:

- `index.html`, `landing.css`, `landing-nav.js`, `landing-urls.js`, `landing-drive-video.js`
- `checkout.html`, `landing-checkout.js`
- `assets/walkdog-logo.webp` (si falta en el servidor)

**Importante:** si `Conócenos` o el menú móvil no responden en producción, revisar que `landing-nav.js` esté subido a `public_html/` (sin ese archivo el navegador devuelve 404 y el JS del menú no carga). `Iniciar sesión` tiene URL de respaldo en el HTML aunque falle el script.

---

## 29 de junio de 2026

### Culqi — pagos CONTROL y ELITE en producción ✅

- **Problema:** checkout devolvía 422 con *"Culqi rechazó la consulta de planes"*; token de tarjeta se creaba bien (201) pero fallaba el backend.
- **Causa real:** Culqi movió la API de recurrencia a rutas `/v2/recurrent/...`. `GET /v2/plans` respondía **HTTP 400** aunque `CULQI_SECRET_KEY` fuera válida.
- **Fix en Laravel** (`walkdog-platform` → `app/Services/Billing/CulqiService.php`):
  - `GET /recurrent/plans` (listar / resolver código → `pln_test_…`)
  - `POST /recurrent/subscriptions/create` con `tyc: true`
  - `DELETE /recurrent/subscriptions/{id}`
- **IDs de planes en producción** (`.env` en `formacion.walkdogentrena.com`):

  | Plan | Código CulqiPanel | ID API |
  |------|-------------------|--------|
  | START | `plan-ba-2026` | `pln_test_ETfhKA5317a8Xw1z` |
  | CONTROL | `plan-int-2026` | `pln_test_Gm79DNul6jckD833` |
  | ELITE | `plan-pre-2026` | `pln_test_50ykHqMV9I4waWTU` |

- **Checkout probado en producción** con tarjeta de prueba Culqi — flujo completo OK (registro + pago + redirect a plataforma).

### Despliegue Laravel en Hostinger

- Subdominio `formacion.walkdogentrena.com` → `public_html/formacion/public`
- PHP **8.4**, deploy vía `tar.gz` + `composer install`, migraciones y seeders
- CORS y `landing-urls.js` apuntando a la API de producción

### Recordatorio — UI de checkout

- Formulario propio arriba (correo, nombre, contraseña) + **solo datos de tarjeta** Culqi embebidos abajo (`#culqi-container`, `hiddenEmail: true`).
- Los enlaces `subscriptions.culqi.com/onboarding?id=…` sirven para **crear planes** en CulqiPanel, no son formularios de pago.

---

## 28 de junio de 2026

### Identidad Sistema Víctor Prieto

- Tipografía unificada: **Cabinet Grotesk** en títulos y cuerpo; títulos en mayúsculas.
- Planes renombrados: **START** / **CONTROL** / **ELITE** (slugs `basico`, `intermedio`, `premium`).
- Popup bonus exclusivos en plan ELITE (`landing-plans.js`).
- Sección final `#cta` con foto Víctor (`assets/VICTOR-PRIETO.webp`).

### Checkout landing

- `checkout.html` — layout dos columnas, panel **Ver plan completo** expandible en página.
- `landing-checkout.js` — Culqi Checkout Custom embebido, integración `GET/POST` API Laravel.
- `landing-urls.js` — detección automática local vs producción.

**Cache busting (checkout):** `landing.css?v=20260628s`, `landing-checkout.js?v=16`

### Culqi — primer diagnóstico

- Fix parcial: no enviar `Content-Type: application/json` en GET (Laravel `CulqiService`).
- Documentado flujo distinto: START = cargo único; CONTROL/ELITE = suscripción recurrente.

---

## 24 de junio de 2026

- Checkout estático conectado a Laravel (`POST /api/landing/checkout`).
- Culqi Checkout Custom embebido; registro + pago + login firmado a plataforma.
- Ver `IMPLEMENTACION-2026-06-24.md`.

# Implementación — 24 de junio de 2026

Documentación del trabajo realizado hoy: checkout con Culqi desde la landing estática hacia la plataforma Laravel (WalkDog).

---

## Resumen

Se conectó la landing (`walkdogentrena.com`) con la plataforma Laravel (`formacion.walkdogentrena.com`) para permitir **registro + pago con tarjeta** en una sola página, sin WordPress.

Flujo probado con éxito:

1. Usuario elige plan en la landing → `checkout.html?plan=basico|intermedio|premium`
2. Completa contacto, contraseña y tarjeta (Culqi Checkout Custom embebido)
3. Laravel crea usuario, procesa pago y devuelve URL firmada de login
4. Usuario entra a `/inicio` como miembro con el plan asignado

---

## Arquitectura

```
Landing (HTML/JS)                    Laravel (walkdog-platform)
─────────────────                    ───────────────────────────
index.html                           POST /api/landing/checkout
  └─ botones data-checkout-plan  →     LandingCheckoutController
checkout.html                            ├─ registro usuario
  └─ landing-checkout.js                   ├─ CulqiService (cargo/suscripción)
  └─ landing-urls.js                       └─ PlanService (plan_rank)
       └─ GET /api/landing/config
       └─ POST /api/landing/checkout
       └─ Culqi checkout-js (pk_test_…)
                                         GET /auth/landing/{user} (signed)
                                         POST /webhooks/culqi
```

---

## Planes y precios

| Plan        | Slug         | Precio      | Tipo          | `plan_rank` | Código Culqi      |
|-------------|--------------|-------------|---------------|-------------|-------------------|
| START       | `basico`     | $50         | Pago único    | 1           | `plan-ba-2026`    |
| CONTROL     | `intermedio` | $100/mes    | Suscripción   | 2           | `plan-int-2026`   |
| ELITE       | `premium`    | $1.000/año  | Suscripción   | 3           | `plan-pre-2026`   |

Configuración en Laravel: `walkdog-platform/config/walkdog/plans.php`

---

## Landing — archivos principales

| Archivo | Rol |
|---------|-----|
| `checkout.html` | Página checkout dos columnas (plan + formulario) |
| `landing-checkout.js` | Culqi Custom embebido, validación, API Laravel |
| `landing-urls.js` | URLs plataforma, API, clave pública Culqi (fallback) |
| `landing-plans.js` | Enlaces `checkoutPage(plan)` desde la home |
| `landing.css` | Estilos checkout, contenedor Culqi, columnas |

### URLs (desarrollo y producción)

En `landing-urls.js` la plataforma se elige automáticamente:

```javascript
// Local (Live Server, localhost, 127.0.0.1, puertos 5500/8080)
PLATFORM: 'http://127.0.0.1:8000'

// Producción (cualquier otro host)
PLATFORM: 'https://formacion.walkdogentrena.com'

apiConfig:   PLATFORM + '/api/landing/config'
apiCheckout: PLATFORM + '/api/landing/checkout'
culqiPublicKey: 'pk_test_…'  // fallback si falla GET config
```

**Importante:** `checkout.html` se sirve desde la **landing** (`walkdogentrena.com`), no desde Laravel.

### Culqi Checkout Custom (embebido)

- Script: `https://js.culqi.com/checkout-js`
- Contenedor: `#culqi-container` con `modal: false`
- Configuración clave:
  - `client.email` — correo del campo Contacto (un solo correo para el usuario)
  - `appearance.hiddenEmail: true` — ocultar campo email duplicado de Culqi
  - CSS `:has()` + JS — respaldo para ocultar bloque «CORREO ELECTRÓNICO» de Culqi
  - Culqi se monta **solo cuando el correo de Contacto es válido**
  - El correo se sincroniza al input oculto de Culqi antes del pago

### Layout checkout

- Encabezado **Completa tu inscripción** arriba de ambas columnas.
- Grid 50/50 alineado arriba (plan compacto + formulario).
- Botón **Ver plan completo** expande beneficios, bonus (ELITE), ideal para y resultado en la misma página.
- Contenedor Culqi sin scroll interno forzado (`overflow: visible`, altura automática).

### Versión actual de assets

- `landing-checkout.js?v=16`
- `landing.css?v=20260628s`

---

## Laravel — archivos principales

| Archivo | Rol |
|---------|-----|
| `app/Http/Controllers/Api/LandingCheckoutController.php` | `GET config`, `POST checkout` |
| `app/Http/Controllers/LandingAuthController.php` | Login automático con URL firmada |
| `app/Http/Controllers/CulqiWebhookController.php` | Webhooks Culqi v2 |
| `app/Services/Billing/CulqiService.php` | Cargos, suscripciones, clientes |
| `app/Services/Billing/CheckoutService.php` | Orquesta pago + grant plan |
| `app/Services/Billing/PlanService.php` | Asigna `plan_rank` al usuario |
| `app/Http/Middleware/AllowLandingOrigin.php` | CORS para la landing |

### Rutas API (sin CSRF, con CORS)

```
GET  /api/landing/config
POST /api/landing/checkout
GET  /auth/landing/{user}   (signed, temporary)
POST /webhooks/culqi
```

### Payload checkout (landing → Laravel)

```json
{
  "name": "joshua smith",
  "email": "usuario@correo.com",
  "password": "********",
  "password_confirmation": "********",
  "plan": "basico",
  "token": "tok_test_..."
}
```

### Nombre en panel Culqi

Culqi Checkout Custom **no tiene campo de nombre** en el widget. El nombre del formulario se envía en el backend al crear el cargo:

```php
'antifraud_details' => [
    'first_name' => 'joshua',
    'last_name'  => 'smith',
    'email'      => 'usuario@correo.com',
    // address, country_code, phone_number…
]
```

Así en CulqiPanel → Ventas aparece el nombre real y no `first_last_name` (placeholder de tarjetas de prueba).

---

## Pruebas Culqi (sandbox)

Solo con llaves `pk_test_` / `sk_test_`. Documentación: [Tarjetas de prueba Culqi](https://docs.culqi.com/es/documentacion/pagos-online/tarjetas-de-prueba)

### Pago exitoso (recomendada)

| Campo | Valor |
|-------|-------|
| Número | `4111 1111 1111 1111` |
| Vencimiento | `09/30` |
| CVV | `123` |

### Con 3DS

- Correo: `review@culqi.com`
- Tarjeta: `4456 5300 0000 1005` · `07/30` · `111`

### Prueba realizada (24 jun)

- Usuario: joshua smith / `primevis01@gmail.com`
- Plan START $50 — cargo `chr_test_…` — estado **Aprobada** en CulqiPanel
- Acceso confirmado en plataforma (perfil + miembro)

### Flujos Culqi por tipo de plan

| Tipo | Endpoint principal | Necesita `GET /plans` |
|------|-------------------|----------------------|
| Pago único (START) | `POST /charges` | No |
| Suscripción (CONTROL, ELITE) | `POST /subscriptions` | Sí (resolver `plan-int-2026` → `pln_…`) |

El cargo de $50 funcionó porque no consulta planes. Las suscripciones fallaban con **400** en `GET /plans?limit=100` (ver fix abajo).

### Onboarding planes Culqi (suscripciones)

| Plan | URL |
|------|-----|
| CONTROL | https://subscriptions.culqi.com/onboarding?id=fc4577f0-bb79-4a7b-979d-958219fb4b9c |
| ELITE | https://subscriptions.culqi.com/onboarding?id=1ee98075-7f55-43b6-95e4-2d24e74a3f7a |

Tras crear el plan en CulqiPanel, usar el ID `pln_test_…` en `.env`:

```
CULQI_PLAN_INTERMEDIO_ID=pln_test_XXXXX
CULQI_PLAN_PREMIUM_ID=pln_test_YYYYY
```

---

## Entorno local

### Landing

Servir con **Live Server** u otro servidor HTTP:

```
http://127.0.0.1:5500/checkout.html?plan=basico
```

No abrir como `file://` — Culqi y CORS fallan con rutas locales de archivo.

### Laravel

```bash
cd walkdog-platform
php artisan serve
# http://127.0.0.1:8000
```

Variables en `.env` (no commitear):

```
CULQI_PUBLIC_KEY=pk_test_...
CULQI_SECRET_KEY=sk_test_...
CULQI_PLAN_BASICO_ID=plan-ba-2026
CULQI_PLAN_INTERMEDIO_ID=pln_test_...   # o plan-int-2026
CULQI_PLAN_PREMIUM_ID=pln_test_...      # o plan-pre-2026
```

Tras cambiar IDs: `php artisan cache:clear`

Orígenes permitidos para CORS: `config/walkdog.php` → `landing_origins`

### Tests PHPUnit

```bash
cd walkdog-platform
php artisan test
```

Incluye `LandingCheckoutTest` (registro + `antifraud_details`) y `BillingTest`.

---

## Problemas resueltos hoy

| Problema | Solución |
|----------|----------|
| Popup Culqi v4 modal | Migrado a Checkout Custom embebido |
| Formulario recortado / franja negra Culqi | `overflow: visible`, banner/toolbar ocultos |
| Email pedido 2 veces | `hiddenEmail` + `client.email` + montar Culqi tras email válido + CSS/JS ocultar campo |
| Scroll interno en widget Culqi | `max-height: none`, `expandCulqiLayout()` |
| Columnas desbalanceadas | Grid `2fr / 3fr`, form `max-width: 520px` |
| `first_last_name` en CulqiPanel | `antifraud_details` con nombre del formulario en `CulqiService` |
| Remontaje al cambiar nombre rompía email | Solo remontar Culqi si cambia el **correo** |
| Suscripción CONTROL/ELITE falla con 400 en `GET /plans` | `CulqiService`: no enviar `Content-Type: application/json` en GET; mensajes de error mejorados |
| Mensaje genérico "Error desconocido…" | `extractError()` ahora muestra HTTP status y cuerpo de Culqi |

---

## Despliegue — qué subir dónde

### Landing (`walkdogentrena.com`)

```
index.html
landing.css
landing-plans.js
landing-urls.js
checkout.html
landing-checkout.js
assets/VICTOR-PRIETO.webp
assets/img-dog-plan-*.webp
```

### Laravel (`formacion.walkdogentrena.com`)

- App completa + `.env` Culqi
- `app/Services/Billing/CulqiService.php` (fix GET planes)
- Webhook: `POST /webhooks/culqi`
- CORS: origen `https://walkdogentrena.com` en `landing_origins`

---

## Pendiente / siguientes pasos

1. Completar onboarding Culqi de **CONTROL** y **ELITE**; poner `pln_test_…` en `.env`.
2. Probar suscripciones en sandbox tras `php artisan cache:clear`.
3. Deploy: checkout en landing + Laravel con fix Culqi en producción.
4. Confirmar webhooks en CulqiPanel → `https://formacion.walkdogentrena.com/webhooks/culqi`.
5. (Opcional) Alinear START como `billing_period: once` en `config/walkdog/plans.php`.

---

## Webhooks Culqi (Laravel)

Eventos esperados (v2):

- `subscription.creation.succeeded`
- `subscription.update.succeeded`
- `subscription.cancel.succeeded`

URL producción:

```
POST https://formacion.walkdogentrena.com/webhooks/culqi
```

---

## Referencias

- [Culqi Checkout Custom](https://docs.culqi.com/es/documentacion/checkout/checkout-custom)
- [Tarjetas de prueba](https://docs.culqi.com/es/documentacion/pagos-online/tarjetas-de-prueba)
- [Cargos únicos — antifraud_details](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/cargos)

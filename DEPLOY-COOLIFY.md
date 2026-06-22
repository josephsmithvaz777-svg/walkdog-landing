# Despliegue WalkDog en Coolify

Dos servicios en el VPS (`109.123.243.128`):

| Servicio | Dominio | Tipo |
|----------|---------|------|
| **landing** | `https://walkdogentrena.com` | Static Site (nginx) |
| **wordpress** | `https://app.walkdogentrena.com` | WordPress + MariaDB |

---

## 1. DNS en Cloudflare (`walkdogentrena.com`)

En **DNS → Records**, todos con **DNS only** (nube gris):

| Tipo | Nombre | Contenido |
|------|--------|-----------|
| A | `@` | `109.123.243.128` |
| A | `www` | `109.123.243.128` |
| A | `app` | `109.123.243.128` |

TTL: Auto. No hace falta proxy naranja para Coolify.

---

## 2. Landing estática (`walkdogentrena.com`)

### Archivos que debe incluir el build

Sube o conecta el repo con al menos:

```
index.html
landing.css
landing-urls.js
landing-drive-video.js
landing-plans.js
landing-anti-inspect.js
problem-carousel.js
results-carousel.js
assets/          ← imágenes, favicons, og-share.jpg
```

### Opción A — Dockerfile (recomendada)

1. Coolify → **+ New Resource** → **Application**
2. **Source**: Git (este repo) o sube el ZIP del proyecto
3. **Build Pack**: Dockerfile
4. **Dockerfile location**: `Dockerfile` (en la raíz del repo)
5. **Base directory**: `/` (raíz — debe contener `index.html` y `assets/`)
6. **Domains**: `https://walkdogentrena.com,https://www.walkdogentrena.com`
7. **Port**: `80`
8. Deploy

> **Importante:** la carpeta `assets/` debe existir en el repo antes del build (imágenes, favicons, `og-share.jpg`).

### Opción B — Static Site sin Docker

Si Coolify ofrece **Static Site** directo:

1. Sube los archivos listados arriba
2. Dominio: `https://walkdogentrena.com`
3. Index: `index.html`

### Quitar dominio del WordPress viejo

En el servicio WordPress **actual** (unhealthy):

1. **Configuration → Domains**
2. **Elimina** `https://walkdogentrena.com`
3. Guarda y redeploy solo cuando `app.` esté configurado (paso 3)

---

## 3. WordPress plataforma (`app.walkdogentrena.com`)

### Si ya tienes el servicio WordPress en Coolify

1. Abre el servicio **wordpress** (Walkdogs → production)
2. **Configuration → Domains**:
   - Quita: `https://walkdogentrena.com`
   - Pon: `https://app.walkdogentrena.com`
3. **Save** → **Redeploy**
4. Revisa **Logs** hasta que pase a **healthy**

### Si el servicio sigue unhealthy

1. **Logs** del contenedor WordPress: errores de DB
2. **Logs** de MariaDB/MySQL
3. Comprueba variables:
   - `WORDPRESS_DB_HOST` (nombre del servicio DB en la red Docker)
   - `WORDPRESS_DB_USER`, `WORDPRESS_DB_PASSWORD`, `WORDPRESS_DB_NAME`
4. **Stop** → espera 10 s → **Start**
5. Healthcheck: debe responder `http://localhost:80/wp-login.php` dentro del contenedor

### WordPress — URLs del sitio

Tras el primer arranque, en **wp-admin** (`https://app.walkdogentrena.com/wp-admin/`):

- **Ajustes → General**
  - Dirección de WordPress (URL): `https://app.walkdogentrena.com`
  - Dirección del sitio (URL): `https://app.walkdogentrena.com`

O en `wp-config.php`:

```php
define('WP_HOME', 'https://app.walkdogentrena.com');
define('WP_SITEURL', 'https://app.walkdogentrena.com');
```

### PMPro / checkout

Los enlaces de la landing ya apuntan a:

- `https://app.walkdogentrena.com/checkout/?level=1|2|3`
- `https://app.walkdogentrena.com/mi-area/`

---

## 4. Verificación

```bash
curl -I https://walkdogentrena.com/
# Esperado: HTTP 200, HTML de la landing

curl -I https://app.walkdogentrena.com/wp-login.php
# Esperado: HTTP 200

curl -s https://walkdogentrena.com/ | findstr /i "<title>"
# WalkDog | Metodo de Transformacion Canina
```

En el navegador:

- [ ] `https://walkdogentrena.com/` — landing con candado
- [ ] Botón «Suscribirme» → lleva a `app.walkdogentrena.com/checkout/...`
- [ ] `https://app.walkdogentrena.com/wp-admin/` — login WordPress
- [ ] Sin «no available server» ni 503

---

## 5. Estructura en Coolify (resumen)

```
VPS 109.123.243.128 (Coolify + Traefik)
│
├── landing (nginx static)
│   └── walkdogentrena.com, www.walkdogentrena.com
│
└── wordpress + mariadb
    └── app.walkdogentrena.com
```

---

## 6. corporacionsolara.pe

Ese dominio va en **DonWeb/Ferozo** (`200.58.111.146`), no en este VPS. No mezclar con Coolify.

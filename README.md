# Yourwave

Sitio estático construido con Astro, Tailwind CSS y daisyUI.

## Desarrollo

```sh
npm install
npm run dev
```

## Producción

Define `SITE_URL` con el origen público definitivo antes de compilar. Astro usará ese valor para generar URLs canónicas, `robots.txt` y el sitemap XML.

```sh
SITE_URL=https://tu-dominio.example npm run build
npm run preview
```

Configura la misma variable en el entorno de build del proveedor de despliegue. Sin ella, no se publican URLs canónicas ni sitemap, para evitar indexar un dominio incorrecto.

## Contenido y metadatos

El layout común está en `src/layouts/Layout.astro`. Cada página puede pasar `title`, `description`, `canonicalUrl` e `image`. La identidad y descripción por defecto se mantienen en `src/config/seo.ts`.

El layout genera Open Graph, Twitter Cards y JSON-LD de `Organization`, `WebSite` y `WebPage` usando únicamente datos disponibles en el sitio. Añade datos como perfiles `sameAs`, dirección o contacto solo cuando estén verificados. Para GEO, prioriza contenido original, preciso, con encabezados semánticos y respuestas directas; los datos estructurados lo complementan, no lo sustituyen.

## Rendimiento

Las páginas se prerenderizan como HTML estático y no requieren JavaScript de cliente por defecto. Para imágenes locales, usa `Image` de `astro:assets` con dimensiones y texto alternativo; incorpora componentes hidratados solo cuando una interacción lo necesite.

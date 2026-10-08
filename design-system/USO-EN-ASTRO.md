# Cómo usar este sistema en el proyecto Astro

Esta carpeta es una copia del sistema de diseño Your Wave. Fuente de verdad: `tokens.json` y `README.md` (la guía de marca). No edites `tokens.css` a mano: se genera desde `tokens.json`.

## Qué hay aquí

- `README.md` — guía de marca: voz, color, tipografía, imagen, logotipo y estructura de la home. Léela antes de diseñar cualquier página.
- `tokens.json` — todos los tokens con su nota de uso.
- `tokens.css` — los tokens como variables CSS (`--surface`, `--primary`, `--space-6`, `--radius-md`…), tema claro en `:root` y oscuro en `[data-theme="dark"]`, más las clases de texto `.yw-display-xl`, `.yw-heading-2`, `.yw-body`, `.yw-eyebrow`, etc.
- `components/` — referencia de los 6 componentes (Button, Badge, SessionCard, WaveDivider, Testimonial, FaqItem): `*/README.md` con las reglas de uso, `bundle.css` con los estilos exactos (clases `yw-*`) e `index.d.ts` con las props. `bundle.js` es la versión React del sistema: en Astro, reescríbelos como componentes `.astro` sin JavaScript de cliente (FaqItem usa `<details>` nativo).
- `assets/Logos/` — logotipos originales (JPG sobre blanco; aún no hay versión vectorial).

## Integración recomendada (Tailwind v4 + daisyUI)

1. En `src/styles/global.css`, después de `@import "tailwindcss";`, importa `../../design-system/tokens.css` y expón los tokens a Tailwind con `@theme inline` (por ejemplo `--color-surface: var(--surface); --color-primary: var(--primary); --font-display: var(--font-display);`) para poder usar `bg-surface`, `text-ink`, `font-display`…
2. Si se usa daisyUI, crea un tema `yourwave` que mapee sus colores (`--color-primary`, `--color-base-100`…) a estos tokens, en vez de usar los temas por defecto.
3. Carga las fuentes de Google Fonts (Josefin Sans 300/400/600, Nunito Sans 400/600/700, Sacramento) en `Layout.astro` con `preconnect`, o autoalójalas.
4. Copia los logos a `src/assets/` y úsalos con `Image` de `astro:assets`.
5. Nota: `tokens.css` define `--radius-sm/md/lg` y `--font-sans`, que Tailwind v4 también usa: las clases `rounded-md`, `font-sans`… tomarán los valores de Your Wave. Es intencionado.

## Reglas que no se negocian

- Colores, tipos, espacios y radios siempre desde los tokens; nada de hex sueltos.
- Contraste mínimo 4.5:1 en texto. `wave-sky` y `sun` nunca como texto sobre fondo claro.
- El degradado del logo no se usa en la interfaz.
- Textos en español, tuteo, sin emojis. No inventes testimonios, cifras ni precios: deja marcadores claros.

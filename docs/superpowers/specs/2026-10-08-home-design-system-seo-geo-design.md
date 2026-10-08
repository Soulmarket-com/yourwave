# Home: sistema de diseño, SEO, GEO y rendimiento

Fecha: 2026-10-08

## Objetivo

Construir la home de Your Wave (`src/pages/index.astro`) usando el sistema de
diseño ya definido en `design-system/`, con el contenido real del mockup
`doc/propuesta-v2/` (no contenido inventado), y dejar la base técnica de
SEO, GEO (Generative Engine Optimization) y rendimiento correcta desde el
primer despliegue.

## Fuera de alcance

- **Strapi.** Las clases/eventos se gestionarán más adelante desde el Strapi
  ya desplegado en OVHcloud. No se crea cliente HTTP, tipos, env vars ni
  fetch alguno ahora. Los bloques que algún día vendrán de Strapi (cursos,
  Cometas, sesiones) se construyen con el contenido estático del mockup, en
  una forma (props/arrays) fácil de sustituir por datos remotos el día que
  se planifique esa integración.
- **Páginas del menú** (`/sesiones`, `/cometas`, `/cursos`, `/comunidad`,
  `/sobre-mi`): no se crean. El header enlaza con anclas internas
  (`#sesiones`, `#cometas`, `#cursos`, `#comunidad`).
- **Fotografía real, precios, cifras y testimonios reales**: no existen
  todavía. Se usan los marcadores explícitos que ya trae el propio mockup
  (p. ej. "Imagen de referencia · sustituir por fotografía", "dato real
  pendiente", "Nombre real", "por confirmar"). No se inventa ningún dato.
- **daisyUI**: se queda instalado pero sin tema configurado (nada en el
  sistema de diseño usa sus clases). Se añade el día que haga falta.
- **OG image**: sin fotografía real no hay imagen social que generar; se
  deja sin `image` prop (Layout ya maneja ese caso sin romperse).

## Stack e integración del sistema de diseño

- `src/styles/global.css`:
  ```css
  @import "tailwindcss";
  @import "../../design-system/tokens.css";
  @import "../../design-system/components/bundle.css";

  @theme inline {
    --color-surface: var(--surface);
    --color-surface-raised: var(--surface-raised);
    --color-sand: var(--sand);
    --color-line: var(--line);
    --color-ink: var(--ink);
    --color-ink-muted: var(--ink-muted);
    --color-wave-indigo: var(--wave-indigo);
    --color-wave-ocean: var(--wave-ocean);
    --color-wave-blue: var(--wave-blue);
    --color-wave-sky: var(--wave-sky);
    --color-sun: var(--sun);
    --color-primary: var(--primary);
    --color-on-primary: var(--on-primary);
    --color-link: var(--link);
    --color-focus: var(--focus);
    --radius-sm: var(--radius-sm);
    --radius-md: var(--radius-md);
    --radius-lg: var(--radius-lg);
    --radius-pill: var(--radius-pill);
    --font-display: var(--font-display);
    --font-sans: var(--font-sans);
    --font-script: var(--font-script);
  }
  ```
  No se edita `design-system/tokens.css` ni `bundle.css` (fuente de verdad,
  generados). El `@import` de Google Fonts que trae `bundle.css` se deja tal
  cual; se añaden `<link rel="preconnect">` en `Layout.astro` para mitigar
  el coste de la conexión.
- Tailwind v4 se usa solo para utilidades de layout (`flex`, `grid`, `gap-*`,
  anchura máxima, breakpoints `md:`/`lg:`). Los componentes usan las clases
  `.yw-*` ya estilizadas por `bundle.css`, sin reescribir CSS que ya existe.

## Logotipos

- `public/logos/yourwave-logotipo.svg` (solo wordmark, horizontal) → header
  y footer.
- `public/logos/yourwave-logo.svg` (con isotipo, vertical) → no se usa en
  esta home (es la versión portada/impresos); queda disponible en
  `public/logos/` para cuando se necesite.
- Se sirven directo desde `public/` con `<img>` (ya son SVG optimizados, no
  pasan por `astro:assets`).

## Componentes (`src/components/`)

Puerto 1:1 de `design-system/components/*` a `.astro`, sin JS de cliente,
props tipadas (sin React):

- `Button.astro` — `variant: 'primary' | 'secondary' | 'ghost'`, `size: 'md' | 'lg'`, `href?`
- `Badge.astro` — `tone: 'neutral' | 'breathwork' | 'meditacion' | 'coaching' | 'cometa' | 'surf'`
- `SessionCard.astro` — `title, disciplines?, meta?, description?, price?, image?, imageAlt?, actionLabel?, href?`
- `WaveDivider.astro` — SVG inline, `from?, to?, flip?, layered?`
- `Testimonial.astro` — `quote, name, detail?, photo?`
- `FaqItem.astro` — `question, defaultOpen?`, slot para la respuesta, `<details>/<summary>` nativo

## Estructura de la home y contenido

Contenido transcrito de `doc/propuesta-v2/Your Wave · Home escritorio v2.svg`
(mockup aprobado). Los textos entre comillas van literales; los marcadores
("pendiente", "por confirmar", "[Nombre]") se mantienen tal cual, son del
propio mockup.

1. **Header**: logo (`yourwave-logotipo.svg`) + nav `Sesiones · Cometas ·
   Cursos · Comunidad · Sobre mí` (anclas) + `Button` primary "Reserva tu
   sesión".
2. **Hero**: eyebrow "BREATHWORK · MEDITACIÓN · COACHING". H1 "Respira,
   suelta y vuelve a tu centro." Subtítulo "Sesiones de breathwork,
   meditación y coaching para bajar el ritmo y escucharte. En individual,
   en grupo, en la playa o aprendiendo a tu ritmo. Como en el agua: una ola
   cada vez." CTA primary "Reserva tu sesión" + secondary "Ver cursos".
   Línea de confianza "Sesiones 1 a 1 · Grupales · Surf & Breath · Cursos".
   Visual: placeholder marcado "Imagen de referencia · sustituir por
   fotografía" + script "Encuentra tu ola propia". `WaveDivider` hacia
   `sand`.
3. **Prueba social** (banda `sand`): eyebrow "CONFIANZA QUE SE CONSTRUYE".
   Dos cifras placeholder: "+000 · personas acompañadas · dato real
   pendiente" y "0,0 ★ · valoración en Google · pendiente". Cita:
   "«Aquí irá una frase real de una participante, con su nombre y
   permiso.»" — "Testimonio breve · contenido pendiente".
4. **Tres beneficios** (sin icon set real, usar `.yw-ray` como marcador):
   "Tiempo para escucharte" / "Un espacio para observar cómo te sientes,
   sin exigencias." — "Tu propio ritmo" / "Elige el formato que encaja con
   tu momento: como elegir la ola que quieres coger." — "Aprendizaje
   compartido" / "Herramientas y prácticas para seguir, en compañía o por
   tu cuenta."
5. **"Encuentra tu ola" — 4 `SessionCard`** (eyebrow "CUATRO FORMAS DE
   EMPEZAR", H2 "Encuentra tu ola.", intro "No necesitas tenerlo todo
   claro. Elige una primera experiencia que tenga sentido para ti."):
   - Sesiones 1 a 1 — "Acompañamiento personalizado y atención a lo que
     quieres explorar." — meta "Cita según disponibilidad" — CTA
     "Reservar mi cita →"
   - Sesiones grupales — "Comparte la práctica. Una disciplina o una
     experiencia que lo combine todo." — meta "Disciplinas y Cometas" —
     CTA "Explorar sesiones →"
   - Cursos Your Wave — "Programas con objetivos claros para dar
     continuidad a tu práctica, paso a paso." — meta "Temario, objetivos e
     inscripción" — CTA "Ver los cursos →"
   - Comunidad — "Un punto de encuentro para compartir recursos, novedades
     y experiencias con la tribu." — meta "Recursos, eventos y conexión" —
     CTA "Conocer la tribu →"
6. **Cometas** (bloque destacado `wave-indigo`, badges "EN GRUPO" /
   "EXPERIENCIA COMBINADA"): H2 "Una práctica." + script "Cometas" + "Muchas
   formas de vivirla." Badges Breathwork + Meditación + Coaching. Texto
   "Sesiones inmersivas que unen las tres disciplinas en una sola
   experiencia: soltar con la respiración, ordenar con la meditación y
   salir con un propósito claro." 3 pasos: RESPIRACIÓN/Breathwork,
   ATENCIÓN/Meditación, PROCESO/Coaching · Hipnoterapia. Meta "Próximas
   sesiones y formato · por confirmar". CTA "Descubrir Cometas →".
7. **Surf & Breath** (eyebrow "MAR ADENTRO · NUEVA PROPUESTA"): H2 "Surf &
   Breath: respira en la orilla, coge tu ola." Subtítulo "Una experiencia
   que solo puede guiar una monitora de surf: preparar el cuerpo con la
   respiración y llevarla al agua." 3 pasos numerados: "01 En la arena. —
   Breathwork para activar y calmar el cuerpo.", "02 En el agua. — Baño de
   olas guiado o iniciación al surf, a tu nivel.", "03 Después de la ola. —
   Meditación breve para integrar lo vivido." Badges SURF + BREATHWORK.
   Nota "POR VALIDAR CON YOUR WAVE". Visual: placeholder de imagen.
8. **Misión / valores** (eyebrow "LO QUE NOS MUEVE"): H2 "Más espacio para
   ser. Menos prisa por llegar." Texto "Your Wave nace para acercar la
   respiración, la atención y el aprendizaje personal a la vida cotidiana.
   Sin un único camino ni una forma correcta de vivir la experiencia. El
   mar enseña a leer el momento, esperar, remar y soltar. Eso mismo
   trabajamos en cada sesión." Lista `.yw-rays`: "Escucha antes que
   exigencia", "Claridad en cada paso", "Respeto por tu propio ritmo".
   Imagen placeholder "una pausa junto al mar".
9. **Fundadora** (eyebrow "DETRÁS DE YOUR WAVE"): H2 "Hola, soy [Nombre]."
   Retrato placeholder "Sesión de fotos pendiente". Texto "Monitora de surf
   y facilitadora de breathwork, meditación y coaching. Aquí irá su
   historia: cómo el mar le enseñó a respirar y por qué creó Your Wave." —
   nota "CONTENIDO PENDIENTE" — CTA ghost "Conocer mi historia →".
10. **Cursos — 3 `SessionCard` de ejemplo** (eyebrow "CURSOS YOUR WAVE", H2
    "Aprende. Explora. Hazlo tuyo.", link "Ver todos los cursos", intro
    "Programas con objetivos y temarios claros para seguir profundizando en
    tu práctica."):
    - Breathwork (badge "EJEMPLO") — "Explorar la respiración" — "Conocer
      la respiración como práctica de atención." — meta "Observación ·
      Ritmo · Práctica guiada" — precio "Formato, duración y precio · por
      confirmar" — CTA "Ver programa →"
    - Meditación (badge "EJEMPLO") — "Iniciación a la meditación" —
      "Distintas formas de prestar atención y crear una rutina." — meta
      "Atención · Presencia · Rutina personal" — mismo precio placeholder —
      "Ver programa →"
    - Coaching (badge "EJEMPLO") — "Un camino hacia ti" — "Un espacio de
      reflexión y aprendizaje personal." — meta "Escucha · Reflexión ·
      Integración" — mismo precio placeholder — "Ver programa →"
11. **Comunidad** (eyebrow "COMUNIDAD · LA TRIBU", bloque oscuro): H2 "Tu
    camino también puede ser compartido." Texto "Un espacio para la tribu
    Your Wave: seguir aprendiendo, compartir lo vivido y encontrar nuevas
    formas de conectar." 3 puntos: "Recursos — Prácticas y audios para
    acompañar tu día.", "Parte de olas — Novedades y próximas sesiones, en
    tu correo.", "Encuentros — Quedadas en la playa para practicar juntos."
    Meta "Acceso y encuentros · por confirmar". CTA "Únete a la tribu".
    Imagen placeholder "no representa a miembros reales".
12. **Testimonios — 3 `Testimonial`** (eyebrow "EXPERIENCIAS COMPARTIDAS",
    H2 "Después de la ola."):
    - "«Testimonio real de una participante sobre cómo se sintió después de
      la sesión.»" — Nombre real — "Sesión 1 a 1 · pendiente"
    - "«Testimonio real sobre una experiencia Cometa o Surf & Breath.»" —
      Nombre real — "Cometa · pendiente"
    - "«Testimonio real de alguien que ha hecho uno de los cursos.»" —
      Nombre real — "Curso · pendiente"
    Nota "Solo voces reales, con nombre, foto y consentimiento."
13. **FAQ — 5 `FaqItem`** (eyebrow "ANTES DE EMPEZAR", H2 "Un poco más de
    claridad.", intro "Las preguntas que suelen surgir antes de
    reservar."):
    - "¿Por dónde puedo empezar?" → "Con una sesión 1 a 1, una práctica en
      grupo o un curso. Si dudas, escríbenos y te ayudamos a elegir. Canal
      de contacto: por confirmar."
    - "¿Necesito experiencia previa o saber surfear?"
    - "¿Qué son las experiencias Cometas?"
    - "¿Cómo reservo y puedo cambiar la fecha?"
    - "¿Dónde se realizan y cuánto cuestan?"
    (Las 4 últimas solo traen la pregunta en el mockup; la respuesta queda
    con el mismo tipo de marcador "Contenido pendiente de redacción".)
14. **CTA final** (bloque `wave-indigo`, eyebrow "TU SIGUIENTE PASO"): H2
    "Tu próxima ola empieza con una respiración." Texto "Elige tu sesión.
    Consulta disponibilidad. Confirma tu plaza." CTA primary "Reserva tu
    sesión" + secondary "Ver cursos". Nota "Agenda y condiciones de reserva
    · por confirmar".
15. **Footer**: columnas "Explorar" (Sesiones 1 a 1, Sesiones grupales,
    Cometas, Surf & Breath, Cursos Your Wave), "Your Wave" (Sobre mí,
    Comunidad, Preguntas frecuentes, Contacto), "Hablemos" (Correo · por
    confirmar, Teléfono · por confirmar, Instagram · por confirmar). Logo +
    tagline "Breathwork, meditación y coaching junto al mar." Legal: ©
    2026 Your Wave, Privacidad, Términos, Aviso legal, Cookies.

`WaveDivider` entre: hero→prueba social, y 2-3 puntos más donde el mockup
muestra el borde ondulado (máx. 2-3 por página, según la guía de marca) —
se decide el punto exacto al maquetar, siguiendo el mockup visual.

## SEO

- **Bug fix en `astro.config.mjs`**: actualmente `site` y la integración
  `sitemap()` solo se activan si existe `process.env.SITE_URL`. Sin esa
  variable (build por defecto) no hay canonical, sitemap ni JSON-LD. Se
  fija `https://yourwave.es` como valor por defecto, con `SITE_URL` como
  override:
  ```js
  const siteUrl = process.env.SITE_URL ?? 'https://yourwave.es';
  export default defineConfig({
    site: siteUrl,
    integrations: [sitemap()],
    ...
  });
  ```
- `src/config/seo.ts`: `siteName = 'Your Wave'`,
  `defaultDescription = 'Breathwork, meditación y coaching guiados por una
  monitora de surf. Sesiones individuales, grupales y en la playa para
  volver a tu centro.'` (tono y vocabulario de `design-system/README.md`).
- `Layout.astro` ya genera `@graph` con `Organization`, `WebSite`,
  `WebPage`. Se añade a ese mismo `@graph`, solo en `index.astro` (vía prop
  o slot, sin tocar el contrato genérico del Layout):
  - `FAQPage` con las 5 preguntas/respuestas de la sección FAQ (mismo texto
    visible, nunca oculto ni distinto — evita penalización por contenido
    engañoso).
  - `Service` por cada una de las 4 líneas de `SessionCard` (nombre +
    descripción, sin precio ya que es placeholder).
- Un único `<h1>` (hero). Jerarquía `h2` por sección, `h3` donde el mockup
  usa subtítulos de tarjeta.

## GEO (Generative Engine Optimization)

- El `FAQPage` JSON-LD de arriba cubre también el caso GEO (citas de IA).
- Todo el contenido clave vive en texto plano accesible al DOM (nada
  metido solo en SVG/imagen) — ya es así por diseño, dado que las imágenes
  son placeholders.
- `public/llms.txt`: resumen breve de qué es Your Wave, a quién sirve y
  enlaces a las secciones de la home, siguiendo la convención ligera que
  usan los crawlers de motores generativos.
- `robots.txt` ya permite todo (`Allow: /`); no se añade ninguna regla que
  bloquee crawlers de IA, coherente con el objetivo GEO.

## Rendimiento

- Cero JavaScript de cliente (todos los componentes son `.astro`
  estáticos; FAQ usa `<details>` nativo).
- `<link rel="preconnect">` a `fonts.googleapis.com` y `fonts.gstatic.com`
  (con `crossorigin`) en `Layout.astro`, antes de que se parsee el `@import`
  de fuentes de `bundle.css`.
- Logos como SVG servidos directos desde `public/` (sin pipeline de
  imagen, no son fotografías).
- `WaveDivider` como SVG inline (sin petición de red).
- `compressHTML: true` ya activo en `astro.config.mjs`.
- Sin dependencias nuevas.

## Verificación

- `astro build` debe completarse sin errores (falla el build si hay typos
  en props/tipos de los componentes `.astro`).
- `astro dev --background` + revisión visual en navegador (contraste,
  layout responsive, que el acordeón FAQ abra/cierre, que los anclajes del
  header funcionen) antes de dar el trabajo por terminado, según la
  indicación de `CLAUDE.md` de probar cambios de UI en navegador.
- Sin framework de test en el repo; no se añade ninguno para este trabajo
  (contenido estático, sin lógica de negocio que testear).

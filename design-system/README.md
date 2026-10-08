Your Wave (World Awaken Vision Experience) acompaña a las personas a respirar, meditar y transformarse con breathwork, meditación y coaching/hipnoterapia, guiadas por una monitora de surf. La marca se mueve como el mar: serena en la orilla, con fuerza en la ola. Todo lo que diseñes debe transmitir **serenidad, fluidez y claridad**, y dejar la reserva siempre a uno o dos toques.

## Esencia

- **El mar como método.** La metáfora del surf no es decoración: leer el mar, esperar la ola, remar y soltar son las mismas habilidades que se trabajan en cada sesión. Úsala en el mensaje, no en clichés visuales (nada de tablas dibujadas, chanclas ni palmeras).
- **Claro antes que poético.** El H1 dice qué ofrece Your Wave y qué gana la persona. La metáfora vive en subtítulos, microcopy y detalles.
- **Aire.** Secciones con `space-24` de padding vertical en escritorio (`space-12` en móvil). Si dudas, quita un elemento.

## Voz y contenido

- Tutea siempre. Frases cortas, verbos de acción, cero jerga new age sin explicar.
- Titulares en tipo frase (solo la primera mayúscula). Antetítulos (`eyebrow`) en MAYÚSCULAS.
- Sin emojis en la web. Sin signos de exclamación en titulares.
- Vocabulario surf con medida, máximo un guiño por bloque: "Encuentra tu ola", "Coge tu ola", "Mar adentro", "Después de la ola", "La tribu".
- Ejemplos:
  - H1: "Breathwork, meditación y coaching para volver a tu centro" — no "Despierta tu ser interior".
  - Subtítulo: "Sesiones individuales, grupales y en la playa para soltar el estrés y respirar con intención. Como en el agua: una ola cada vez."
  - CTA: "Reserva tu sesión", "Ver cursos", "Únete a la tribu".
- Nombres de producto: "Sesiones 1 a 1", "Sesiones grupales", "Cometas" (experiencia combinada, siempre con la explicación "breathwork + meditación + coaching en una sola sesión"), "Cursos Your Wave", "Comunidad".

## Color

- La paleta sale exacta del logotipo: `wave-indigo` (#322783), `wave-ocean` (#01499b), `wave-blue` (#007ac3), `wave-sky` (#009fe3) y el lima `sun` (#dcdc00).
- Base clara: `surface` con `ink`; bandas de relieve en `sand` (la orilla). El azul se reserva para acción y momentos de marca, no para pintar fondos enteros.
- Acción principal: `primary` con `on-primary`. Enlaces: `link`.
- `sun` es el destello: rayos/triángulos marcadores, badge Cometa, foco en tema oscuro. Nunca como texto ni más de un 5 % de la pantalla.
- `wave-sky` no sirve como texto sobre fondos claros (3:1); úsalo de relleno con `on-bright`.
- Bloques de impacto (CTA final, footer): fondo `wave-indigo` con `on-deep`.
- El degradado indigo → celeste existe solo dentro del símbolo del logotipo. No lo copies a botones, fondos ni tarjetas.
- Tema oscuro "Marea nocturna" para la zona de Comunidad o secciones de meditación nocturna: `primary` pasa a celeste con texto oscuro.
- Foco: anillo de 2px en `focus` con 2px de separación (≥3:1 sobre todas las superficies).

## Tipografía

- `display` (Josefin Sans, light): eco geométrico del "WAVE" del logotipo. Para `display-xl`, `heading-1`, `heading-2`, citas y precios.
- `sans` (Nunito Sans): todo el texto de lectura, botones y metadatos.
- `script` (Sacramento): eco del "your" manuscrito. Una o dos palabras como mucho por pantalla ("tu *ola*"), nunca en botones ni párrafos.
- Escala: `display-xl` 64/68 en el hero (40/44 en móvil), `heading-2` por bloque, `body-lg` para entradillas, `body` para texto, `small` para metadatos.
- Las fuentes se cargan desde Google Fonts (ver `components/bundle.css`).

## Forma, espacio y movimiento

- Radios: `radius-pill` en botones y badges (forma de tabla), `radius-md` en tarjetas e imágenes, `radius-lg` en bloques grandes.
- Rejilla de 12 columnas, gutter `space-6`, ancho máximo 1200px; margen lateral `space-4` en móvil.
- Una sola sombra, `shadow-soft`, en hover de tarjeta y cabecera fija. Bordes `line` de 1px en el resto.
- Separadores entre secciones: `WaveDivider` (máx. 2–3 por página). Es el guiño surf estructural.
- Marcadores de lista: triángulo `sun` (`.yw-rays`), tomado de los rayos del logotipo.
- Movimiento: transiciones de 200–250 ms con ease suave, como una ola que entra. Nada que rebote. Respeta `prefers-reduced-motion`.

## Imagen

- Fotografía real y propia: la monitora en el agua, la orilla al amanecer, grupos respirando en la arena, manos, texturas de espuma. Luz natural, horizonte recto, tonos fríos con un punto cálido de arena.
- Nada de stock genérico de yoga, ni filtros saturados.
- Hero: foto o vídeo corto (5–8 s, sin sonido, en bucle) de mar en calma con la persona de espaldas mirando la ola.
- Recortes en `radius-md` o `radius-lg`; nunca círculos salvo avatares de testimonios.

## Logotipo

- Cabecera: `assets/Logos/yourwave-logotipo.jpg` a la izquierda, 40–48px de alto.
- Portada, redes e impresos: `assets/Logos/yourwave-logo-completo.jpg`.
- Solo sobre fondos claros hasta tener versiones vectoriales en negativo. Respeta un margen libre igual a la altura de la "W".

## Iconografía

- Iconos de trazo 1.5px, extremos redondeados, en `ink` o `link` (por ejemplo Lucide). Sin emojis.
- El triángulo de sol es el único icono propio de la marca.

## Estructura de la home

1. Cabecera: logotipo, 4–5 enlaces (Sesiones, Cometas, Cursos, Comunidad, Sobre mí) y `Button` primary "Reserva tu sesión".
2. Hero: `eyebrow`, H1 claro, subtítulo, CTA primary + secondary, foto/vídeo real. `WaveDivider` hacia `sand`.
3. Prueba social en `sand`: cifra real + testimonio de una frase + valoración.
4. Servicios: 4 `SessionCard` (1 a 1, Grupales, Cometas, Cursos) con `Badge` de disciplina.
5. Por qué Your Wave: misión, diferencial (método que une mar y respiración) y foto de la fundadora.
6. Testimonios (3 `Testimonial`) + FAQ (4–6 `FaqItem`).
7. CTA final sobre `wave-indigo` y footer con legales, redes y contacto.

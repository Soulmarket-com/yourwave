# Home: sistema de diseño, SEO, GEO y rendimiento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Your Wave home page (`src/pages/index.astro`) on top of the
existing design system, with the real mockup copy, WhatsApp-based CTAs, and a
correct SEO/GEO/performance baseline.

**Architecture:** Port the 6 React reference components (`design-system/components/`)
to zero-JS `.astro` components that consume the existing `bundle.css` classes
unmodified. Wire Tailwind v4's `@theme inline` to alias the design tokens so
page layout can use plain Tailwind utilities (`bg-sand`, `py-24`, `gap-6`)
without inventing new CSS. Assemble the home page as one `.astro` file built
section-by-section from the mockup transcript in the spec. Fix a live SEO bug
in `astro.config.mjs` and extend `Layout.astro`'s existing JSON-LD `@graph`
with page-specific `FAQPage`/`Service` entries.

**Tech Stack:** Astro 7, Tailwind v4 (`@tailwindcss/vite`), `@astrojs/sitemap`.
No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-08-home-design-system-seo-geo-design.md`

## Global Constraints

- No new npm dependencies (runtime or dev). daisyUI stays installed, unconfigured.
- Zero client-side JavaScript. `FaqItem` uses native `<details>/<summary>`.
- Every color, spacing, radius and font comes from `design-system/tokens.css`
  tokens — never a bare hex value or an arbitrary pixel size in page code.
- `design-system/tokens.css` and `design-system/components/bundle.css` are
  generated source-of-truth files — never edit them.
- No invented testimonials, prices, figures, or photography. Every piece of
  missing real content uses the exact placeholder wording already present in
  `doc/propuesta-v2/Your Wave · Home escritorio v2.svg` (transcribed in the
  spec's "Estructura de la home y contenido" section).
- Text is Spanish, tuteo, no emojis, no exclamation marks in headings (per
  `design-system/README.md`).
- `WaveDivider` is used at most 3 times on the page, only between sections of
  different background color.
- WhatsApp number: `34628757954` (no `+`, no spaces, for `wa.me` links) —
  lives only in `src/config/contact.ts`.
- Reservation/contact CTAs open WhatsApp; exploratory CTAs (`Ver`, `Explorar`,
  `Conocer`, `Descubrir`) stay internal anchors. See spec's "Contacto y
  reservas" section for the exact mapping.
- No new pages/routes. The header nav and footer link to in-page anchors only.
- There is no test framework in this repo and the spec explicitly decided not
  to add one (static content, no business logic). The verification gate for
  every task is `npm run build` succeeding, plus a final manual browser pass.

## Review Focus

- **`SITE_URL` env var absence/presence**: `astro.config.mjs` must produce a
  working `site`, sitemap and canonical/JSON-LD both with and without
  `SITE_URL` set — the bug being fixed is exactly "forgot to set the env var
  and SEO silently disappears." Task 1 builds both ways.
- **FAQ visible text vs. `FAQPage` JSON-LD text diverging** — a reasonable
  person (and a search engine) expects the schema to say exactly what the
  page says. Task 9 sources both from one `faqs` array so they can't drift,
  and the task's check confirms the built HTML's JSON-LD block contains the
  same answer strings as the rendered accordion.
- **WhatsApp links with accented/punctuated Spanish text** (`¿`, `¡`, `í`,
  spaces) — a malformed `wa.me` URL would silently fail to prefill the
  message. Task 1's `whatsappLink` helper uses `encodeURIComponent`, and
  Task 9 explicitly checks one generated URL decodes back to the original
  Spanish sentence.
- **Narrow mobile viewport (< 375px)** — a reasonable visitor on an older
  phone expects the header, hero and card grids not to overflow horizontally.
  Task 10's manual verification checks this width explicitly, not just the
  two mockup breakpoints.
- **Text contrast on the dark sections** (`Comunidad`, final CTA, footer) —
  `opacity-80`/`opacity-90` on `on-deep` text must still read clearly against
  `wave-indigo`. Task 10's manual verification checks this visually since
  there's no automated contrast checker in the toolchain.

---

## Task 1: Cleanup, SEO config fix, and WhatsApp helper

**Files:**
- Delete: `src/components/Welcome.astro`
- Delete: `src/assets/astro.svg`
- Delete: `src/assets/background.svg`
- Modify: `astro.config.mjs`
- Modify: `src/config/seo.ts`
- Create: `src/config/contact.ts`

**Interfaces:**
- Produces: `whatsappNumber: string`, `whatsappLink(message: string): string` from `src/config/contact.ts`, used by every CTA from Task 5 onward.
- Produces: `siteName: string`, `defaultDescription: string` from `src/config/seo.ts` (already consumed by `Layout.astro`, unchanged contract).

- [ ] **Step 1: Delete the unused Astro starter scaffold**

```bash
git rm src/components/Welcome.astro src/assets/astro.svg src/assets/background.svg
```

Nothing in `src/pages/index.astro` imports `Welcome.astro` (confirmed: it
only imports `Layout.astro`), so this is a pure deletion.

- [ ] **Step 2: Fix the `SITE_URL` fallback bug in `astro.config.mjs`**

Replace the full file content:

```js
// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.SITE_URL ?? 'https://yourwave.es';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  integrations: [sitemap()],
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()]
  }
});
```

Before this fix, `site` and the `sitemap()` integration were only added when
`process.env.SITE_URL` was set, so a plain `astro build` shipped with no
canonical URL, no sitemap, and no JSON-LD `url` fields. Now `https://yourwave.es`
is the default, still overridable via `SITE_URL` for staging builds.

- [ ] **Step 3: Update `src/config/seo.ts` with real brand copy**

```ts
export const siteName = 'Your Wave';
export const defaultDescription =
	'Breathwork, meditación y coaching guiados por una monitora de surf. Sesiones individuales, grupales y en la playa para volver a tu centro.';
```

- [ ] **Step 4: Create the WhatsApp contact helper**

```ts
// src/config/contact.ts
export const whatsappNumber = '34628757954';

export function whatsappLink(message: string): string {
	return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 5: Verify the build succeeds both with and without `SITE_URL`**

```bash
npm run build
SITE_URL=https://staging.yourwave.es npm run build
```

Expected: both complete with no errors. Check `dist/robots.txt` (or the
build log) confirms a sitemap link is present in both runs, and
`dist/sitemap-index.xml` exists after each build.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Fix SITE_URL fallback, remove Astro starter scaffold, add WhatsApp helper"
```

---

## Task 2: Design system integration (tokens, Tailwind theme, Layout)

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Consumes: nothing new.
- Produces: Tailwind utilities `bg-surface`, `bg-surface-raised`, `bg-sand`,
  `bg-wave-indigo`, `bg-wave-ocean`, `bg-wave-blue`, `bg-wave-sky`, `bg-sun`,
  `bg-on-deep`, `bg-primary`, `bg-on-primary`, `bg-link`, `bg-focus` (and
  their `text-*`/`border-*` equivalents), `rounded-sm/md/lg/pill`, aliased to
  the design tokens — consumed by every section task from Task 5 onward.
  Also produces `Layout.astro`'s new `extraGraph?: Record<string, unknown>[]`
  prop, consumed by Task 9.

- [ ] **Step 1: Rewrite `src/styles/global.css`**

```css
@import "tailwindcss";
@import "../../design-system/tokens.css";
@import "../../design-system/components/bundle.css" layer(components);

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
	--color-on-deep: var(--on-deep);
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

`bundle.css` is imported into the `components` layer explicitly. Tailwind's
`@import "tailwindcss"` declares `@layer theme, base, components, utilities;`
— by reusing the `components` name, our component CSS sits below Tailwind's
`utilities` layer, so a utility class like `text-on-deep` can still override
a `.yw-btn-secondary` color when both are applied to the same element (needed
in Task 8/9 for buttons on the dark sections). Without `layer(components)`,
`bundle.css` would be unlayered CSS, which always beats every layered rule
regardless of specificity or source order — utilities could never win.

- [ ] **Step 2: Add font preconnect hints to `Layout.astro`**

In `src/layouts/Layout.astro`, inside `<head>`, right after the viewport
meta tag, add:

```astro
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

- [ ] **Step 3: Add an `extraGraph` prop to `Layout.astro` for page-specific JSON-LD**

Current `Layout.astro` frontmatter (`src/layouts/Layout.astro`):

```astro
interface Props {
	title?: string;
	description?: string;
	canonicalUrl?: string;
	image?: string;
	noIndex?: boolean;
}

const {
	title = siteName,
	description = defaultDescription,
	canonicalUrl,
	image,
	noIndex = false,
} = Astro.props;
```

Change to:

```astro
interface Props {
	title?: string;
	description?: string;
	canonicalUrl?: string;
	image?: string;
	noIndex?: boolean;
	extraGraph?: Record<string, unknown>[];
}

const {
	title = siteName,
	description = defaultDescription,
	canonicalUrl,
	image,
	noIndex = false,
	extraGraph = [],
} = Astro.props;
```

And in the `structuredData` block, change the `@graph` array from:

```astro
'@graph': [
    {
        '@type': 'Organization',
        ...
    },
    {
        '@type': 'WebSite',
        ...
    },
    {
        '@type': 'WebPage',
        ...
    },
],
```

to:

```astro
'@graph': [
    {
        '@type': 'Organization',
        ...
    },
    {
        '@type': 'WebSite',
        ...
    },
    {
        '@type': 'WebPage',
        ...
    },
    ...extraGraph,
],
```

(Keep the existing `Organization`/`WebSite`/`WebPage` object bodies exactly
as they are today — only the trailing `...extraGraph,` is new.)

- [ ] **Step 4: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors. The current `src/pages/index.astro`
(`Yourwave` placeholder `<h1>`) still renders fine since `extraGraph`
defaults to `[]`.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/layouts/Layout.astro
git commit -m "Wire design system tokens into Tailwind theme and Layout JSON-LD"
```

---

## Task 3: Button and Badge components

**Files:**
- Create: `src/components/Button.astro`
- Create: `src/components/Badge.astro`

**Interfaces:**
- Produces: `Button` — props `variant?: 'primary' | 'secondary' | 'ghost'`
  (default `'primary'`), `size?: 'md' | 'lg'`, `href?: string`, `class?: string`;
  default slot for label text. Renders `<a>` when `href` is set, `<button
  type="button">` otherwise.
- Produces: `Badge` and `type Discipline = 'breathwork' | 'meditacion' |
  'coaching' | 'cometa' | 'surf'` — props `tone?: 'neutral' | Discipline`
  (default `'neutral'`), `class?: string`; default slot overrides the
  built-in label.
- Both consumed by every task from Task 4 onward.

- [ ] **Step 1: Write `src/components/Button.astro`**

```astro
---
export interface Props {
	variant?: 'primary' | 'secondary' | 'ghost';
	size?: 'md' | 'lg';
	href?: string;
	class?: string;
}

const { variant = 'primary', size, href, class: className } = Astro.props;

const classes = ['yw-btn', `yw-btn-${variant}`, size === 'lg' && 'yw-btn-lg', className]
	.filter(Boolean)
	.join(' ');

const Tag = href ? 'a' : 'button';
---

<Tag class={classes} href={href} type={href ? undefined : 'button'}>
	<slot />
</Tag>
```

- [ ] **Step 2: Write `src/components/Badge.astro`**

```astro
---
export type Discipline = 'breathwork' | 'meditacion' | 'coaching' | 'cometa' | 'surf';

export interface Props {
	tone?: 'neutral' | Discipline;
	class?: string;
}

const BADGE_LABEL: Record<Discipline, string> = {
	breathwork: 'Breathwork',
	meditacion: 'Meditación',
	coaching: 'Coaching · Hipnoterapia',
	cometa: 'Cometa',
	surf: 'Surf',
};

const { tone = 'neutral', class: className } = Astro.props;
const classes = ['yw-badge', `yw-badge-${tone}`, className].filter(Boolean).join(' ');
const fallbackLabel = tone === 'neutral' ? '' : BADGE_LABEL[tone];
---

<span class={classes}><slot>{fallbackLabel}</slot></span>
```

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors (neither component is used by any page
yet, so this just confirms both files compile as valid Astro components).

- [ ] **Step 4: Commit**

```bash
git add src/components/Button.astro src/components/Badge.astro
git commit -m "Add Button and Badge components"
```

---

## Task 4: SessionCard, WaveDivider, Testimonial, FaqItem components

**Files:**
- Create: `src/components/SessionCard.astro`
- Create: `src/components/WaveDivider.astro`
- Create: `src/components/Testimonial.astro`
- Create: `src/components/FaqItem.astro`

**Interfaces:**
- Consumes: `Button` and `Badge` (and `Discipline` type) from Task 3.
- Produces: `SessionCard` — props `title: string`, `disciplines?:
  Discipline[]`, `meta?: string`, `description?: string`, `price?: string`,
  `image?: string`, `imageAlt?: string`, `actionLabel?: string` (default
  `'Reservar'`), `href?: string`, `class?: string`.
- Produces: `WaveDivider` — props `from?: string` (default `'transparent'`),
  `to?: string` (default `'var(--sand)'`), `back?: string`, `height?: number`
  (default `72`), `flip?: boolean`, `layered?: boolean` (default `true`),
  `class?: string`.
- Produces: `Testimonial` — props `quote: string`, `name: string`, `detail?:
  string`, `photo?: string`, `class?: string`.
- Produces: `FaqItem` — props `question: string`, `defaultOpen?: boolean`,
  `class?: string`; default slot is the answer body.
- All four consumed from Task 5 onward.

- [ ] **Step 1: Write `src/components/SessionCard.astro`**

```astro
---
import Badge from './Badge.astro';
import Button from './Button.astro';
import type { Discipline } from './Badge.astro';

export interface Props {
	title: string;
	disciplines?: Discipline[];
	meta?: string;
	description?: string;
	price?: string;
	image?: string;
	imageAlt?: string;
	actionLabel?: string;
	href?: string;
	class?: string;
}

const {
	title,
	disciplines,
	meta,
	description,
	price,
	image,
	imageAlt = '',
	actionLabel = 'Reservar',
	href,
	class: className,
} = Astro.props;

const classes = ['yw-card', className].filter(Boolean).join(' ');
---

<article class={classes}>
	{image && <img class="yw-card-media" src={image} alt={imageAlt} />}
	<div class="yw-card-body">
		{disciplines && disciplines.length > 0 && (
			<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
				{disciplines.map((d) => <Badge tone={d} />)}
			</div>
		)}
		<h3 class="yw-card-title">{title}</h3>
		{meta && <p class="yw-card-meta">{meta}</p>}
		{description && <p class="yw-card-text">{description}</p>}
	</div>
	<div class="yw-card-foot">
		{price ? <span class="yw-card-price">{price}</span> : <span />}
		<Button variant="primary" href={href}>{actionLabel}</Button>
	</div>
</article>
```

- [ ] **Step 2: Write `src/components/WaveDivider.astro`**

```astro
---
export interface Props {
	from?: string;
	to?: string;
	back?: string;
	height?: number;
	flip?: boolean;
	layered?: boolean;
	class?: string;
}

const {
	from = 'transparent',
	to = 'var(--sand)',
	back,
	height = 72,
	flip = false,
	layered = true,
	class: className,
} = Astro.props;

const WAVE_FRONT =
	'M0 48 C 120 12, 240 12, 360 40 S 600 76, 720 44 S 960 0, 1080 28 S 1320 60, 1440 36 L1440 96 L0 96 Z';
const WAVE_BACK =
	'M0 30 C 160 60, 300 64, 460 34 S 760 4, 920 30 S 1240 70, 1440 22 L1440 96 L0 96 Z';

const classes = ['yw-wave', className].filter(Boolean).join(' ');
const style = `background:${from};height:${height}px;${flip ? 'transform:scaleX(-1);' : ''}`;
---

<svg class={classes} viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden="true" style={style}>
	{layered && <path class="yw-wave-back" d={WAVE_BACK} fill={back || to} />}
	<path d={WAVE_FRONT} fill={to} />
</svg>
```

- [ ] **Step 3: Write `src/components/Testimonial.astro`**

```astro
---
export interface Props {
	quote: string;
	name: string;
	detail?: string;
	photo?: string;
	class?: string;
}

const { quote, name, detail, photo, class: className } = Astro.props;
const classes = ['yw-quote', className].filter(Boolean).join(' ');
---

<figure class={classes}>
	<blockquote class="yw-quote-text" style="margin:0;">&ldquo;{quote}&rdquo;</blockquote>
	<figcaption class="yw-quote-who">
		{photo ? <img class="yw-quote-avatar" src={photo} alt="" /> : <span class="yw-quote-avatar" aria-hidden="true" />}
		<span><strong>{name}</strong>{detail}</span>
	</figcaption>
</figure>
```

- [ ] **Step 4: Write `src/components/FaqItem.astro`**

```astro
---
export interface Props {
	question: string;
	defaultOpen?: boolean;
	class?: string;
}

const { question, defaultOpen = false, class: className } = Astro.props;
const classes = ['yw-faq', className].filter(Boolean).join(' ');
---

<details class={classes} open={defaultOpen}>
	<summary>{question}<span class="yw-faq-icon" aria-hidden="true" /></summary>
	<div class="yw-faq-body"><slot /></div>
</details>
```

- [ ] **Step 5: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/SessionCard.astro src/components/WaveDivider.astro src/components/Testimonial.astro src/components/FaqItem.astro
git commit -m "Add SessionCard, WaveDivider, Testimonial and FaqItem components"
```

---

## Task 5: Home page shell — Header, Hero, Prueba social

**Files:**
- Modify: `src/pages/index.astro` (full rewrite)

**Interfaces:**
- Consumes: `Layout` (`src/layouts/Layout.astro`), `Button`, `whatsappLink`/`whatsappNumber` from `src/config/contact.ts`.
- Produces: the `faqs`/`serviceJsonLd` frontmatter arrays are introduced empty here and filled in by Task 9; sections 1-3 of the page are final from this task on.

- [ ] **Step 1: Replace `src/pages/index.astro` with the page shell, header, hero and prueba social**

```astro
---
import Layout from '../layouts/Layout.astro';
import Button from '../components/Button.astro';
import WaveDivider from '../components/WaveDivider.astro';
import { whatsappLink } from '../config/contact';
---

<Layout
	title="Your Wave — Breathwork, meditación y coaching junto al mar"
	description="Sesiones de breathwork, meditación y coaching, individuales, grupales y en la playa, guiadas por una monitora de surf. Reserva por WhatsApp."
>
	<header id="top" class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
		<div class="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
			<a href="#top" class="shrink-0">
				<img src="/logos/yourwave-logotipo.svg" alt="Your Wave" class="h-10 w-auto md:h-12" />
			</a>
			<Button href={whatsappLink('Hola, quiero reservar una sesión en Your Wave.')} class="shrink-0">
				Reserva tu sesión
			</Button>
		</div>
		<nav
			class="mx-auto flex w-full max-w-[1200px] gap-6 overflow-x-auto px-4 pb-3 md:justify-center md:px-6"
			aria-label="Principal"
		>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#sesiones">Sesiones</a>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#cometas">Cometas</a>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#cursos">Cursos</a>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#comunidad">Comunidad</a>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#sobre-mi">Sobre mí</a>
		</nav>
	</header>

	<main>
		<section class="bg-surface">
			<div class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24">
				<div>
					<p class="yw-eyebrow text-ink-muted">BREATHWORK · MEDITACIÓN · COACHING</p>
					<h1 class="yw-display-xl mt-4 text-ink">Respira, suelta y vuelve a tu centro.</h1>
					<p class="yw-body-lg mt-6 max-w-[48ch] text-ink-muted">
						Sesiones de breathwork, meditación y coaching para bajar el ritmo y escucharte. En individual, en grupo,
						en la playa o aprendiendo a tu ritmo. Como en el agua: una ola cada vez.
					</p>
					<div class="mt-8 flex flex-wrap gap-4">
						<Button size="lg" href={whatsappLink('Hola, quiero reservar una sesión en Your Wave.')}>
							Reserva tu sesión
						</Button>
						<Button variant="secondary" size="lg" href="#cursos">Ver cursos</Button>
					</div>
					<p class="yw-small mt-6 text-ink-muted">Sesiones 1 a 1 · Grupales · Surf &amp; Breath · Cursos</p>
				</div>
				<div class="relative">
					<div
						class="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-line bg-sand p-6 text-center"
						role="img"
						aria-label="Imagen de referencia: mar en calma, pendiente de sustituir por fotografía real"
					>
						<p class="yw-small text-ink-muted">Imagen de referencia · sustituir por fotografía</p>
					</div>
					<p
						class="yw-body mt-4 text-center text-ink-muted md:absolute md:-bottom-6 md:left-6 md:mt-0 md:bg-surface md:px-3"
					>
						Encuentra <span class="yw-script text-wave-ocean">tu ola</span> propia
					</p>
				</div>
			</div>
		</section>

		<WaveDivider from="var(--surface)" to="var(--sand)" />

		<section class="bg-sand">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<p class="yw-eyebrow text-ink-muted">CONFIANZA QUE SE CONSTRUYE</p>
				<div class="mt-6 flex flex-wrap items-start gap-10">
					<div class="flex flex-wrap gap-10">
						<div>
							<p class="yw-heading-1 text-ink">+000</p>
							<p class="yw-small text-ink-muted">personas acompañadas · dato real pendiente</p>
						</div>
						<div>
							<p class="yw-heading-1 text-ink">0,0 ★</p>
							<p class="yw-small text-ink-muted">valoración en Google · pendiente</p>
						</div>
					</div>
					<div class="max-w-[48ch]">
						<p class="yw-quote-text text-ink" style="margin:0;">
							&ldquo;Aquí irá una frase real de una participante, con su nombre y permiso.&rdquo;
						</p>
						<p class="yw-small mt-2 text-ink-muted">Testimonio breve · contenido pendiente</p>
					</div>
				</div>
			</div>
		</section>
	</main>
</Layout>
```

- [ ] **Step 2: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "Build home page shell: header, hero, prueba social"
```

---

## Task 6: Beneficios, Encuentra tu ola, Cometas

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Badge`, `SessionCard` (new imports this task), plus everything from Task 5.

- [ ] **Step 1: Add the three imports**

At the top of `src/pages/index.astro`, below the existing imports, add:

```astro
import Badge from '../components/Badge.astro';
import SessionCard from '../components/SessionCard.astro';
```

- [ ] **Step 2: Insert the three sections right before `</main>`**

```astro
		<section class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<div class="grid gap-8 md:grid-cols-3">
					<div>
						<span class="yw-ray" aria-hidden="true"></span>
						<h3 class="yw-heading-3 mt-3 text-ink">Tiempo para escucharte</h3>
						<p class="yw-body mt-2 text-ink-muted">Un espacio para observar cómo te sientes, sin exigencias.</p>
					</div>
					<div>
						<span class="yw-ray" aria-hidden="true"></span>
						<h3 class="yw-heading-3 mt-3 text-ink">Tu propio ritmo</h3>
						<p class="yw-body mt-2 text-ink-muted">
							Elige el formato que encaja con tu momento: como elegir la ola que quieres coger.
						</p>
					</div>
					<div>
						<span class="yw-ray" aria-hidden="true"></span>
						<h3 class="yw-heading-3 mt-3 text-ink">Aprendizaje compartido</h3>
						<p class="yw-body mt-2 text-ink-muted">
							Herramientas y prácticas para seguir, en compañía o por tu cuenta.
						</p>
					</div>
				</div>
			</div>
		</section>

		<section id="sesiones" class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<p class="yw-eyebrow text-ink-muted">CUATRO FORMAS DE EMPEZAR</p>
				<h2 class="yw-heading-2 mt-4 text-ink">Encuentra tu ola.</h2>
				<p class="yw-body mt-2 max-w-[60ch] text-ink-muted">
					No necesitas tenerlo todo claro. Elige una primera experiencia que tenga sentido para ti.
				</p>
				<div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					<SessionCard
						title="Sesiones 1 a 1"
						description="Acompañamiento personalizado y atención a lo que quieres explorar."
						meta="Cita según disponibilidad"
						actionLabel="Reservar mi cita →"
						href={whatsappLink('Hola, quiero reservar una sesión 1 a 1.')}
					/>
					<SessionCard
						title="Sesiones grupales"
						description="Comparte la práctica. Una disciplina o una experiencia que lo combine todo."
						meta="Disciplinas y Cometas"
						actionLabel="Explorar sesiones →"
						href="#cometas"
					/>
					<SessionCard
						title="Cursos Your Wave"
						description="Programas con objetivos claros para dar continuidad a tu práctica, paso a paso."
						meta="Temario, objetivos e inscripción"
						actionLabel="Ver los cursos →"
						href="#cursos"
					/>
					<SessionCard
						title="Comunidad"
						description="Un punto de encuentro para compartir recursos, novedades y experiencias con la tribu."
						meta="Recursos, eventos y conexión"
						actionLabel="Conocer la tribu →"
						href="#comunidad"
					/>
				</div>
			</div>
		</section>

		<section id="cometas" class="bg-surface">
			<div
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24"
			>
				<div>
					<p class="yw-eyebrow text-ink-muted">EN GRUPO · EXPERIENCIA COMBINADA</p>
					<h2 class="yw-heading-2 mt-4 text-ink">
						Una práctica. <span class="yw-script text-wave-ocean">Cometas</span> Muchas formas de vivirla.
					</h2>
					<div class="mt-4 flex flex-wrap gap-2">
						<Badge tone="breathwork" />
						<Badge tone="meditacion" />
						<Badge tone="coaching" />
					</div>
					<p class="yw-body mt-4 text-ink-muted">
						Sesiones inmersivas que unen las tres disciplinas en una sola experiencia: soltar con la respiración,
						ordenar con la meditación y salir con un propósito claro.
					</p>
					<div class="mt-6">
						<Button variant="ghost" href="#sesiones">Descubrir Cometas →</Button>
					</div>
				</div>
				<div class="rounded-lg bg-wave-indigo p-8 text-on-deep">
					<ul class="grid gap-4">
						<li>
							<p class="yw-eyebrow text-on-deep opacity-80">RESPIRACIÓN</p>
							<p class="yw-heading-3 mt-1 text-on-deep">Breathwork</p>
						</li>
						<li>
							<p class="yw-eyebrow text-on-deep opacity-80">ATENCIÓN</p>
							<p class="yw-heading-3 mt-1 text-on-deep">Meditación</p>
						</li>
						<li>
							<p class="yw-eyebrow text-on-deep opacity-80">PROCESO</p>
							<p class="yw-heading-3 mt-1 text-on-deep">Coaching · Hipnoterapia</p>
						</li>
					</ul>
					<p class="yw-small mt-6 text-on-deep opacity-80">Próximas sesiones y formato · por confirmar</p>
				</div>
			</div>
		</section>
```

Insert this block immediately before the closing `</main>` tag (after the
"Prueba social" `</section>` from Task 5).

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors. The four `SessionCard`s render in a
4-column grid on large screens, 2-column on tablet, 1-column on mobile.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "Add beneficios, encuentra tu ola and cometas sections"
```

---

## Task 7: Surf & Breath, Misión, Fundadora

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Insert the three sections before `</main>`**

```astro
		<section id="surf-breath" class="bg-surface">
			<div
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24"
			>
				<div
					class="order-2 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-line bg-sand p-6 text-center md:order-1"
					role="img"
					aria-label="Imagen de referencia: breathwork en la orilla junto al mar, pendiente de sustituir por fotografía real"
				>
					<p class="yw-small text-ink-muted">Imagen de referencia · sustituir por fotografía</p>
				</div>
				<div class="order-1 md:order-2">
					<p class="yw-eyebrow text-ink-muted">MAR ADENTRO · NUEVA PROPUESTA</p>
					<h2 class="yw-heading-2 mt-4 text-ink">Surf &amp; Breath: respira en la orilla, coge tu ola.</h2>
					<p class="yw-body mt-4 text-ink-muted">
						Una experiencia que solo puede guiar una monitora de surf: preparar el cuerpo con la respiración y
						llevarla al agua.
					</p>
					<ol class="mt-6 grid gap-4">
						<li class="flex gap-4">
							<span class="yw-heading-3 text-wave-ocean">01</span>
							<div>
								<p class="yw-heading-3 text-ink">En la arena.</p>
								<p class="yw-body text-ink-muted">Breathwork para activar y calmar el cuerpo.</p>
							</div>
						</li>
						<li class="flex gap-4">
							<span class="yw-heading-3 text-wave-ocean">02</span>
							<div>
								<p class="yw-heading-3 text-ink">En el agua.</p>
								<p class="yw-body text-ink-muted">Baño de olas guiado o iniciación al surf, a tu nivel.</p>
							</div>
						</li>
						<li class="flex gap-4">
							<span class="yw-heading-3 text-wave-ocean">03</span>
							<div>
								<p class="yw-heading-3 text-ink">Después de la ola.</p>
								<p class="yw-body text-ink-muted">Meditación breve para integrar lo vivido.</p>
							</div>
						</li>
					</ol>
					<div class="mt-6 flex flex-wrap items-center gap-3">
						<Badge tone="surf" />
						<Badge tone="breathwork" />
						<span class="yw-small text-ink-muted">POR VALIDAR CON YOUR WAVE</span>
					</div>
				</div>
			</div>
		</section>

		<WaveDivider from="var(--surface)" to="var(--sand)" />

		<section class="bg-sand">
			<div
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24"
			>
				<div>
					<p class="yw-eyebrow text-ink-muted">LO QUE NOS MUEVE</p>
					<h2 class="yw-heading-2 mt-4 text-ink">Más espacio para ser. Menos prisa por llegar.</h2>
					<p class="yw-body mt-4 text-ink-muted">
						Your Wave nace para acercar la respiración, la atención y el aprendizaje personal a la vida
						cotidiana. Sin un único camino ni una forma correcta de vivir la experiencia.
					</p>
					<p class="yw-body mt-4 text-ink-muted">
						El mar enseña a leer el momento, esperar, remar y soltar. Eso mismo trabajamos en cada sesión.
					</p>
					<ul class="yw-rays mt-6">
						<li>Escucha antes que exigencia</li>
						<li>Claridad en cada paso</li>
						<li>Respeto por tu propio ritmo</li>
					</ul>
				</div>
				<div
					class="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-line bg-surface p-6 text-center"
					role="img"
					aria-label="Imagen de referencia: una pausa junto al mar, pendiente de sustituir por fotografía real"
				>
					<p class="yw-small text-ink-muted">Imagen de referencia · una pausa junto al mar</p>
				</div>
			</div>

			<div
				id="sobre-mi"
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 pb-12 md:grid-cols-[280px_1fr] md:items-center md:gap-12 md:px-6 md:pb-24"
			>
				<div
					class="flex aspect-[4/5] items-center justify-center rounded-lg border border-dashed border-line bg-surface p-6 text-center"
					role="img"
					aria-label="Retrato de la fundadora en el agua o en la orilla, sesión de fotos pendiente"
				>
					<p class="yw-small text-ink-muted">Sesión de fotos pendiente</p>
				</div>
				<div>
					<p class="yw-eyebrow text-ink-muted">DETRÁS DE YOUR WAVE</p>
					<h2 class="yw-heading-2 mt-4 text-ink">Hola, soy [Nombre].</h2>
					<p class="yw-body mt-4 text-ink-muted">
						Monitora de surf y facilitadora de breathwork, meditación y coaching. Aquí irá su historia: cómo el
						mar le enseñó a respirar y por qué creó Your Wave.
					</p>
					<p class="yw-small mt-2 text-ink-muted">CONTENIDO PENDIENTE</p>
					<div class="mt-6">
						<Button variant="ghost" href="#sobre-mi">Conocer mi historia →</Button>
					</div>
				</div>
			</div>
		</section>
```

Insert immediately before `</main>` (after the "Cometas" `</section>` from
Task 6).

- [ ] **Step 2: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "Add surf & breath, misión and fundadora sections"
```

---

## Task 8: Cursos, Comunidad, Testimonios

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Testimonial` (new import this task), plus everything from Tasks 5-7.

- [ ] **Step 1: Add the import**

```astro
import Testimonial from '../components/Testimonial.astro';
```

- [ ] **Step 2: Insert the three sections before `</main>`**

```astro
		<section id="cursos" class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<div class="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p class="yw-eyebrow text-ink-muted">CURSOS YOUR WAVE</p>
						<h2 class="yw-heading-2 mt-4 text-ink">Aprende. Explora. Hazlo tuyo.</h2>
						<p class="yw-body mt-2 max-w-[60ch] text-ink-muted">
							Programas con objetivos y temarios claros para seguir profundizando en tu práctica.
						</p>
					</div>
					<Button variant="ghost" href="#cursos">Ver todos los cursos →</Button>
				</div>
				<div class="mt-10 grid gap-6 md:grid-cols-3">
					<article class="yw-card">
						<div class="yw-card-body">
							<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
								<Badge tone="breathwork" />
								<Badge tone="neutral">Ejemplo</Badge>
							</div>
							<h3 class="yw-card-title">Explorar la respiración</h3>
							<p class="yw-card-text">Conocer la respiración como práctica de atención.</p>
							<p class="yw-card-meta">Observación · Ritmo · Práctica guiada</p>
						</div>
						<div class="yw-card-foot">
							<span class="yw-small text-ink-muted">Formato, duración y precio · por confirmar</span>
							<Button variant="ghost" href="#cursos">Ver programa →</Button>
						</div>
					</article>
					<article class="yw-card">
						<div class="yw-card-body">
							<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
								<Badge tone="meditacion" />
								<Badge tone="neutral">Ejemplo</Badge>
							</div>
							<h3 class="yw-card-title">Iniciación a la meditación</h3>
							<p class="yw-card-text">Distintas formas de prestar atención y crear una rutina.</p>
							<p class="yw-card-meta">Atención · Presencia · Rutina personal</p>
						</div>
						<div class="yw-card-foot">
							<span class="yw-small text-ink-muted">Formato, duración y precio · por confirmar</span>
							<Button variant="ghost" href="#cursos">Ver programa →</Button>
						</div>
					</article>
					<article class="yw-card">
						<div class="yw-card-body">
							<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
								<Badge tone="coaching" />
								<Badge tone="neutral">Ejemplo</Badge>
							</div>
							<h3 class="yw-card-title">Un camino hacia ti</h3>
							<p class="yw-card-text">Un espacio de reflexión y aprendizaje personal.</p>
							<p class="yw-card-meta">Escucha · Reflexión · Integración</p>
						</div>
						<div class="yw-card-foot">
							<span class="yw-small text-ink-muted">Formato, duración y precio · por confirmar</span>
							<Button variant="ghost" href="#cursos">Ver programa →</Button>
						</div>
					</article>
				</div>
			</div>
		</section>

		<section id="comunidad" class="bg-wave-indigo text-on-deep">
			<div
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24"
			>
				<div>
					<p class="yw-eyebrow text-on-deep opacity-80">COMUNIDAD · LA TRIBU</p>
					<h2 class="yw-heading-2 mt-4 text-on-deep">Tu camino también puede ser compartido.</h2>
					<p class="yw-body mt-4 text-on-deep opacity-90">
						Un espacio para la tribu Your Wave: seguir aprendiendo, compartir lo vivido y encontrar nuevas formas
						de conectar.
					</p>
					<ul class="mt-6 grid gap-4">
						<li>
							<p class="yw-heading-3 text-on-deep">Recursos</p>
							<p class="yw-body text-on-deep opacity-90">Prácticas y audios para acompañar tu día.</p>
						</li>
						<li>
							<p class="yw-heading-3 text-on-deep">Parte de olas</p>
							<p class="yw-body text-on-deep opacity-90">Novedades y próximas sesiones, en tu correo.</p>
						</li>
						<li>
							<p class="yw-heading-3 text-on-deep">Encuentros</p>
							<p class="yw-body text-on-deep opacity-90">Quedadas en la playa para practicar juntos.</p>
						</li>
					</ul>
					<p class="yw-small mt-4 text-on-deep opacity-80">Acceso y encuentros · por confirmar</p>
					<div class="mt-6 flex flex-wrap items-center gap-3">
						<Button variant="secondary" class="border-on-deep text-on-deep" href="#comunidad">
							Únete a la tribu
						</Button>
						<span class="yw-small text-on-deep opacity-80">Enlace a la comunidad de WhatsApp · pendiente</span>
					</div>
				</div>
				<div
					class="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-on-deep/40 bg-wave-ocean/40 p-6 text-center"
					role="img"
					aria-label="Imagen de referencia de la comunidad, no representa a miembros reales, pendiente de sustituir por fotografía real"
				>
					<p class="yw-small text-on-deep opacity-80">Imagen de referencia · no representa a miembros reales</p>
				</div>
			</div>
		</section>

		<section class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<p class="yw-eyebrow text-ink-muted">EXPERIENCIAS COMPARTIDAS</p>
				<h2 class="yw-heading-2 mt-4 text-ink">Después de la ola.</h2>
				<div class="mt-10 grid gap-6 md:grid-cols-3">
					<Testimonial
						quote="Testimonio real de una participante sobre cómo se sintió después de la sesión."
						name="Nombre real"
						detail="Sesión 1 a 1 · pendiente"
					/>
					<Testimonial
						quote="Testimonio real sobre una experiencia Cometa o Surf & Breath."
						name="Nombre real"
						detail="Cometa · pendiente"
					/>
					<Testimonial
						quote="Testimonio real de alguien que ha hecho uno de los cursos."
						name="Nombre real"
						detail="Curso · pendiente"
					/>
				</div>
				<p class="yw-small mt-6 text-ink-muted">Solo voces reales, con nombre, foto y consentimiento.</p>
			</div>
		</section>
```

Insert immediately before `</main>` (after the "Fundadora" closing `</section>`
from Task 7).

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors. Visually confirm (via `npm run dev
--background` and a browser) that the "Únete a la tribu" secondary button on
the indigo Comunidad section renders with a white border and white text —
this is the cascade-layer fix from Task 2 actually taking effect.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "Add cursos, comunidad and testimonios sections"
```

---

## Task 9: FAQ, CTA final, Footer, and JSON-LD wiring

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `FaqItem` (new import this task), plus everything from Tasks 5-8.
- Produces: the page's `faqs` and `serviceJsonLd` frontmatter arrays, passed
  to `Layout`'s `extraGraph` prop (consumed only by `Layout.astro` itself,
  from Task 2).

- [ ] **Step 1: Add the import and the `faqs`/`serviceJsonLd` frontmatter data**

Add the import:

```astro
import FaqItem from '../components/FaqItem.astro';
```

In the frontmatter, after the existing imports, add:

```astro
const faqs = [
	{
		question: '¿Por dónde puedo empezar?',
		answer:
			'Con una sesión 1 a 1, una práctica en grupo o un curso. Si dudas, escríbenos y te ayudamos a elegir. Canal de contacto: WhatsApp.',
	},
	{
		question: '¿Necesito experiencia previa o saber surfear?',
		answer: 'Contenido pendiente de redacción.',
	},
	{
		question: '¿Qué son las experiencias Cometas?',
		answer: 'Contenido pendiente de redacción.',
	},
	{
		question: '¿Cómo reservo y puedo cambiar la fecha?',
		answer: 'Contenido pendiente de redacción.',
	},
	{
		question: '¿Dónde se realizan y cuánto cuestan?',
		answer: 'Contenido pendiente de redacción.',
	},
];

const serviceJsonLd = [
	{
		'@type': 'Service',
		name: 'Sesiones 1 a 1',
		description: 'Acompañamiento personalizado y atención a lo que quieres explorar.',
	},
	{
		'@type': 'Service',
		name: 'Sesiones grupales',
		description: 'Comparte la práctica. Una disciplina o una experiencia que lo combine todo.',
	},
	{
		'@type': 'Service',
		name: 'Cursos Your Wave',
		description: 'Programas con objetivos claros para dar continuidad a tu práctica, paso a paso.',
	},
	{
		'@type': 'Service',
		name: 'Comunidad',
		description: 'Un punto de encuentro para compartir recursos, novedades y experiencias con la tribu.',
	},
];

const faqJsonLd = {
	'@type': 'FAQPage',
	mainEntity: faqs.map((faq) => ({
		'@type': 'Question',
		name: faq.question,
		acceptedAnswer: { '@type': 'Answer', text: faq.answer },
	})),
};
```

- [ ] **Step 2: Pass `extraGraph` to `Layout`**

Change the opening `<Layout ...>` tag from Task 5:

```astro
<Layout
	title="Your Wave — Breathwork, meditación y coaching junto al mar"
	description="Sesiones de breathwork, meditación y coaching, individuales, grupales y en la playa, guiadas por una monitora de surf. Reserva por WhatsApp."
>
```

to:

```astro
<Layout
	title="Your Wave — Breathwork, meditación y coaching junto al mar"
	description="Sesiones de breathwork, meditación y coaching, individuales, grupales y en la playa, guiadas por una monitora de surf. Reserva por WhatsApp."
	extraGraph={[faqJsonLd, ...serviceJsonLd]}
>
```

- [ ] **Step 3: Insert the FAQ, CTA final and footer, right before `</main>`, with the footer after `</main>`**

```astro
		<section id="faq" class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<p class="yw-eyebrow text-ink-muted">ANTES DE EMPEZAR</p>
				<h2 class="yw-heading-2 mt-4 text-ink">Un poco más de claridad.</h2>
				<p class="yw-body mt-2 max-w-[60ch] text-ink-muted">Las preguntas que suelen surgir antes de reservar.</p>
				<div class="mt-8 max-w-[640px]">
					{
						faqs.map((faq, i) => (
							<FaqItem question={faq.question} defaultOpen={i === 0}>
								{i === 0 ? (
									<>
										Con una sesión 1 a 1, una práctica en grupo o un curso. Si dudas,{' '}
										<a
											class="text-link underline"
											href={whatsappLink('Hola, tengo dudas sobre cómo empezar en Your Wave.')}
										>
											escríbenos
										</a>{' '}
										y te ayudamos a elegir. Canal de contacto: WhatsApp.
									</>
								) : (
									faq.answer
								)}
							</FaqItem>
						))
					}
				</div>
			</div>
		</section>

		<WaveDivider from="var(--surface)" to="var(--wave-indigo)" />

		<section class="bg-wave-indigo text-on-deep">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 text-center md:px-6 md:py-24">
				<p class="yw-eyebrow text-on-deep opacity-80">TU SIGUIENTE PASO</p>
				<h2 class="yw-heading-2 mt-4 text-on-deep">Tu próxima ola empieza con una respiración.</h2>
				<p class="yw-body-lg mt-4 text-on-deep opacity-90">
					Elige tu sesión. Consulta disponibilidad. Confirma tu plaza.
				</p>
				<div class="mt-8 flex flex-wrap justify-center gap-4">
					<Button size="lg" href={whatsappLink('Hola, quiero reservar una sesión en Your Wave.')}>
						Reserva tu sesión
					</Button>
					<Button variant="secondary" size="lg" class="border-on-deep text-on-deep" href="#cursos">
						Ver cursos
					</Button>
				</div>
				<p class="yw-small mt-4 text-on-deep opacity-80">Agenda y condiciones de reserva · por confirmar</p>
			</div>
		</section>
	</main>

	<footer class="bg-wave-indigo text-on-deep">
		<div class="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-6 md:py-16">
			<div>
				<p class="yw-heading-3 text-on-deep">Your Wave</p>
				<p class="yw-body mt-2 text-on-deep opacity-90">
					Encuentra <span class="yw-script">tu ola</span>
				</p>
				<p class="yw-small mt-2 text-on-deep opacity-80">Breathwork, meditación y coaching junto al mar.</p>
			</div>
			<nav aria-label="Explorar">
				<p class="yw-eyebrow text-on-deep opacity-80">Explorar</p>
				<ul class="mt-4 grid gap-2">
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#sesiones">Sesiones 1 a 1</a></li>
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#sesiones">Sesiones grupales</a></li>
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#cometas">Cometas</a></li>
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#surf-breath">Surf &amp; Breath</a></li>
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#cursos">Cursos Your Wave</a></li>
				</ul>
			</nav>
			<nav aria-label="Your Wave">
				<p class="yw-eyebrow text-on-deep opacity-80">Your Wave</p>
				<ul class="mt-4 grid gap-2">
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#sobre-mi">Sobre mí</a></li>
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#comunidad">Comunidad</a></li>
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#faq">Preguntas frecuentes</a></li>
					<li>
						<a
							class="yw-body text-on-deep opacity-90 hover:opacity-100"
							href={whatsappLink('Hola, quiero contactar con Your Wave.')}
						>
							Contacto
						</a>
					</li>
				</ul>
			</nav>
			<div>
				<p class="yw-eyebrow text-on-deep opacity-80">Hablemos</p>
				<ul class="mt-4 grid gap-2">
					<li class="yw-body text-on-deep opacity-90">Correo · por confirmar</li>
					<li>
						<a
							class="yw-body text-on-deep opacity-90 hover:opacity-100"
							href={whatsappLink('Hola, quiero más información sobre Your Wave.')}
						>
							WhatsApp
						</a>
					</li>
					<li class="yw-body text-on-deep opacity-90">Instagram · por confirmar</li>
				</ul>
			</div>
		</div>
		<div class="border-t border-on-deep/20">
			<div class="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-6">
				<p class="yw-small text-on-deep opacity-80">© 2026 Your Wave</p>
				<ul class="flex flex-wrap gap-4">
					<li><a class="yw-small text-on-deep opacity-80 hover:opacity-100" href="#">Privacidad</a></li>
					<li><a class="yw-small text-on-deep opacity-80 hover:opacity-100" href="#">Términos</a></li>
					<li><a class="yw-small text-on-deep opacity-80 hover:opacity-100" href="#">Aviso legal</a></li>
					<li><a class="yw-small text-on-deep opacity-80 hover:opacity-100" href="#">Cookies</a></li>
				</ul>
			</div>
		</div>
	</footer>
</Layout>
```

This replaces the previous closing `	</main>\n</Layout>` lines: the FAQ and
CTA-final sections go inside `<main>` (right after Testimonios from Task 8),
then `</main>`, then the new `<footer>`, then `</Layout>`.

- [ ] **Step 4: Verify the build and check the JSON-LD**

```bash
npm run build
grep -o '"@type":"FAQPage".*}]}' dist/index.html | head -c 600
```

Expected: `npm run build` completes with no errors, and the `grep` output
shows a `FAQPage` object whose five `"name"` values match the five FAQ
questions above word-for-word, and whose `"text"` values match the `answer`
fields above (the first one without the `escríbenos` link markup, matching
the spec's "mismo texto visible" rule in substance).

- [ ] **Step 5: Verify a WhatsApp link encodes Spanish text correctly**

```bash
node -e "console.log(decodeURIComponent('Hola%2C%20quiero%20reservar%20una%20sesi%C3%B3n%20en%20Your%20Wave.'))"
```

Then open `dist/index.html` and confirm the actual `href` generated for the
hero's primary button starts with `https://wa.me/34628757954?text=` and that
URL-decoding it (e.g. pasting into a browser address bar) reproduces
"Hola, quiero reservar una sesión en Your Wave." exactly, accented
characters included.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "Add FAQ, final CTA and footer; wire FAQPage/Service JSON-LD"
```

---

## Task 10: llms.txt and final verification

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Write `public/llms.txt`**

```
# Your Wave

Your Wave (World Awaken Vision Experience) ofrece sesiones de breathwork,
meditación y coaching/hipnoterapia guiadas por una monitora de surf, en
individual, en grupo y en la playa (Surf & Breath). La marca se mueve como
el mar: serena en la orilla, con fuerza en la ola.

## Qué ofrece

- Sesiones 1 a 1: acompañamiento individual personalizado.
- Sesiones grupales: por disciplina (breathwork, meditación, coaching) o
  combinadas en "Cometas".
- Surf & Breath: breathwork en la arena + iniciación al surf o baño de olas
  guiado + meditación.
- Cursos Your Wave: programas con temario y objetivos claros.
- Comunidad: una tribu que se organiza a través de una comunidad de
  WhatsApp.

## Contacto

Reservas y contacto por WhatsApp: https://wa.me/34628757954

## Páginas

- Home: https://yourwave.es/
```

- [ ] **Step 2: Commit**

```bash
git add public/llms.txt
git commit -m "Add llms.txt for GEO"
```

- [ ] **Step 3: Full production build**

```bash
npm run build
```

Expected: completes with no errors. Open `dist/index.html` and spot-check:
one `<h1>` on the page, `<link rel="canonical" href="https://yourwave.es/">`
present, `<link rel="sitemap" ...>` present, exactly one `application/ld+json`
script tag containing `Organization`, `WebSite`, `WebPage`, `FAQPage`, and
four `Service` entries in its `@graph`.

- [ ] **Step 4: Manual browser verification**

```bash
astro dev --background
```

Using Claude in Chrome (or any browser), open the dev server URL and check:

- Desktop width (~1440px) and mobile width (~390px, matching the two
  mockup breakpoints in `doc/propuesta-v2/`): no horizontal overflow, no
  overlapping text.
- An extra-narrow width (~360px): header, hero, and the 4-card and 3-card
  grids still fit without horizontal scroll.
- Click every header nav link and confirm it scrolls to the matching
  section (`#sesiones`, `#cometas`, `#cursos`, `#comunidad`, `#sobre-mi`).
- Click the first FAQ item closed, then open it again — `<details>` toggles
  with no JavaScript errors in the console.
- Hover/inspect the "Únete a la tribu" button in the Comunidad section:
  confirm its text and border render white (`on-deep`), not the default
  near-black `ink` — this confirms the Task 2 layer fix is working.
- Read the Comunidad, CTA final and footer sections against their
  `wave-indigo` background and confirm the `opacity-80`/`opacity-90` text is
  comfortably readable, not washed out.
- Check the browser console for any 404s (there should be none — the two
  logo SVGs and the favicon are the only static assets referenced).

```bash
astro dev stop
```

- [ ] **Step 5: Report completion**

Once every check in Steps 3-4 passes, the home page is complete per the
spec. No commit needed for this step (verification only).

# Home: sistema de diseño, SEO, GEO, rendimiento y bilingüe (ES/EN) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Your Wave home page in Spanish (`/`) and English (`/en/`)
on top of the existing design system, with the real mockup copy translated
into both languages, WhatsApp-based CTAs, and a correct SEO/GEO/performance
baseline.

**Architecture:** Port the 6 React reference components
(`design-system/components/`) to zero-JS `.astro` components that consume the
existing `bundle.css` classes unmodified. Wire Tailwind v4's `@theme inline`
to alias the design tokens. Store all page copy in two typed content
dictionaries (`src/content/home/es.ts`, `src/content/home/en.ts`) sharing one
`HomeContent` interface. Build the entire page markup **once**, in
`src/components/HomePage.astro`, parameterized by `lang` and `content`. Two
thin page files (`src/pages/index.astro`, `src/pages/en/index.astro`) select
the locale. Use Astro's native i18n routing (`astro:i18n`) for locale URLs
and hreflang — no new dependencies. Fix a live SEO bug in `astro.config.mjs`
and extend `Layout.astro`'s JSON-LD `@graph` with page-specific
`FAQPage`/`Service` entries generated from whichever locale's content is
rendering.

**Tech Stack:** Astro 7 (including `astro:i18n`), Tailwind v4
(`@tailwindcss/vite`), `@astrojs/sitemap`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-08-home-design-system-seo-geo-design.md`

## Global Constraints

- No new npm dependencies (runtime or dev). daisyUI stays installed, unconfigured.
- Zero client-side JavaScript. `FaqItem` uses native `<details>/<summary>`.
- Every color, spacing, radius and font comes from `design-system/tokens.css`
  tokens — never a bare hex value or an arbitrary pixel size in page code.
- `design-system/tokens.css` and `design-system/components/bundle.css` are
  generated source-of-truth files — never edit them.
- No invented testimonials, prices, figures, or photography, **in either
  language**. Every piece of missing real content uses the same placeholder
  wording the mockup uses, translated — never new invented copy.
- Spanish is tuteo, no emojis, no exclamation marks in headings. English
  content mirrors the same voice (direct, calm, no exclamation marks,
  no emojis) — it is a translation of the Spanish mockup copy, not new copy.
- `WaveDivider` is used at most 3 times per page render, only between
  sections of different background color.
- WhatsApp number: `34628757954` (no `+`, no spaces, for `wa.me` links) —
  lives only in `src/config/contact.ts`. Every CTA's prefilled message is in
  the content dictionary of its own language.
- Reservation/contact CTAs open WhatsApp; exploratory CTAs stay internal
  anchors (same anchor IDs in both languages — anchors are structural, not
  translated).
- No new pages/routes beyond the two home locales. No stub pages for
  `/sesiones`, `/cometas`, etc. in either language.
- Spanish is the default locale at `/` (`prefixDefaultLocale: false`);
  English lives at `/en/`.
- There is no test framework in this repo and the spec explicitly decided
  not to add one. The verification gate for every task is `npm run build`
  succeeding, plus a final manual browser pass in both languages.

## Review Focus

- **`SITE_URL` env var absence/presence**: `astro.config.mjs` must produce a
  working `site`, sitemap and canonical/JSON-LD both with and without
  `SITE_URL` set. Task 1 builds both ways.
- **English and Spanish content drifting out of shape** — a reasonable
  developer adding a 16th section later could update `es.ts` and forget
  `en.ts`, silently breaking the English page (missing field, blank text).
  Both files implement the same `HomeContent` interface under
  `strict` TypeScript, so a missing field is a type error; Task 5's check
  explicitly confirms `en.ts` doesn't compile if a field is dropped.
- **FAQ visible text vs. `FAQPage` JSON-LD text diverging**, independently in
  each language — Task 9 sources both from the same `content.faq.items`
  array per locale, and its check confirms the built HTML of **each**
  locale's JSON-LD block matches that locale's visible accordion text.
- **A visitor on the English page reaching a Spanish WhatsApp message** (or
  vice versa) — every `whatsappLink()` call in `HomePage.astro` must read
  its message from `content.whatsapp.*`, never a literal string. Task 10's
  check opens one generated link per locale and confirms the decoded text
  matches that locale's language.
- **Narrow mobile viewport (< 375px) in both languages** — English strings
  run longer than Spanish for some labels (e.g. "Cursos Your Wave" vs "Your
  Wave Courses"); Task 11's manual verification checks both locales at this
  width, not just Spanish.

---

## Task 1: Cleanup, SEO config fix, i18n routing config, WhatsApp helper

**Files:**
- Delete: `src/components/Welcome.astro`
- Delete: `src/assets/astro.svg`
- Delete: `src/assets/background.svg`
- Modify: `astro.config.mjs`
- Modify: `src/config/seo.ts`
- Create: `src/config/contact.ts`

**Interfaces:**
- Produces: `whatsappNumber: string`, `whatsappLink(message: string): string` from `src/config/contact.ts`, consumed from Task 7 onward.
- Produces: `siteName: string`, `defaultDescription: string` from `src/config/seo.ts`, consumed by `Layout.astro` (unchanged contract).
- Produces: i18n routing config in `astro.config.mjs` (`defaultLocale: 'es'`, `locales: ['es', 'en']`), consumed by `astro:i18n`'s `getRelativeLocaleUrl` in Task 2 and by the page files in Task 10.

- [ ] **Step 1: Delete the unused Astro starter scaffold**

```bash
git rm src/components/Welcome.astro src/assets/astro.svg src/assets/background.svg
```

Nothing in `src/pages/index.astro` imports `Welcome.astro` (confirmed: it
only imports `Layout.astro`), so this is a pure deletion.

- [ ] **Step 2: Fix the `SITE_URL` fallback bug and add i18n routing to `astro.config.mjs`**

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
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
```

Before the `site`/sitemap fix, `site` and the `sitemap()` integration were
only added when `process.env.SITE_URL` was set, so a plain `astro build`
shipped with no canonical URL, no sitemap, and no JSON-LD `url` fields. Now
`https://yourwave.es` is the default, still overridable via `SITE_URL` for
staging builds. The new `i18n` block makes Astro serve
`src/pages/index.astro` at `/` (Spanish, default locale, no prefix) and
`src/pages/en/index.astro` at `/en/` (English) — both built in Task 10 — and
makes `astro:i18n`'s `getRelativeLocaleUrl()` helper available (used in
Task 2).

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

Expected: both complete with no errors (the i18n config is valid even
though no `en` page exists yet — Astro only requires the matching page file
to exist for a locale route to be reachable, and `src/pages/index.astro`
still exists as the pre-existing placeholder). Check
`dist/sitemap-index.xml` exists after each build.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Fix SITE_URL fallback, add i18n routing config, remove Astro starter scaffold, add WhatsApp helper"
```

---

## Task 2: Design system integration (tokens, Tailwind theme, Layout)

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Produces: Tailwind utilities `bg-surface`, `bg-surface-raised`, `bg-sand`,
  `bg-wave-indigo`, `bg-wave-ocean`, `bg-wave-blue`, `bg-wave-sky`, `bg-sun`,
  `bg-on-deep`, `bg-primary`, `bg-on-primary`, `bg-link`, `bg-focus` (and
  their `text-*`/`border-*` equivalents), `rounded-sm/md/lg/pill`, aliased to
  the design tokens — consumed by `HomePage.astro` from Task 7 onward.
- Produces `Layout.astro`'s new props: `lang?: 'es' | 'en'` (default `'es'`)
  and `extraGraph?: Record<string, unknown>[]` — both consumed by
  `HomePage.astro` (via the page files) from Task 7 onward.

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
for buttons on the dark sections, from Task 8 onward). Without
`layer(components)`, `bundle.css` would be unlayered CSS, which always beats
every layered rule regardless of specificity or source order — utilities
could never win.

- [ ] **Step 2: Add font preconnect hints to `Layout.astro`**

In `src/layouts/Layout.astro`, inside `<head>`, right after the viewport
meta tag, add:

```astro
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

- [ ] **Step 3: Add `lang` and `extraGraph` props to `Layout.astro`**

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
import { getRelativeLocaleUrl } from 'astro:i18n';

interface Props {
	title?: string;
	description?: string;
	canonicalUrl?: string;
	image?: string;
	noIndex?: boolean;
	lang?: 'es' | 'en';
	extraGraph?: Record<string, unknown>[];
}

const {
	title = siteName,
	description = defaultDescription,
	canonicalUrl,
	image,
	noIndex = false,
	lang = 'es',
	extraGraph = [],
} = Astro.props;

const alternateEs = Astro.site ? new URL(getRelativeLocaleUrl('es', '/'), Astro.site) : undefined;
const alternateEn = Astro.site ? new URL(getRelativeLocaleUrl('en', '/'), Astro.site) : undefined;
```

(Put the `import { getRelativeLocaleUrl } from 'astro:i18n';` line alongside
the existing `import { defaultDescription, siteName } from '../config/seo';`
line at the top of the frontmatter.)

Change `<html lang="es">` to `<html lang={lang}>`.

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

- [ ] **Step 4: Add hreflang alternate links**

In `<head>`, right after the existing `{canonical && <link rel="canonical" ...}` line, add:

```astro
{alternateEs && <link rel="alternate" hreflang="es" href={alternateEs.href} />}
{alternateEn && <link rel="alternate" hreflang="en" href={alternateEn.href} />}
{alternateEs && <link rel="alternate" hreflang="x-default" href={alternateEs.href} />}
```

- [ ] **Step 5: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors. The current `src/pages/index.astro`
(`Yourwave` placeholder `<h1>`) still renders fine since `lang` defaults to
`'es'` and `extraGraph` defaults to `[]`.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/Layout.astro
git commit -m "Wire design system tokens into Tailwind theme; add lang and hreflang support to Layout"
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
  (default `'neutral'`), `class?: string`; default slot is the label text
  (always pass it explicitly from Task 7 onward — the content is
  bilingual, so there is no language-correct hardcoded default).
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

const { tone = 'neutral', class: className } = Astro.props;
const classes = ['yw-badge', `yw-badge-${tone}`, className].filter(Boolean).join(' ');
---

<span class={classes}><slot /></span>
```

(No built-in label map this time — the original React component's default
Spanish labels can't be correct for both languages, so every call site
supplies its own slot text from the matching locale's content dictionary.)

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors (neither component is used by any page
yet).

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
- Consumes: `Button` and `Badge` from Task 3.
- Produces: `SessionCard` — props `title: string`, `disciplines?:
  Discipline[]`, `meta?: string`, `description?: string`, `price?: string`,
  `image?: string`, `imageAlt?: string`, `actionLabel?: string` (default
  `'Reservar'` — override it from content for the English page), `href?:
  string`, `class?: string`.
- Produces: `WaveDivider` — props `from?: string` (default `'transparent'`),
  `to?: string` (default `'var(--sand)'`), `back?: string`, `height?: number`
  (default `72`), `flip?: boolean`, `layered?: boolean` (default `true`),
  `class?: string`.
- Produces: `Testimonial` — props `quote: string`, `name: string`, `detail?:
  string`, `photo?: string`, `class?: string`.
- Produces: `FaqItem` — props `question: string`, `defaultOpen?: boolean`,
  `class?: string`; default slot is the answer body.
- All four consumed from Task 7 onward.

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

(This plan's actual card usage in Task 7/8 never passes `disciplines` — the
four "Encuentra tu ola" / "Find your wave" cards and the three course
example cards render their badges directly rather than through this prop,
so they can supply bilingual badge labels. The prop stays for contract
fidelity with `design-system/components/index.d.ts` and is exercised by the
`disciplines`-less path.)

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

## Task 5: Content type and Spanish content dictionary

**Files:**
- Create: `src/content/home/types.ts`
- Create: `src/content/home/es.ts`

**Interfaces:**
- Produces: `export interface HomeContent` from `src/content/home/types.ts`,
  consumed by `es.ts` (this task), `en.ts` (Task 6), and `HomePage.astro`
  (Task 7 onward).
- Produces: `export const es: HomeContent` from `src/content/home/es.ts`,
  consumed by `src/pages/index.astro` (Task 10).

- [ ] **Step 1: Write `src/content/home/types.ts`**

```ts
export interface HomeContent {
	meta: { title: string; description: string };
	nav: {
		sesiones: string;
		cometas: string;
		cursos: string;
		comunidad: string;
		sobreMi: string;
		reserve: string;
		switchLabel: string;
	};
	whatsapp: {
		reserve: string;
		reserve1a1: string;
		faqHelp: string;
		footerInfo: string;
		footerContact: string;
	};
	badges: {
		breathwork: string;
		meditacion: string;
		coaching: string;
		surf: string;
		sample: string;
	};
	hero: {
		eyebrow: string;
		h1: string;
		subtitle: string;
		ctaPrimary: string;
		ctaSecondary: string;
		trust: string;
		imageCaption: string;
		scriptPre: string;
		scriptWord: string;
		scriptPost: string;
	};
	social: {
		eyebrow: string;
		stat1Value: string;
		stat1Label: string;
		stat2Value: string;
		stat2Label: string;
		quote: string;
		quoteNote: string;
	};
	benefits: { title: string; text: string }[];
	sessions: {
		eyebrow: string;
		title: string;
		intro: string;
		cards: { title: string; description: string; meta: string; actionLabel: string }[];
	};
	cometas: {
		eyebrow: string;
		titlePre: string;
		scriptWord: string;
		titlePost: string;
		text: string;
		cta: string;
		steps: { label: string; value: string }[];
		note: string;
	};
	surfBreath: {
		eyebrow: string;
		title: string;
		subtitle: string;
		imageCaption: string;
		steps: { number: string; title: string; text: string }[];
		note: string;
	};
	mission: {
		eyebrow: string;
		title: string;
		text1: string;
		text2: string;
		values: string[];
		imageCaption: string;
	};
	founder: {
		eyebrow: string;
		title: string;
		portraitCaption: string;
		text: string;
		note: string;
		cta: string;
	};
	courses: {
		eyebrow: string;
		title: string;
		viewAll: string;
		intro: string;
		cards: { badgeSample: string; title: string; text: string; meta: string; price: string; cta: string }[];
	};
	community: {
		eyebrow: string;
		title: string;
		text: string;
		points: { title: string; text: string }[];
		meta: string;
		cta: string;
		pendingNote: string;
		imageCaption: string;
	};
	testimonials: {
		eyebrow: string;
		title: string;
		items: { quote: string; name: string; detail: string }[];
		note: string;
	};
	faq: {
		eyebrow: string;
		title: string;
		intro: string;
		items: { question: string; answer: string }[];
		firstAnswerPrefix: string;
		firstAnswerLink: string;
		firstAnswerSuffix: string;
	};
	finalCta: {
		eyebrow: string;
		title: string;
		text: string;
		ctaPrimary: string;
		ctaSecondary: string;
		note: string;
	};
	footer: {
		taglinePre: string;
		scriptWord: string;
		small: string;
		exploreLabel: string;
		explore: { label: string; href: string }[];
		brandLabel: string;
		sobreMi: string;
		comunidad: string;
		faqLabel: string;
		contacto: string;
		talkLabel: string;
		emailPending: string;
		whatsappLabel: string;
		instagramPending: string;
		copyright: string;
		privacy: string;
		terms: string;
		notice: string;
		cookies: string;
	};
}
```

- [ ] **Step 2: Write `src/content/home/es.ts`**

```ts
import type { HomeContent } from './types';

export const es: HomeContent = {
	meta: {
		title: 'Your Wave — Breathwork, meditación y coaching junto al mar',
		description:
			'Sesiones de breathwork, meditación y coaching, individuales, grupales y en la playa, guiadas por una monitora de surf. Reserva por WhatsApp.',
	},
	nav: {
		sesiones: 'Sesiones',
		cometas: 'Cometas',
		cursos: 'Cursos',
		comunidad: 'Comunidad',
		sobreMi: 'Sobre mí',
		reserve: 'Reserva tu sesión',
		switchLabel: 'EN',
	},
	whatsapp: {
		reserve: 'Hola, quiero reservar una sesión en Your Wave.',
		reserve1a1: 'Hola, quiero reservar una sesión 1 a 1.',
		faqHelp: 'Hola, tengo dudas sobre cómo empezar en Your Wave.',
		footerInfo: 'Hola, quiero más información sobre Your Wave.',
		footerContact: 'Hola, quiero contactar con Your Wave.',
	},
	badges: {
		breathwork: 'Breathwork',
		meditacion: 'Meditación',
		coaching: 'Coaching · Hipnoterapia',
		surf: 'Surf',
		sample: 'Ejemplo',
	},
	hero: {
		eyebrow: 'BREATHWORK · MEDITACIÓN · COACHING',
		h1: 'Respira, suelta y vuelve a tu centro.',
		subtitle:
			'Sesiones de breathwork, meditación y coaching para bajar el ritmo y escucharte. En individual, en grupo, en la playa o aprendiendo a tu ritmo. Como en el agua: una ola cada vez.',
		ctaPrimary: 'Reserva tu sesión',
		ctaSecondary: 'Ver cursos',
		trust: 'Sesiones 1 a 1 · Grupales · Surf & Breath · Cursos',
		imageCaption: 'Imagen de referencia · sustituir por fotografía',
		scriptPre: 'Encuentra ',
		scriptWord: 'tu ola',
		scriptPost: ' propia',
	},
	social: {
		eyebrow: 'CONFIANZA QUE SE CONSTRUYE',
		stat1Value: '+000',
		stat1Label: 'personas acompañadas · dato real pendiente',
		stat2Value: '0,0 ★',
		stat2Label: 'valoración en Google · pendiente',
		quote: 'Aquí irá una frase real de una participante, con su nombre y permiso.',
		quoteNote: 'Testimonio breve · contenido pendiente',
	},
	benefits: [
		{ title: 'Tiempo para escucharte', text: 'Un espacio para observar cómo te sientes, sin exigencias.' },
		{
			title: 'Tu propio ritmo',
			text: 'Elige el formato que encaja con tu momento: como elegir la ola que quieres coger.',
		},
		{
			title: 'Aprendizaje compartido',
			text: 'Herramientas y prácticas para seguir, en compañía o por tu cuenta.',
		},
	],
	sessions: {
		eyebrow: 'CUATRO FORMAS DE EMPEZAR',
		title: 'Encuentra tu ola.',
		intro: 'No necesitas tenerlo todo claro. Elige una primera experiencia que tenga sentido para ti.',
		cards: [
			{
				title: 'Sesiones 1 a 1',
				description: 'Acompañamiento personalizado y atención a lo que quieres explorar.',
				meta: 'Cita según disponibilidad',
				actionLabel: 'Reservar mi cita →',
			},
			{
				title: 'Sesiones grupales',
				description: 'Comparte la práctica. Una disciplina o una experiencia que lo combine todo.',
				meta: 'Disciplinas y Cometas',
				actionLabel: 'Explorar sesiones →',
			},
			{
				title: 'Cursos Your Wave',
				description: 'Programas con objetivos claros para dar continuidad a tu práctica, paso a paso.',
				meta: 'Temario, objetivos e inscripción',
				actionLabel: 'Ver los cursos →',
			},
			{
				title: 'Comunidad',
				description: 'Un punto de encuentro para compartir recursos, novedades y experiencias con la tribu.',
				meta: 'Recursos, eventos y conexión',
				actionLabel: 'Conocer la tribu →',
			},
		],
	},
	cometas: {
		eyebrow: 'EN GRUPO · EXPERIENCIA COMBINADA',
		titlePre: 'Una práctica. ',
		scriptWord: 'Cometas',
		titlePost: ' Muchas formas de vivirla.',
		text: 'Sesiones inmersivas que unen las tres disciplinas en una sola experiencia: soltar con la respiración, ordenar con la meditación y salir con un propósito claro.',
		cta: 'Descubrir Cometas →',
		steps: [
			{ label: 'RESPIRACIÓN', value: 'Breathwork' },
			{ label: 'ATENCIÓN', value: 'Meditación' },
			{ label: 'PROCESO', value: 'Coaching · Hipnoterapia' },
		],
		note: 'Próximas sesiones y formato · por confirmar',
	},
	surfBreath: {
		eyebrow: 'MAR ADENTRO · NUEVA PROPUESTA',
		title: 'Surf & Breath: respira en la orilla, coge tu ola.',
		subtitle:
			'Una experiencia que solo puede guiar una monitora de surf: preparar el cuerpo con la respiración y llevarla al agua.',
		imageCaption: 'Imagen de referencia · sustituir por fotografía',
		steps: [
			{ number: '01', title: 'En la arena.', text: 'Breathwork para activar y calmar el cuerpo.' },
			{ number: '02', title: 'En el agua.', text: 'Baño de olas guiado o iniciación al surf, a tu nivel.' },
			{ number: '03', title: 'Después de la ola.', text: 'Meditación breve para integrar lo vivido.' },
		],
		note: 'POR VALIDAR CON YOUR WAVE',
	},
	mission: {
		eyebrow: 'LO QUE NOS MUEVE',
		title: 'Más espacio para ser. Menos prisa por llegar.',
		text1:
			'Your Wave nace para acercar la respiración, la atención y el aprendizaje personal a la vida cotidiana. Sin un único camino ni una forma correcta de vivir la experiencia.',
		text2: 'El mar enseña a leer el momento, esperar, remar y soltar. Eso mismo trabajamos en cada sesión.',
		values: ['Escucha antes que exigencia', 'Claridad en cada paso', 'Respeto por tu propio ritmo'],
		imageCaption: 'Imagen de referencia · una pausa junto al mar',
	},
	founder: {
		eyebrow: 'DETRÁS DE YOUR WAVE',
		title: 'Hola, soy [Nombre].',
		portraitCaption: 'Sesión de fotos pendiente',
		text: 'Monitora de surf y facilitadora de breathwork, meditación y coaching. Aquí irá su historia: cómo el mar le enseñó a respirar y por qué creó Your Wave.',
		note: 'CONTENIDO PENDIENTE',
		cta: 'Conocer mi historia →',
	},
	courses: {
		eyebrow: 'CURSOS YOUR WAVE',
		title: 'Aprende. Explora. Hazlo tuyo.',
		viewAll: 'Ver todos los cursos →',
		intro: 'Programas con objetivos y temarios claros para seguir profundizando en tu práctica.',
		cards: [
			{
				badgeSample: 'Ejemplo',
				title: 'Explorar la respiración',
				text: 'Conocer la respiración como práctica de atención.',
				meta: 'Observación · Ritmo · Práctica guiada',
				price: 'Formato, duración y precio · por confirmar',
				cta: 'Ver programa →',
			},
			{
				badgeSample: 'Ejemplo',
				title: 'Iniciación a la meditación',
				text: 'Distintas formas de prestar atención y crear una rutina.',
				meta: 'Atención · Presencia · Rutina personal',
				price: 'Formato, duración y precio · por confirmar',
				cta: 'Ver programa →',
			},
			{
				badgeSample: 'Ejemplo',
				title: 'Un camino hacia ti',
				text: 'Un espacio de reflexión y aprendizaje personal.',
				meta: 'Escucha · Reflexión · Integración',
				price: 'Formato, duración y precio · por confirmar',
				cta: 'Ver programa →',
			},
		],
	},
	community: {
		eyebrow: 'COMUNIDAD · LA TRIBU',
		title: 'Tu camino también puede ser compartido.',
		text: 'Un espacio para la tribu Your Wave: seguir aprendiendo, compartir lo vivido y encontrar nuevas formas de conectar.',
		points: [
			{ title: 'Recursos', text: 'Prácticas y audios para acompañar tu día.' },
			{ title: 'Parte de olas', text: 'Novedades y próximas sesiones, en tu correo.' },
			{ title: 'Encuentros', text: 'Quedadas en la playa para practicar juntos.' },
		],
		meta: 'Acceso y encuentros · por confirmar',
		cta: 'Únete a la tribu',
		pendingNote: 'Enlace a la comunidad de WhatsApp · pendiente',
		imageCaption: 'Imagen de referencia · no representa a miembros reales',
	},
	testimonials: {
		eyebrow: 'EXPERIENCIAS COMPARTIDAS',
		title: 'Después de la ola.',
		items: [
			{
				quote: 'Testimonio real de una participante sobre cómo se sintió después de la sesión.',
				name: 'Nombre real',
				detail: 'Sesión 1 a 1 · pendiente',
			},
			{
				quote: 'Testimonio real sobre una experiencia Cometa o Surf & Breath.',
				name: 'Nombre real',
				detail: 'Cometa · pendiente',
			},
			{
				quote: 'Testimonio real de alguien que ha hecho uno de los cursos.',
				name: 'Nombre real',
				detail: 'Curso · pendiente',
			},
		],
		note: 'Solo voces reales, con nombre, foto y consentimiento.',
	},
	faq: {
		eyebrow: 'ANTES DE EMPEZAR',
		title: 'Un poco más de claridad.',
		intro: 'Las preguntas que suelen surgir antes de reservar.',
		items: [
			{
				question: '¿Por dónde puedo empezar?',
				answer:
					'Con una sesión 1 a 1, una práctica en grupo o un curso. Si dudas, escríbenos y te ayudamos a elegir. Canal de contacto: WhatsApp.',
			},
			{ question: '¿Necesito experiencia previa o saber surfear?', answer: 'Contenido pendiente de redacción.' },
			{ question: '¿Qué son las experiencias Cometas?', answer: 'Contenido pendiente de redacción.' },
			{ question: '¿Cómo reservo y puedo cambiar la fecha?', answer: 'Contenido pendiente de redacción.' },
			{ question: '¿Dónde se realizan y cuánto cuestan?', answer: 'Contenido pendiente de redacción.' },
		],
		firstAnswerPrefix: 'Con una sesión 1 a 1, una práctica en grupo o un curso. Si dudas, ',
		firstAnswerLink: 'escríbenos',
		firstAnswerSuffix: ' y te ayudamos a elegir. Canal de contacto: WhatsApp.',
	},
	finalCta: {
		eyebrow: 'TU SIGUIENTE PASO',
		title: 'Tu próxima ola empieza con una respiración.',
		text: 'Elige tu sesión. Consulta disponibilidad. Confirma tu plaza.',
		ctaPrimary: 'Reserva tu sesión',
		ctaSecondary: 'Ver cursos',
		note: 'Agenda y condiciones de reserva · por confirmar',
	},
	footer: {
		taglinePre: 'Encuentra ',
		scriptWord: 'tu ola',
		small: 'Breathwork, meditación y coaching junto al mar.',
		exploreLabel: 'Explorar',
		explore: [
			{ label: 'Sesiones 1 a 1', href: '#sesiones' },
			{ label: 'Sesiones grupales', href: '#sesiones' },
			{ label: 'Cometas', href: '#cometas' },
			{ label: 'Surf & Breath', href: '#surf-breath' },
			{ label: 'Cursos Your Wave', href: '#cursos' },
		],
		brandLabel: 'Your Wave',
		sobreMi: 'Sobre mí',
		comunidad: 'Comunidad',
		faqLabel: 'Preguntas frecuentes',
		contacto: 'Contacto',
		talkLabel: 'Hablemos',
		emailPending: 'Correo · por confirmar',
		whatsappLabel: 'WhatsApp',
		instagramPending: 'Instagram · por confirmar',
		copyright: '© 2026 Your Wave',
		privacy: 'Privacidad',
		terms: 'Términos',
		notice: 'Aviso legal',
		cookies: 'Cookies',
	},
};
```

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors (neither file is imported by a page
yet, so this just confirms both compile as valid TypeScript matching the
`HomeContent` interface under `tsconfig.json`'s `astro/tsconfigs/strict`).

- [ ] **Step 4: Commit**

```bash
git add src/content/home/types.ts src/content/home/es.ts
git commit -m "Add HomeContent type and Spanish content dictionary"
```

---

## Task 6: English content dictionary

**Files:**
- Create: `src/content/home/en.ts`

**Interfaces:**
- Consumes: `HomeContent` from `src/content/home/types.ts` (Task 5).
- Produces: `export const en: HomeContent`, consumed by `src/pages/en/index.astro` (Task 10).

- [ ] **Step 1: Write `src/content/home/en.ts`**

This is a direct translation of `es.ts` — same structure, same meaning,
same placeholder markers, same voice (direct, calm, no exclamation marks).
Brand/product names that are proper nouns stay untranslated: "Your Wave",
"World Awaken Vision Experience", "Cometas", "Surf & Breath".

```ts
import type { HomeContent } from './types';

export const en: HomeContent = {
	meta: {
		title: 'Your Wave — Breathwork, meditation and coaching by the sea',
		description:
			'Breathwork, meditation and coaching sessions — one to one, in a group and on the beach — guided by a surf instructor. Book via WhatsApp.',
	},
	nav: {
		sesiones: 'Sessions',
		cometas: 'Cometas',
		cursos: 'Courses',
		comunidad: 'Community',
		sobreMi: 'About me',
		reserve: 'Book your session',
		switchLabel: 'ES',
	},
	whatsapp: {
		reserve: "Hi, I'd like to book a session at Your Wave.",
		reserve1a1: "Hi, I'd like to book a 1-to-1 session.",
		faqHelp: "Hi, I have some questions about getting started at Your Wave.",
		footerInfo: "Hi, I'd like more information about Your Wave.",
		footerContact: "Hi, I'd like to get in touch with Your Wave.",
	},
	badges: {
		breathwork: 'Breathwork',
		meditacion: 'Meditation',
		coaching: 'Coaching · Hypnotherapy',
		surf: 'Surf',
		sample: 'Sample',
	},
	hero: {
		eyebrow: 'BREATHWORK · MEDITATION · COACHING',
		h1: 'Breathe, let go and return to your centre.',
		subtitle:
			'Breathwork, meditation and coaching sessions to slow down and listen to yourself. One to one, in a group, on the beach, or at your own pace. Like the sea: one wave at a time.',
		ctaPrimary: 'Book your session',
		ctaSecondary: 'View courses',
		trust: '1-to-1 Sessions · Group sessions · Surf & Breath · Courses',
		imageCaption: 'Reference image · to be replaced with real photography',
		scriptPre: 'Find ',
		scriptWord: 'your wave',
		scriptPost: '',
	},
	social: {
		eyebrow: 'TRUST WE’RE BUILDING',
		stat1Value: '+000',
		stat1Label: 'people supported · real figure pending',
		stat2Value: '0.0 ★',
		stat2Label: 'Google rating · pending',
		quote: 'A real quote from a participant will go here, with their name and permission.',
		quoteNote: 'Short testimonial · content pending',
	},
	benefits: [
		{ title: 'Time to listen to yourself', text: 'A space to notice how you feel, with no pressure.' },
		{
			title: 'Your own pace',
			text: 'Choose the format that matches your moment: like choosing which wave to catch.',
		},
		{
			title: 'Shared learning',
			text: 'Tools and practices to keep going, with others or on your own.',
		},
	],
	sessions: {
		eyebrow: 'FOUR WAYS TO START',
		title: 'Find your wave.',
		intro: "You don't need to have it all figured out. Choose a first experience that makes sense for you.",
		cards: [
			{
				title: '1-to-1 Sessions',
				description: 'Personalised support, focused on what you want to explore.',
				meta: 'By appointment, subject to availability',
				actionLabel: 'Book my session →',
			},
			{
				title: 'Group sessions',
				description: 'Share the practice. One discipline, or an experience that combines them all.',
				meta: 'Disciplines and Cometas',
				actionLabel: 'Explore sessions →',
			},
			{
				title: 'Your Wave Courses',
				description: 'Programmes with clear goals to keep deepening your practice, step by step.',
				meta: 'Syllabus, goals and enrolment',
				actionLabel: 'View courses →',
			},
			{
				title: 'Community',
				description: 'A meeting point to share resources, news and experiences with the tribe.',
				meta: 'Resources, events and connection',
				actionLabel: 'Meet the tribe →',
			},
		],
	},
	cometas: {
		eyebrow: 'GROUP · COMBINED EXPERIENCE',
		titlePre: 'One practice. ',
		scriptWord: 'Cometas',
		titlePost: ' Many ways to live it.',
		text: 'Immersive sessions that bring the three disciplines together in one experience: release through breath, find clarity through meditation, and leave with a clear intention.',
		cta: 'Discover Cometas →',
		steps: [
			{ label: 'BREATH', value: 'Breathwork' },
			{ label: 'ATTENTION', value: 'Meditation' },
			{ label: 'PROCESS', value: 'Coaching · Hypnotherapy' },
		],
		note: 'Upcoming sessions and format · to be confirmed',
	},
	surfBreath: {
		eyebrow: 'INTO THE SEA · NEW PROPOSAL',
		title: 'Surf & Breath: breathe on the shore, catch your wave.',
		subtitle:
			'An experience only a surf instructor can guide: preparing the body with breath, then taking it into the water.',
		imageCaption: 'Reference image · to be replaced with real photography',
		steps: [
			{ number: '01', title: 'On the sand.', text: 'Breathwork to activate and calm the body.' },
			{ number: '02', title: 'In the water.', text: 'Guided wave bathing or surf introduction, at your level.' },
			{ number: '03', title: 'After the wave.', text: 'Short meditation to integrate the experience.' },
		],
		note: 'TO BE CONFIRMED WITH YOUR WAVE',
	},
	mission: {
		eyebrow: 'WHAT MOVES US',
		title: 'More space to be. Less rush to arrive.',
		text1:
			"Your Wave was born to bring breath, attention and personal learning into everyday life. There's no single path, no one right way to live the experience.",
		text2:
			"The sea teaches us to read the moment, wait, paddle and let go. That's exactly what we work on in every session.",
		values: ['Listening before demands', 'Clarity at every step', 'Respect for your own pace'],
		imageCaption: 'Reference image · a pause by the sea',
	},
	founder: {
		eyebrow: 'BEHIND YOUR WAVE',
		title: "Hi, I'm [Name].",
		portraitCaption: 'Photo shoot pending',
		text: "Surf instructor and breathwork, meditation and coaching facilitator. Her story goes here: how the sea taught her to breathe, and why she created Your Wave.",
		note: 'CONTENT PENDING',
		cta: 'Read my story →',
	},
	courses: {
		eyebrow: 'YOUR WAVE COURSES',
		title: 'Learn. Explore. Make it yours.',
		viewAll: 'View all courses →',
		intro: 'Programmes with clear goals and syllabuses to keep deepening your practice.',
		cards: [
			{
				badgeSample: 'Sample',
				title: 'Exploring the breath',
				text: 'Getting to know breath as a practice of attention.',
				meta: 'Observation · Pace · Guided practice',
				price: 'Format, duration and price · to be confirmed',
				cta: 'View programme →',
			},
			{
				badgeSample: 'Sample',
				title: 'Introduction to meditation',
				text: 'Different ways of paying attention and building a routine.',
				meta: 'Attention · Presence · Personal routine',
				price: 'Format, duration and price · to be confirmed',
				cta: 'View programme →',
			},
			{
				badgeSample: 'Sample',
				title: 'A path to yourself',
				text: 'A space for reflection and personal learning.',
				meta: 'Listening · Reflection · Integration',
				price: 'Format, duration and price · to be confirmed',
				cta: 'View programme →',
			},
		],
	},
	community: {
		eyebrow: 'COMMUNITY · THE TRIBE',
		title: 'Your path can be shared too.',
		text: "A space for the Your Wave tribe: keep learning, share your experience and find new ways to connect.",
		points: [
			{ title: 'Resources', text: 'Practices and audio to accompany your day.' },
			{ title: 'Wave report', text: 'News and upcoming sessions, sent your way.' },
			{ title: 'Meetups', text: 'Beach get-togethers to practise together.' },
		],
		meta: 'Access and meetups · to be confirmed',
		cta: 'Join the tribe',
		pendingNote: 'WhatsApp community link · pending',
		imageCaption: 'Reference image · does not represent real members',
	},
	testimonials: {
		eyebrow: 'SHARED EXPERIENCES',
		title: 'After the wave.',
		items: [
			{
				quote: 'A real quote from a participant about how they felt after the session.',
				name: 'Real name',
				detail: '1-to-1 session · pending',
			},
			{
				quote: 'A real quote about a Cometa or Surf & Breath experience.',
				name: 'Real name',
				detail: 'Cometa · pending',
			},
			{
				quote: "A real quote from someone who's taken one of the courses.",
				name: 'Real name',
				detail: 'Course · pending',
			},
		],
		note: 'Real voices only, with name, photo and consent.',
	},
	faq: {
		eyebrow: 'BEFORE YOU START',
		title: 'A little more clarity.',
		intro: 'The questions that usually come up before booking.',
		items: [
			{
				question: 'Where can I start?',
				answer:
					"With a 1-to-1 session, a group practice or a course. If you're unsure, message us and we'll help you choose. Contact channel: WhatsApp.",
			},
			{ question: 'Do I need previous experience or know how to surf?', answer: 'Content pending.' },
			{ question: 'What are the Cometas experiences?', answer: 'Content pending.' },
			{ question: 'How do I book, and can I change the date?', answer: 'Content pending.' },
			{ question: 'Where do sessions take place and how much do they cost?', answer: 'Content pending.' },
		],
		firstAnswerPrefix: "With a 1-to-1 session, a group practice or a course. If you're unsure, ",
		firstAnswerLink: 'message us',
		firstAnswerSuffix: " and we'll help you choose. Contact channel: WhatsApp.",
	},
	finalCta: {
		eyebrow: 'YOUR NEXT STEP',
		title: 'Your next wave starts with a breath.',
		text: 'Choose your session. Check availability. Confirm your spot.',
		ctaPrimary: 'Book your session',
		ctaSecondary: 'View courses',
		note: 'Booking schedule and conditions · to be confirmed',
	},
	footer: {
		taglinePre: 'Find ',
		scriptWord: 'your wave',
		small: 'Breathwork, meditation and coaching by the sea.',
		exploreLabel: 'Explore',
		explore: [
			{ label: '1-to-1 Sessions', href: '#sesiones' },
			{ label: 'Group sessions', href: '#sesiones' },
			{ label: 'Cometas', href: '#cometas' },
			{ label: 'Surf & Breath', href: '#surf-breath' },
			{ label: 'Your Wave Courses', href: '#cursos' },
		],
		brandLabel: 'Your Wave',
		sobreMi: 'About me',
		comunidad: 'Community',
		faqLabel: 'FAQ',
		contacto: 'Contact',
		talkLabel: "Let's talk",
		emailPending: 'Email · to be confirmed',
		whatsappLabel: 'WhatsApp',
		instagramPending: 'Instagram · to be confirmed',
		copyright: '© 2026 Your Wave',
		privacy: 'Privacy',
		terms: 'Terms',
		notice: 'Legal notice',
		cookies: 'Cookies',
	},
};
```

- [ ] **Step 2: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors. This is the Review Focus check for
content drift: if `en.ts` were missing a field, or had a field of the wrong
shape (e.g. a string where `cometas.steps` expects an array of objects),
TypeScript's structural check against `HomeContent` fails and `astro build`
reports the error with the exact missing/mismatched field.

- [ ] **Step 3: Commit**

```bash
git add src/content/home/en.ts
git commit -m "Add English content dictionary"
```

---

## Task 7: HomePage.astro — Header, Hero, Prueba social, Beneficios, Encuentra tu ola, Cometas

**Files:**
- Create: `src/components/HomePage.astro`

**Interfaces:**
- Consumes: `Button`, `Badge`, `SessionCard`, `WaveDivider` (Tasks 3-4),
  `whatsappLink` (Task 1), `HomeContent` type (Task 5), `getRelativeLocaleUrl`
  from `astro:i18n`.
- Produces: `HomePage` component — props `lang: 'es' | 'en'`, `content:
  HomeContent`. Consumed by `src/pages/index.astro` and
  `src/pages/en/index.astro` in Task 10.

- [ ] **Step 1: Write the component shell, header, hero and prueba social**

```astro
---
import Layout from '../layouts/Layout.astro';
import Button from './Button.astro';
import Badge from './Badge.astro';
import SessionCard from './SessionCard.astro';
import WaveDivider from './WaveDivider.astro';
import { whatsappLink } from '../config/contact';
import type { HomeContent } from '../content/home/types';
import { getRelativeLocaleUrl } from 'astro:i18n';

export interface Props {
	lang: 'es' | 'en';
	content: HomeContent;
}

const { lang, content: c } = Astro.props;
const otherLocale = lang === 'es' ? 'en' : 'es';
const switchHref = getRelativeLocaleUrl(otherLocale, '/');

const sessionHrefs = [whatsappLink(c.whatsapp.reserve1a1), '#cometas', '#cursos', '#comunidad'];
---

<Layout title={c.meta.title} description={c.meta.description} lang={lang} extraGraph={[]}>
	<header id="top" class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
		<div class="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
			<a href="#top" class="shrink-0">
				<img src="/logos/yourwave-logotipo.svg" alt="Your Wave" class="h-10 w-auto md:h-12" />
			</a>
			<div class="flex items-center gap-3">
				<a
					href={switchHref}
					class="yw-small shrink-0 rounded-pill border border-line px-3 py-1 text-ink hover:border-ink"
					hreflang={otherLocale}
				>
					{c.nav.switchLabel}
				</a>
				<Button href={whatsappLink(c.whatsapp.reserve)} class="shrink-0">{c.nav.reserve}</Button>
			</div>
		</div>
		<nav
			class="mx-auto flex w-full max-w-[1200px] gap-6 overflow-x-auto px-4 pb-3 md:justify-center md:px-6"
			aria-label="Principal"
		>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#sesiones">{c.nav.sesiones}</a>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#cometas">{c.nav.cometas}</a>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#cursos">{c.nav.cursos}</a>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#comunidad">{c.nav.comunidad}</a>
			<a class="yw-body whitespace-nowrap text-ink hover:text-link" href="#sobre-mi">{c.nav.sobreMi}</a>
		</nav>
	</header>

	<main>
		<section class="bg-surface">
			<div class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24">
				<div>
					<p class="yw-eyebrow text-ink-muted">{c.hero.eyebrow}</p>
					<h1 class="yw-display-xl mt-4 text-ink">{c.hero.h1}</h1>
					<p class="yw-body-lg mt-6 max-w-[48ch] text-ink-muted">{c.hero.subtitle}</p>
					<div class="mt-8 flex flex-wrap gap-4">
						<Button size="lg" href={whatsappLink(c.whatsapp.reserve)}>{c.hero.ctaPrimary}</Button>
						<Button variant="secondary" size="lg" href="#cursos">{c.hero.ctaSecondary}</Button>
					</div>
					<p class="yw-small mt-6 text-ink-muted">{c.hero.trust}</p>
				</div>
				<div class="relative">
					<div
						class="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-line bg-sand p-6 text-center"
						role="img"
						aria-label={c.hero.imageCaption}
					>
						<p class="yw-small text-ink-muted">{c.hero.imageCaption}</p>
					</div>
					<p
						class="yw-body mt-4 text-center text-ink-muted md:absolute md:-bottom-6 md:left-6 md:mt-0 md:bg-surface md:px-3"
					>
						{c.hero.scriptPre}<span class="yw-script text-wave-ocean">{c.hero.scriptWord}</span>{c.hero.scriptPost}
					</p>
				</div>
			</div>
		</section>

		<WaveDivider from="var(--surface)" to="var(--sand)" />

		<section class="bg-sand">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<p class="yw-eyebrow text-ink-muted">{c.social.eyebrow}</p>
				<div class="mt-6 flex flex-wrap items-start gap-10">
					<div class="flex flex-wrap gap-10">
						<div>
							<p class="yw-heading-1 text-ink">{c.social.stat1Value}</p>
							<p class="yw-small text-ink-muted">{c.social.stat1Label}</p>
						</div>
						<div>
							<p class="yw-heading-1 text-ink">{c.social.stat2Value}</p>
							<p class="yw-small text-ink-muted">{c.social.stat2Label}</p>
						</div>
					</div>
					<div class="max-w-[48ch]">
						<p class="yw-quote-text text-ink" style="margin:0;">&ldquo;{c.social.quote}&rdquo;</p>
						<p class="yw-small mt-2 text-ink-muted">{c.social.quoteNote}</p>
					</div>
				</div>
			</div>
		</section>
```

Leave `extraGraph={[]}` for now — Task 9 replaces it with the real
`FAQPage`/`Service` data once that section exists.

- [ ] **Step 2: Add the beneficios, encuentra tu ola and cometas sections**

Insert immediately before `</main>` (there is no `</main>` yet in this file
— add it now as part of this step, since Task 8 will insert more content
before it):

```astro
		<section class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<div class="grid gap-8 md:grid-cols-3">
					{c.benefits.map((b) => (
						<div>
							<span class="yw-ray" aria-hidden="true"></span>
							<h3 class="yw-heading-3 mt-3 text-ink">{b.title}</h3>
							<p class="yw-body mt-2 text-ink-muted">{b.text}</p>
						</div>
					))}
				</div>
			</div>
		</section>

		<section id="sesiones" class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<p class="yw-eyebrow text-ink-muted">{c.sessions.eyebrow}</p>
				<h2 class="yw-heading-2 mt-4 text-ink">{c.sessions.title}</h2>
				<p class="yw-body mt-2 max-w-[60ch] text-ink-muted">{c.sessions.intro}</p>
				<div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{c.sessions.cards.map((card, i) => (
						<SessionCard
							title={card.title}
							description={card.description}
							meta={card.meta}
							actionLabel={card.actionLabel}
							href={sessionHrefs[i]}
						/>
					))}
				</div>
			</div>
		</section>

		<section id="cometas" class="bg-surface">
			<div
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24"
			>
				<div>
					<p class="yw-eyebrow text-ink-muted">{c.cometas.eyebrow}</p>
					<h2 class="yw-heading-2 mt-4 text-ink">
						{c.cometas.titlePre}<span class="yw-script text-wave-ocean">{c.cometas.scriptWord}</span>{c.cometas.titlePost}
					</h2>
					<div class="mt-4 flex flex-wrap gap-2">
						<Badge tone="breathwork">{c.badges.breathwork}</Badge>
						<Badge tone="meditacion">{c.badges.meditacion}</Badge>
						<Badge tone="coaching">{c.badges.coaching}</Badge>
					</div>
					<p class="yw-body mt-4 text-ink-muted">{c.cometas.text}</p>
					<div class="mt-6">
						<Button variant="ghost" href="#sesiones">{c.cometas.cta}</Button>
					</div>
				</div>
				<div class="rounded-lg bg-wave-indigo p-8 text-on-deep">
					<ul class="grid gap-4">
						{c.cometas.steps.map((step) => (
							<li>
								<p class="yw-eyebrow text-on-deep opacity-80">{step.label}</p>
								<p class="yw-heading-3 mt-1 text-on-deep">{step.value}</p>
							</li>
						))}
					</ul>
					<p class="yw-small mt-6 text-on-deep opacity-80">{c.cometas.note}</p>
				</div>
			</div>
		</section>
	</main>
</Layout>
```

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: `HomePage.astro` compiles with no errors. It isn't imported by
any page yet, so this only confirms the file itself is valid Astro/TS —
full rendering is verified once Task 10 wires up the page files.

- [ ] **Step 4: Commit**

```bash
git add src/components/HomePage.astro
git commit -m "Add HomePage component: header, hero, prueba social, beneficios, sesiones, cometas"
```

---

## Task 8: HomePage.astro — Surf & Breath, Misión, Fundadora, Cursos, Comunidad, Testimonios

**Files:**
- Modify: `src/components/HomePage.astro`

**Interfaces:**
- Consumes: `Testimonial` (new import this task), plus everything from Task 7.

- [ ] **Step 1: Add the import**

```astro
import Testimonial from './Testimonial.astro';
```

- [ ] **Step 2: Insert the six sections**

Remove the `</main>\n</Layout>` lines left by Task 7, insert this block, then
restore `</main>\n</Layout>` after it:

```astro
		<section id="surf-breath" class="bg-surface">
			<div
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24"
			>
				<div
					class="order-2 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-line bg-sand p-6 text-center md:order-1"
					role="img"
					aria-label={c.surfBreath.imageCaption}
				>
					<p class="yw-small text-ink-muted">{c.surfBreath.imageCaption}</p>
				</div>
				<div class="order-1 md:order-2">
					<p class="yw-eyebrow text-ink-muted">{c.surfBreath.eyebrow}</p>
					<h2 class="yw-heading-2 mt-4 text-ink">{c.surfBreath.title}</h2>
					<p class="yw-body mt-4 text-ink-muted">{c.surfBreath.subtitle}</p>
					<ol class="mt-6 grid gap-4">
						{c.surfBreath.steps.map((step) => (
							<li class="flex gap-4">
								<span class="yw-heading-3 text-wave-ocean">{step.number}</span>
								<div>
									<p class="yw-heading-3 text-ink">{step.title}</p>
									<p class="yw-body text-ink-muted">{step.text}</p>
								</div>
							</li>
						))}
					</ol>
					<div class="mt-6 flex flex-wrap items-center gap-3">
						<Badge tone="surf">{c.badges.surf}</Badge>
						<Badge tone="breathwork">{c.badges.breathwork}</Badge>
						<span class="yw-small text-ink-muted">{c.surfBreath.note}</span>
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
					<p class="yw-eyebrow text-ink-muted">{c.mission.eyebrow}</p>
					<h2 class="yw-heading-2 mt-4 text-ink">{c.mission.title}</h2>
					<p class="yw-body mt-4 text-ink-muted">{c.mission.text1}</p>
					<p class="yw-body mt-4 text-ink-muted">{c.mission.text2}</p>
					<ul class="yw-rays mt-6">
						{c.mission.values.map((v) => <li>{v}</li>)}
					</ul>
				</div>
				<div
					class="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-line bg-surface p-6 text-center"
					role="img"
					aria-label={c.mission.imageCaption}
				>
					<p class="yw-small text-ink-muted">{c.mission.imageCaption}</p>
				</div>
			</div>

			<div
				id="sobre-mi"
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 pb-12 md:grid-cols-[280px_1fr] md:items-center md:gap-12 md:px-6 md:pb-24"
			>
				<div
					class="flex aspect-[4/5] items-center justify-center rounded-lg border border-dashed border-line bg-surface p-6 text-center"
					role="img"
					aria-label={c.founder.portraitCaption}
				>
					<p class="yw-small text-ink-muted">{c.founder.portraitCaption}</p>
				</div>
				<div>
					<p class="yw-eyebrow text-ink-muted">{c.founder.eyebrow}</p>
					<h2 class="yw-heading-2 mt-4 text-ink">{c.founder.title}</h2>
					<p class="yw-body mt-4 text-ink-muted">{c.founder.text}</p>
					<p class="yw-small mt-2 text-ink-muted">{c.founder.note}</p>
					<div class="mt-6">
						<Button variant="ghost" href="#sobre-mi">{c.founder.cta}</Button>
					</div>
				</div>
			</div>
		</section>

		<section id="cursos" class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<div class="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p class="yw-eyebrow text-ink-muted">{c.courses.eyebrow}</p>
						<h2 class="yw-heading-2 mt-4 text-ink">{c.courses.title}</h2>
						<p class="yw-body mt-2 max-w-[60ch] text-ink-muted">{c.courses.intro}</p>
					</div>
					<Button variant="ghost" href="#cursos">{c.courses.viewAll}</Button>
				</div>
				<div class="mt-10 grid gap-6 md:grid-cols-3">
					{c.courses.cards.map((card, i) => {
						const discipline = (['breathwork', 'meditacion', 'coaching'] as const)[i];
						return (
							<article class="yw-card">
								<div class="yw-card-body">
									<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
										<Badge tone={discipline}>{c.badges[discipline]}</Badge>
										<Badge tone="neutral">{card.badgeSample}</Badge>
									</div>
									<h3 class="yw-card-title">{card.title}</h3>
									<p class="yw-card-text">{card.text}</p>
									<p class="yw-card-meta">{card.meta}</p>
								</div>
								<div class="yw-card-foot">
									<span class="yw-small text-ink-muted">{card.price}</span>
									<Button variant="ghost" href="#cursos">{card.cta}</Button>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>

		<section id="comunidad" class="bg-wave-indigo text-on-deep">
			<div
				class="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24"
			>
				<div>
					<p class="yw-eyebrow text-on-deep opacity-80">{c.community.eyebrow}</p>
					<h2 class="yw-heading-2 mt-4 text-on-deep">{c.community.title}</h2>
					<p class="yw-body mt-4 text-on-deep opacity-90">{c.community.text}</p>
					<ul class="mt-6 grid gap-4">
						{c.community.points.map((p) => (
							<li>
								<p class="yw-heading-3 text-on-deep">{p.title}</p>
								<p class="yw-body text-on-deep opacity-90">{p.text}</p>
							</li>
						))}
					</ul>
					<p class="yw-small mt-4 text-on-deep opacity-80">{c.community.meta}</p>
					<div class="mt-6 flex flex-wrap items-center gap-3">
						<Button variant="secondary" class="border-on-deep text-on-deep" href="#comunidad">
							{c.community.cta}
						</Button>
						<span class="yw-small text-on-deep opacity-80">{c.community.pendingNote}</span>
					</div>
				</div>
				<div
					class="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-on-deep/40 bg-wave-ocean/40 p-6 text-center"
					role="img"
					aria-label={c.community.imageCaption}
				>
					<p class="yw-small text-on-deep opacity-80">{c.community.imageCaption}</p>
				</div>
			</div>
		</section>

		<section class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<p class="yw-eyebrow text-ink-muted">{c.testimonials.eyebrow}</p>
				<h2 class="yw-heading-2 mt-4 text-ink">{c.testimonials.title}</h2>
				<div class="mt-10 grid gap-6 md:grid-cols-3">
					{c.testimonials.items.map((t) => (
						<Testimonial quote={t.quote} name={t.name} detail={t.detail} />
					))}
				</div>
				<p class="yw-small mt-6 text-ink-muted">{c.testimonials.note}</p>
			</div>
		</section>
	</main>
</Layout>
```

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/HomePage.astro
git commit -m "Add surf & breath, misión, fundadora, cursos, comunidad and testimonios sections"
```

---

## Task 9: HomePage.astro — FAQ, CTA final, Footer, and JSON-LD wiring

**Files:**
- Modify: `src/components/HomePage.astro`

**Interfaces:**
- Consumes: `FaqItem` (new import this task), plus everything from Tasks 7-8.
- Produces: the page's `faqJsonLd`/`serviceJsonLd` values, passed to
  `Layout`'s `extraGraph` prop (replacing the `[]` placeholder from Task 7).

- [ ] **Step 1: Add the import and the JSON-LD frontmatter logic**

Add the import, alongside the others:

```astro
import FaqItem from './FaqItem.astro';
```

In the frontmatter, after `const sessionHrefs = [...]`, add:

```astro
const serviceJsonLd = c.sessions.cards.map((card) => ({
	'@type': 'Service',
	name: card.title,
	description: card.description,
}));

const faqJsonLd = {
	'@type': 'FAQPage',
	mainEntity: c.faq.items.map((faq) => ({
		'@type': 'Question',
		name: faq.question,
		acceptedAnswer: { '@type': 'Answer', text: faq.answer },
	})),
};
```

- [ ] **Step 2: Pass `extraGraph` to `Layout`**

Change the opening `<Layout ...>` tag from Task 7:

```astro
<Layout title={c.meta.title} description={c.meta.description} lang={lang} extraGraph={[]}>
```

to:

```astro
<Layout title={c.meta.title} description={c.meta.description} lang={lang} extraGraph={[faqJsonLd, ...serviceJsonLd]}>
```

- [ ] **Step 3: Insert the FAQ and CTA-final sections, then the footer**

Remove the `</main>\n</Layout>` lines left by Task 8, insert this block
(FAQ and CTA final go inside `<main>`, the footer goes after `</main>`):

```astro
		<section id="faq" class="bg-surface">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 md:py-24">
				<p class="yw-eyebrow text-ink-muted">{c.faq.eyebrow}</p>
				<h2 class="yw-heading-2 mt-4 text-ink">{c.faq.title}</h2>
				<p class="yw-body mt-2 max-w-[60ch] text-ink-muted">{c.faq.intro}</p>
				<div class="mt-8 max-w-[640px]">
					{c.faq.items.map((faq, i) => (
						<FaqItem question={faq.question} defaultOpen={i === 0}>
							{i === 0 ? (
								<>
									{c.faq.firstAnswerPrefix}
									<a class="text-link underline" href={whatsappLink(c.whatsapp.faqHelp)}>
										{c.faq.firstAnswerLink}
									</a>
									{c.faq.firstAnswerSuffix}
								</>
							) : (
								faq.answer
							)}
						</FaqItem>
					))}
				</div>
			</div>
		</section>

		<WaveDivider from="var(--surface)" to="var(--wave-indigo)" />

		<section class="bg-wave-indigo text-on-deep">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-12 text-center md:px-6 md:py-24">
				<p class="yw-eyebrow text-on-deep opacity-80">{c.finalCta.eyebrow}</p>
				<h2 class="yw-heading-2 mt-4 text-on-deep">{c.finalCta.title}</h2>
				<p class="yw-body-lg mt-4 text-on-deep opacity-90">{c.finalCta.text}</p>
				<div class="mt-8 flex flex-wrap justify-center gap-4">
					<Button size="lg" href={whatsappLink(c.whatsapp.reserve)}>{c.finalCta.ctaPrimary}</Button>
					<Button variant="secondary" size="lg" class="border-on-deep text-on-deep" href="#cursos">
						{c.finalCta.ctaSecondary}
					</Button>
				</div>
				<p class="yw-small mt-4 text-on-deep opacity-80">{c.finalCta.note}</p>
			</div>
		</section>
	</main>

	<footer class="bg-wave-indigo text-on-deep">
		<div class="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-6 md:py-16">
			<div>
				<p class="yw-heading-3 text-on-deep">{c.footer.brandLabel}</p>
				<p class="yw-body mt-2 text-on-deep opacity-90">
					{c.footer.taglinePre}<span class="yw-script">{c.footer.scriptWord}</span>
				</p>
				<p class="yw-small mt-2 text-on-deep opacity-80">{c.footer.small}</p>
			</div>
			<nav aria-label={c.footer.exploreLabel}>
				<p class="yw-eyebrow text-on-deep opacity-80">{c.footer.exploreLabel}</p>
				<ul class="mt-4 grid gap-2">
					{c.footer.explore.map((item) => (
						<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href={item.href}>{item.label}</a></li>
					))}
				</ul>
			</nav>
			<nav aria-label={c.footer.brandLabel}>
				<p class="yw-eyebrow text-on-deep opacity-80">{c.footer.brandLabel}</p>
				<ul class="mt-4 grid gap-2">
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#sobre-mi">{c.footer.sobreMi}</a></li>
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#comunidad">{c.footer.comunidad}</a></li>
					<li><a class="yw-body text-on-deep opacity-90 hover:opacity-100" href="#faq">{c.footer.faqLabel}</a></li>
					<li>
						<a class="yw-body text-on-deep opacity-90 hover:opacity-100" href={whatsappLink(c.whatsapp.footerContact)}>
							{c.footer.contacto}
						</a>
					</li>
				</ul>
			</nav>
			<div>
				<p class="yw-eyebrow text-on-deep opacity-80">{c.footer.talkLabel}</p>
				<ul class="mt-4 grid gap-2">
					<li class="yw-body text-on-deep opacity-90">{c.footer.emailPending}</li>
					<li>
						<a class="yw-body text-on-deep opacity-90 hover:opacity-100" href={whatsappLink(c.whatsapp.footerInfo)}>
							{c.footer.whatsappLabel}
						</a>
					</li>
					<li class="yw-body text-on-deep opacity-90">{c.footer.instagramPending}</li>
				</ul>
			</div>
		</div>
		<div class="border-t border-on-deep/20">
			<div class="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-6">
				<p class="yw-small text-on-deep opacity-80">{c.footer.copyright}</p>
				<ul class="flex flex-wrap gap-4">
					<li><a class="yw-small text-on-deep opacity-80 hover:opacity-100" href="#">{c.footer.privacy}</a></li>
					<li><a class="yw-small text-on-deep opacity-80 hover:opacity-100" href="#">{c.footer.terms}</a></li>
					<li><a class="yw-small text-on-deep opacity-80 hover:opacity-100" href="#">{c.footer.notice}</a></li>
					<li><a class="yw-small text-on-deep opacity-80 hover:opacity-100" href="#">{c.footer.cookies}</a></li>
				</ul>
			</div>
		</div>
	</footer>
</Layout>
```

- [ ] **Step 4: Verify the build succeeds**

```bash
npm run build
```

Expected: completes with no errors. `HomePage.astro` is now complete; it
still isn't imported by any page (that's Task 10).

- [ ] **Step 5: Commit**

```bash
git add src/components/HomePage.astro
git commit -m "Add FAQ, final CTA and footer to HomePage; wire FAQPage/Service JSON-LD"
```

---

## Task 10: Page entry files (ES/EN) and llms.txt

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder content)
- Create: `src/pages/en/index.astro`
- Create: `public/llms.txt`

**Interfaces:**
- Consumes: `HomePage` (Task 9), `es`/`en` content dictionaries (Tasks 5-6).

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
import HomePage from '../components/HomePage.astro';
import { es } from '../content/home/es';
---

<HomePage lang="es" content={es} />
```

- [ ] **Step 2: Create `src/pages/en/index.astro`**

```astro
---
import HomePage from '../../components/HomePage.astro';
import { en } from '../../content/home/en';
---

<HomePage lang="en" content={en} />
```

- [ ] **Step 3: Write `public/llms.txt`**

```
# Your Wave

Your Wave (World Awaken Vision Experience) offers breathwork, meditation
and coaching/hypnotherapy sessions guided by a surf instructor — one to
one, in groups, and on the beach (Surf & Breath). The brand moves like the
sea: calm on the shore, powerful in the wave. Available in Spanish
(https://yourwave.es/) and English (https://yourwave.es/en/).

## What it offers

- 1-to-1 sessions: personalised individual support.
- Group sessions: by discipline (breathwork, meditation, coaching) or
  combined in "Cometas".
- Surf & Breath: breathwork on the sand + guided surf/wave bathing +
  meditation.
- Your Wave Courses: programmes with clear syllabuses and goals.
- Community: a tribe that organises through a WhatsApp community.

## Contact

Booking and contact via WhatsApp: https://wa.me/34628757954

## Pages

- Home (Spanish): https://yourwave.es/
- Home (English): https://yourwave.es/en/
```

- [ ] **Step 4: Verify the build succeeds and both locales render**

```bash
npm run build
test -f dist/index.html && echo "ES ok"
test -f dist/en/index.html && echo "EN ok"
grep -c '<h1' dist/index.html
grep -c '<h1' dist/en/index.html
```

Expected: both `ES ok` and `EN ok` print, and each `grep -c` prints `1`
(exactly one `<h1>` per page).

- [ ] **Step 5: Verify locale-correct WhatsApp links**

```bash
grep -o 'wa%2Eme[^"]*\|wa\.me[^"]*' dist/index.html | head -1
grep -o 'wa%2Eme[^"]*\|wa\.me[^"]*' dist/en/index.html | head -1
```

Expected: the Spanish page's link decodes (percent-decode the `text=`
value) to a Spanish sentence ("Hola, quiero..."); the English page's link
decodes to an English sentence ("Hi, I'd like..."). This is the Review
Focus check for cross-language WhatsApp message leakage.

- [ ] **Step 6: Verify the FAQPage JSON-LD matches each locale's visible text**

```bash
grep -o '"@type":"FAQPage".*}]}' dist/index.html | head -c 400
grep -o '"@type":"FAQPage".*}]}' dist/en/index.html | head -c 400
```

Expected: the Spanish build's JSON-LD contains Spanish question/answer
text matching the five FAQ questions in `es.ts`; the English build's
contains the English text from `en.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro public/llms.txt
git commit -m "Wire ES/EN home pages to HomePage component; add llms.txt"
```

---

## Task 11: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full production build**

```bash
npm run build
```

Expected: completes with no errors. Open `dist/index.html` and
`dist/en/index.html` and spot-check each: one `<h1>`, `<link
rel="canonical">` pointing to the right locale URL, three `<link
rel="alternate" hreflang="...">` tags (`es`, `en`, `x-default`), and one
`application/ld+json` script containing `Organization`, `WebSite`,
`WebPage`, `FAQPage`, and four `Service` entries in its `@graph`, all in
that page's own language.

- [ ] **Step 2: Manual browser verification — both locales**

```bash
astro dev --background
```

Using Claude in Chrome (or any browser), open the dev server and check,
**for both `/` and `/en/`**:

- Desktop width (~1440px) and mobile width (~390px, matching the mockup
  breakpoints): no horizontal overflow, no overlapping text.
- An extra-narrow width (~360px): header, hero, and the 4-card and 3-card
  grids still fit without horizontal scroll — check this especially on the
  English page, since its labels run longer in places (e.g. "Your Wave
  Courses" vs "Cursos Your Wave").
- Click every header nav link and confirm it scrolls to the matching
  section.
- Click the `ES`/`EN` language switcher in the header and confirm it lands
  on the other locale's home page (not a 404).
- Click the first FAQ item closed, then open it again — `<details>` toggles
  with no JavaScript errors in the console.
- Inspect the "Únete a la tribu" / "Join the tribe" button in the Comunidad
  section: confirm its text and border render white (`on-deep`), not the
  default near-black `ink` — this confirms the Task 2 cascade-layer fix is
  working.
- Read the Comunidad, CTA final and footer sections against their
  `wave-indigo` background and confirm the `opacity-80`/`opacity-90` text is
  comfortably readable, not washed out.
- Check the browser console for 404s on both pages (there should be none —
  the two logo SVGs and the favicon are the only static assets referenced).

```bash
astro dev stop
```

- [ ] **Step 3: Report completion**

Once every check in Steps 1-2 passes for both locales, the home page is
complete per the spec. No commit needed for this step (verification only).

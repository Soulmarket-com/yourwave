// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.SITE_URL;

// https://astro.build/config
export default defineConfig({
  ...(siteUrl ? { site: siteUrl, integrations: [sitemap()] } : {}),
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()]
  }
});
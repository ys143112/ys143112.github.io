import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
import rehypeMedia from './src/lib/rehype-media.mjs';
import { unified } from '@astrojs/markdown-remark';

const settings = JSON.parse(readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8'));
const siteUrl = process.env.SITE_URL || settings.url;
const basePath = process.env.BASE_PATH ?? new URL(siteUrl).pathname;
export default defineConfig({
  site: siteUrl,
  base: basePath || '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/write/') && !page.endsWith('/404/') })],
  markdown: { shikiConfig: { theme: 'github-dark', wrap: true }, processor: unified({rehypePlugins: [[rehypeMedia,{base:basePath || '/'}]]}) },
});

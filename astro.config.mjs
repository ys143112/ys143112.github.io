import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
import { markdownPlugins } from './src/lib/markdown-plugins.mjs';
import { unified } from '@astrojs/markdown-remark';

const settings = JSON.parse(readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8'));
const siteUrl = process.env.SITE_URL || settings.url;
const basePath = process.env.BASE_PATH ?? new URL(siteUrl).pathname;
export default defineConfig({
  site: siteUrl,
  base: basePath || '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !/\/(?:write\/|404(?:\/|\.html))$/.test(page) })],
  markdown: { syntaxHighlight: false, processor: unified({rehypePlugins: markdownPlugins(basePath || '/')}) },
});

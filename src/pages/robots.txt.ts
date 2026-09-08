import type { APIContext } from 'astro';
import { path } from '../lib/posts';
export function GET(context: APIContext) { return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(path('sitemap-index.xml'), context.site)}\n`, {headers:{'Content-Type':'text/plain; charset=utf-8'}}); }

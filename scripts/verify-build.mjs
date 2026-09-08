import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import matter from 'gray-matter';
import { normalizeBase } from '../src/lib/content-policy.mjs';
import { inspectHtml } from '../src/lib/html-inspection.mjs';

const root = resolve('dist');
const settings=JSON.parse(await readFile('src/data/site.json','utf8'));
const base = normalizeBase(process.env.BASE_PATH ?? new URL(process.env.SITE_URL || settings.url).pathname);
const errors = [];
async function walk(dir) { const result = []; for(const entry of await readdir(dir,{withFileTypes:true})) { const path = join(dir,entry.name); if(entry.isDirectory()) result.push(...await walk(path)); else result.push(path); } return result; }
const built = await walk(root);
const html = built.filter(file=>file.endsWith('.html'));
const documents = new Map(await Promise.all(html.map(async file => [file, inspectHtml(await readFile(file, 'utf8'))])));
const origin = new URL(process.env.SITE_URL || settings.url).origin;
for(const file of html) {
  const document = documents.get(file);
  if(document.language !== 'ko') errors.push(`Missing Korean document language: ${file}`);
  const route = file.slice(root.length + 1).replaceAll('\\', '/').replace(/index\.html$/, '');
  const currentUrl = new URL(base + route, origin);
  for(const link of document.links) {
    let url, path;
    try { url = new URL(link.url, currentUrl); path = decodeURIComponent(url.pathname); }
    catch { errors.push(`Invalid URL in ${file}: ${link.url}`); continue; }
    if(url.origin !== origin) continue;
    if(!path.startsWith(base)) { errors.push(`Link misses base ${base}: ${link.url}`); continue; }
    const relative = path.slice(base.length);
    const target = resolve(root, relative, relative.endsWith('/') || !relative ? 'index.html' : '');
    if(!target.startsWith(root + '/') && !target.startsWith(root + '\\')) { errors.push(`Link escapes output: ${link.url}`); continue; }
    try { await access(target); } catch { errors.push(`Broken internal link in ${file}: ${link.url}`); continue; }
    if(link.anchor && url.hash && documents.has(target)) {
      let fragment;
      try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { fragment = url.hash.slice(1); }
      if(fragment && !documents.get(target).ids.has(fragment)) errors.push(`Missing anchor in ${file}: ${link.url}`);
    }
  }
}
const indexableText = (await Promise.all(built.filter(file=>/\.(html|xml)$/.test(file)).map(file=>readFile(file,'utf8')))).join('\n');
for(const name of (await readdir('src/content/posts')).filter(name=>name.endsWith('.md'))) {
  const { data } = matter(await readFile(join('src/content/posts',name),'utf8'));
  if(data.published) {
    try { await access(join(root,'posts',data.id,'index.html')); } catch { errors.push(`Published post missing: ${data.id}`); }
  } else {
    if(built.includes(join(root,'posts',data.id,'index.html')) || indexableText.includes(`/posts/${data.id}/`)) errors.push(`Draft leaked into output: ${data.id}`);
  }
}
if(errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Build verified: ${html.length} HTML pages, internal links, images, published posts and draft exclusion.`);

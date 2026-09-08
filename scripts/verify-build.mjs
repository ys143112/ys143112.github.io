import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import matter from 'gray-matter';
import { normalizeBase } from '../src/lib/content-policy.mjs';

const root = resolve('dist');
const settings=JSON.parse(await readFile('src/data/site.json','utf8'));
const base = normalizeBase(process.env.BASE_PATH ?? new URL(process.env.SITE_URL || settings.url).pathname);
const errors = [];
async function walk(dir) { const result = []; for(const entry of await readdir(dir,{withFileTypes:true})) { const path = join(dir,entry.name); if(entry.isDirectory()) result.push(...await walk(path)); else result.push(path); } return result; }
const built = await walk(root);
const html = built.filter(file=>file.endsWith('.html'));
for(const file of html) {
  const text = await readFile(file,'utf8');
  if(!text.includes('<html lang="ko"')) errors.push(`Missing Korean document language: ${file}`);
  for(const match of text.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const value = match[1].split('#')[0].split('?')[0];
    if(!value.startsWith('/')) continue;
    if(!value.startsWith(base)) { errors.push(`Link misses base ${base}: ${value}`); continue; }
    const path = decodeURIComponent(value.slice(base.length));
    const target = join(root,path, path.endsWith('/') || !path ? 'index.html' : '');
    try { await access(target); } catch { errors.push(`Broken internal link in ${file}: ${value}`); }
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

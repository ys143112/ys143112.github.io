import { readdir, readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import YAML from 'yaml';
import { validatePost } from '../src/lib/content-policy.mjs';

const directory = new URL('../src/content/posts/', import.meta.url);
const files = (await readdir(directory)).filter(file => file.endsWith('.md'));
const errors = [], ids = new Set();
const publicRoot = resolve('public');
for (const file of files) {
  try {
    const { data, content } = matter(await readFile(new URL(file, directory), 'utf8'));
    errors.push(...validatePost(data, content, file));
    if(ids.has(data.id)) errors.push(`${file}: 중복된 글 ID입니다.`);
    ids.add(data.id);
    const images = [...content.matchAll(/!\[[^\]]*\]\((\/uploads\/[^\s)]+)(?:\s+[^)]*)?\)/g)].map(match=>match[1]);
    if(data.cover) images.push(data.cover);
    for(const src of images) {
      const filePath = resolve(publicRoot, '.' + decodeURIComponent(src));
      if(!filePath.startsWith(publicRoot + '/') && !filePath.startsWith(publicRoot + '\\')) { errors.push(`${file}: 이미지 경로가 올바르지 않습니다.`); continue; }
      try { await access(filePath); } catch { errors.push(`${file}: 이미지 파일이 없습니다: ${src}`); }
    }
  } catch(error) { errors.push(`${file}: ${error.message}`); }
}
const cms = YAML.parse(await readFile('.pages.yml', 'utf8'));
if(!cms.content?.find(item=>item.name==='posts') || !cms.content?.find(item=>item.name==='site')) errors.push('CMS 컬렉션 설정을 확인해 주세요.');
const settings = JSON.parse(await readFile('src/data/site.json','utf8'));
for(const key of ['title','author','description','intro','bio','url','github','repository']) if(!settings[key]?.trim()) errors.push(`블로그 설정 ${key} 값이 필요합니다.`);
for(const key of ['url','github']) { try { if(new URL(settings[key]).protocol !== 'https:') throw new Error(); } catch { errors.push(`블로그 설정 ${key}는 https 주소여야 합니다.`); } }
if(!/^[\w.-]+\/[\w.-]+$/.test(settings.repository || '')) errors.push('저장소는 소유자/저장소이름 형식이어야 합니다.');
if(errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Content validated: ${files.length} posts; unique IDs, fields, image references, CMS configuration.`);

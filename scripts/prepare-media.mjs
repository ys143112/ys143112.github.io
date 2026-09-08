import { mkdir, readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import sharp from 'sharp';
import { optimizeMedia } from '../src/lib/optimize-media.mjs';

const uploadRoot = 'public/uploads', outputRoot = resolve('public/_media');
if (outputRoot !== join(resolve('public'), '_media')) throw new Error('Invalid generated media directory.');
await mkdir(outputRoot,{recursive:true});
const manifest = {}, retained = new Set();
async function collect(dir) {
  const results = [];
  let entries;
  try { entries = await readdir(dir,{withFileTypes:true}); }
  catch(error) { if(error.code === 'ENOENT') return results; throw error; }
  for(const entry of entries) { const file=join(dir,entry.name); if(entry.isDirectory()) results.push(...await collect(file)); else if(entry.isFile() && /\.(png|jpe?g|webp|avif|gif)$/i.test(file)) results.push(file); }
  return results;
}
for(const file of await collect(uploadRoot)) {
  const source = '/' + file.replaceAll('\\','/').replace(/^public\//,'');
  const buffer = await readFile(file);
  const meta = await sharp(buffer).metadata();
  if(!meta.width || !meta.height) throw new Error(`이미지 크기를 읽을 수 없습니다: ${source}`);
  if((meta.pages || 1) > 1 || extname(file).toLowerCase() === '.gif') { manifest[source]={src:source,width:meta.width,height:meta.pageHeight || meta.height}; continue; }
  manifest[source] = await optimizeMedia(buffer, outputRoot);
  for(const variant of manifest[source].variants) retained.add(variant.src.split('/').at(-1));
}
// Remove only obsolete generator output after all replacements succeed; preserve uploads.
for(const entry of await readdir(outputRoot,{withFileTypes:true})) {
  if(entry.isFile() && /^[a-f0-9]{16}-\d+\.webp$/.test(entry.name) && !retained.has(entry.name)) await unlink(join(outputRoot,entry.name));
}
await writeFile('src/data/media.generated.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Optimized ${Object.keys(manifest).length} images for responsive delivery.`);

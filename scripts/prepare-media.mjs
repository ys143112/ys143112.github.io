import { mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const uploadRoot = 'public/uploads', outputRoot = 'public/_media';
await mkdir(outputRoot,{recursive:true});
const manifest = {};
async function collect(dir) {
  const results = [];
  for(const entry of await readdir(dir,{withFileTypes:true})) { const file=join(dir,entry.name); if(entry.isDirectory()) results.push(...await collect(file)); else if(/\.(png|jpe?g|webp|avif|gif)$/i.test(file)) results.push(file); }
  return results;
}
for(const file of await collect(uploadRoot)) {
  const source = '/' + file.replaceAll('\\','/').replace(/^public\//,'');
  const buffer = await readFile(file);
  const meta = await sharp(buffer).metadata();
  if(!meta.width || !meta.height) throw new Error(`이미지 크기를 읽을 수 없습니다: ${source}`);
  if((meta.pages || 1) > 1 || extname(file).toLowerCase() === '.gif') { manifest[source]={src:source,width:meta.width,height:meta.height}; continue; }
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0,16);
  const width = Math.min(meta.width,1600), height = Math.round(meta.height * width/meta.width);
  const widths = [...new Set([Math.min(480,width),Math.min(960,width),width])];
  const variants = [];
  for(const size of widths) {
    const name = `${hash}-${size}.webp`;
    const target = join(outputRoot,name);
    try { await stat(target); } catch { await sharp(buffer).rotate().resize({width:size,withoutEnlargement:true}).webp({quality:82}).toFile(target); }
    variants.push({src:`/_media/${name}`,width:size});
  }
  manifest[source]={src:variants.at(-1).src,width,height,variants};
}
await writeFile('src/data/media.generated.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Optimized ${Object.keys(manifest).length} images for responsive delivery.`);

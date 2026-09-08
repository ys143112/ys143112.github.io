import { createHash } from 'node:crypto';
import { join } from 'node:path';
import sharp from 'sharp';

export async function optimizeMedia(buffer, outputRoot) {
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) throw new Error('이미지 크기를 읽을 수 없습니다.');
  const rotated = [5, 6, 7, 8].includes(meta.orientation);
  const sourceWidth = rotated ? meta.height : meta.width;
  const width = Math.min(sourceWidth, 1600);
  const hash = createHash('sha256').update('webp-q82-autorotate-v2').update(buffer).digest('hex').slice(0, 16);
  const variants = [];
  let largest;
  for (const size of [...new Set([Math.min(480, width), Math.min(960, width), width])]) {
    const name = `${hash}-${size}.webp`;
    const info = await sharp(buffer).rotate().resize({width: size, withoutEnlargement: true})
      .webp({quality: 82}).toFile(join(outputRoot, name));
    variants.push({src: `/_media/${name}`, width: info.width});
    largest = info;
  }
  return {src: variants.at(-1).src, width: largest.width, height: largest.height, variants};
}

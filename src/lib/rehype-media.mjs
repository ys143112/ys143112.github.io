import { readFileSync } from 'node:fs';
import { localPath } from './content-policy.mjs';
export default function rehypeMedia({base = '/'} = {}) {
  return function transformer(tree) {
    let media = {};
    try { media = JSON.parse(readFileSync(new URL('../data/media.generated.json',import.meta.url),'utf8')); } catch {}
    function visit(node) {
      if(node.type === 'element' && node.tagName === 'img') {
        const properties = node.properties || (node.properties = {});
        const image = media[properties.src];
        if(image) {
          properties.src = localPath(image.src,base); properties.width=image.width; properties.height=image.height;
          if(image.variants) properties.srcSet=image.variants.map(v=>`${localPath(v.src,base)} ${v.width}w`).join(', ');
          properties.sizes='(max-width: 700px) calc(100vw - 36px), 760px';
        } else if(typeof properties.src === 'string' && properties.src.startsWith('/')) properties.src = localPath(properties.src,base);
        properties.loading='lazy'; properties.decoding='async';
      }
      if(node.type === 'element' && node.tagName === 'a' && typeof node.properties?.href === 'string' && node.properties.href.startsWith('/')) node.properties.href=localPath(node.properties.href,base);
      for(const child of node.children || []) visit(child);
    }
    visit(tree);
  };
}

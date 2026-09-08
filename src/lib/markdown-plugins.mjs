import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { rehypeShiki } from '@astrojs/markdown-remark';
import rehypeMedia from './rehype-media.mjs';

function repairSanitizedAnchors() {
  return tree => {
    const elements = [];
    function visit(node) {
      if (node.type === 'element') elements.push(node);
      for (const child of node.children || []) visit(child);
    }
    visit(tree);
    const ids = new Set(elements.map(node => node.properties?.id).filter(Boolean));
    for (const node of elements) {
      const href = node.properties?.href;
      if (typeof href !== 'string' || !href.startsWith('#')) continue;
      let target;
      try { target = decodeURIComponent(href.slice(1)); } catch { continue; }
      if (!ids.has(target) && ids.has(`user-content-${target}`)) {
        node.properties.href = `#user-content-${target}`;
      }
    }
  };
}

export function markdownPlugins(base = '/') {
  // Parse and sanitize author HTML before the trusted syntax highlighter adds styles.
  // Keep the sanitizer's DOM-clobbering protection and repair GFM footnote links.
  return [rehypeRaw, rehypeSanitize, repairSanitizedAnchors,
    [rehypeShiki, { theme: 'github-dark', wrap: true }], [rehypeMedia, { base }]];
}

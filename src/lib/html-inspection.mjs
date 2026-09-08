import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
const parser = unified().use(rehypeParse);

export function inspectHtml(html) {
  const tree = parser.parse(html);
  const links = [], ids = new Set();
  let language;
  function visit(node) {
    if (node.type === 'element') {
      const p = node.properties || {};
      if (node.tagName === 'html') language = p.lang;
      if (p.id) ids.add(p.id);
      for (const attr of ['href', 'src']) {
        if (typeof p[attr] === 'string') links.push({url: p[attr], anchor: node.tagName === 'a'});
      }
      if (p.srcSet) for (const source of String(p.srcSet).split(',')) {
        links.push({url: source.trim().split(/\s+/)[0], anchor: false});
      }
    }
    for (const child of node.children || []) visit(child);
  }
  visit(tree);
  return {language, links, ids};
}

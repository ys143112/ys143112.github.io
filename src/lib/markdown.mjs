import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

const parser = unified().use(remarkParse).use(remarkGfm)
  .use(remarkRehype, {allowDangerousHtml: true}).use(rehypeRaw).use(rehypeSanitize);

export function analyzeMarkdown(markdown = '') {
  const tree = parser.runSync(parser.parse(markdown));
  const prose = [], searchable = [], images = [];
  let hasContent = false;
  function visit(node, inCodeBlock = false) {
    if (node.type === 'element' && node.tagName === 'pre') inCodeBlock = true;
    if (node.type === 'text') {
      if (!inCodeBlock) prose.push(node.value);
      searchable.push(node.value);
      if (node.value.trim()) hasContent = true;
    }
    if (node.type === 'element' && node.tagName === 'img') {
      const url = node.properties?.src;
      if (url) { images.push(url); hasContent = true; }
      if (node.properties?.alt) searchable.push(node.properties.alt);
    }
    for (const child of node.children || []) visit(child, inCodeBlock);
  }
  visit(tree);
  const normalize = values => values.join(' ').replace(/\s+/g, ' ').trim();
  return { text: normalize(prose), searchText: normalize(searchable), images, hasContent };
}

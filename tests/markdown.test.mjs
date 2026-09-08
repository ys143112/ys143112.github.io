import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { markdownPlugins } from '../src/lib/markdown-plugins.mjs';
import { analyzeMarkdown } from '../src/lib/markdown.mjs';
import { inspectHtml } from '../src/lib/html-inspection.mjs';

const renderer = await createMarkdownProcessor({syntaxHighlight: false, rehypePlugins: markdownPlugins()});

test('only rendered image references are validated, including reference-style Markdown', () => {
  const body = '```md\n![예시](/uploads/missing.png)\n```\n\n![작품][photo]\n\n[photo]: /uploads/real.png\n';
  assert.deepEqual(analyzeMarkdown(body).images, ['/uploads/real.png']);
  assert.equal(analyzeMarkdown(body).hasContent, true);
  assert.equal(analyzeMarkdown('~~~js\nprivate_example();\n~~~\n\n실제 설명').text, '실제 설명');
});

test('analysis follows rendered HTML, first link definitions, and referenced footnotes', () => {
  const html = analyzeMarkdown('<div><p>작업 설명</p><img src="/uploads/art.webp" alt="작품"></div>');
  assert.equal(html.hasContent, true);
  assert.equal(html.text, '작업 설명');
  assert.deepEqual(html.images, ['/uploads/art.webp']);
  assert.deepEqual(analyzeMarkdown('![작품][photo]\n\n[photo]: /uploads/first.webp\n[photo]: /uploads/missing.webp').images, ['/uploads/first.webp']);
  assert.equal(analyzeMarkdown('[^unused]: 보이지 않는 각주').hasContent, false);
  assert.equal(analyzeMarkdown('<script>실행 코드</script>').hasContent, false);
});

test('sanitization blocks executable HTML, including the comment/backtick bypass', async () => {
  const {code} = await renderer.render('본문\n\n<!-- ` --><script>attack()</script><!-- ` -->\n\n<a href="jav&#x61;script:attack()" style="color:red" onclick="attack()">링크</a><img src="/uploads/a.png" onerror="attack()">');
  assert.doesNotMatch(code, /<script|javascript:|onerror=|onclick=|style="color:red"|attack\(\)/i);
  assert.match(code, /본문/);
});

test('HTML code stays readable and highlighted without becoming an executable element', async () => {
  const {code} = await renderer.render('```html\n<script>alert(1)</script>\n```');
  assert.match(code, /astro-code/);
  assert.match(code, /style="color:/);
  assert.equal(code.replace(/<[^>]*>/g, '').replaceAll('&#x3C;', '<'), '<script>alert(1)</script>');
  assert.doesNotMatch(code, /<script>/);
});

test('duplicate Korean headings and footnotes point to existing rendered targets', async () => {
  const result = await renderer.render('## 같은 제목\n\n설명[^1]\n\n## 같은 제목\n\n[^1]: 참고 내용');
  const parsed = inspectHtml(result.code);
  assert.deepEqual(result.metadata.headings.slice(0,2).map(h=>h.slug), ['같은-제목','같은-제목-1']);
  for(const h of result.metadata.headings) assert.ok(parsed.ids.has(h.slug));
  for(const link of parsed.links.filter(link=>link.url.startsWith('#'))) assert.ok(parsed.ids.has(decodeURIComponent(link.url.slice(1))), link.url);
});

test('the link checker ignores code examples but detects real relative links and srcset', async () => {
  const {code} = await renderer.render('`href="/posts/example/"`\n\n[읽기](missing-page/)');
  assert.deepEqual(inspectHtml(code).links, [{url:'missing-page/', anchor:true}]);
  assert.deepEqual(inspectHtml('<img src="/a.webp" srcset="/a.webp 480w, /b.webp 960w">').links.map(link=>link.url), ['/a.webp','/a.webp','/b.webp']);
});

test('local images and links preserve the project base without rewriting external URLs', async () => {
  const projectRenderer = await createMarkdownProcessor({syntaxHighlight:false,rehypePlugins:markdownPlugins('/project/')});
  const {code} = await projectRenderer.render('![작품](/uploads/test.webp)\n\n[글](/blog/)\n\n![외부](//example.org/image.webp)');
  const urls = inspectHtml(code).links.map(link=>link.url);
  assert.ok(urls.includes('/project/uploads/test.webp'));
  assert.ok(urls.includes('/project/blog/'));
  assert.ok(urls.includes('//example.org/image.webp'));
});

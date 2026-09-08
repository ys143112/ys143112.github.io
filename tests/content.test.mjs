import test from 'node:test';
import assert from 'node:assert/strict';
import { stableSlug, validatePost, summary, localPath, isPublished } from '../src/lib/content-policy.mjs';
const data = { id:'stable-id', title:'제목', date:'2026-09-08', category:'개발 기록', published:true };
test('changing a title preserves the same permalink ID', () => { const edited = {...data,title:'새 제목'}; assert.equal(stableSlug(data.id),stableSlug(edited.id)); });
test('draft visibility requires explicit publication', () => { assert.equal(isPublished({}),false); assert.equal(isPublished({published:'true'}),false); assert.equal(isPublished({published:false}),false); assert.equal(isPublished(data),true); });
test('invalid and duplicate-path-like IDs cannot become routes',()=>{ for(const id of ['../secret','a/b','', 'a?x=1']) assert.throws(()=>stableSlug(id)); });
test('blank publication and missing cover descriptions are actionable errors',()=>{ assert.match(validatePost(data,'','post.md').join(' '),/본문/); assert.match(validatePost({...data,cover:'/uploads/a.png'},'내용','post.md').join(' '),/이미지 설명/); });
test('default descriptions use prose, omit code and image syntax',()=>{ assert.equal(summary('## 제목\n\n본문입니다.\n```js\nsecret_code();\n```\n![사진](/a.png)'),'제목 본문입니다.'); });
test('root and project Pages paths work without double prefixes',()=>{ assert.equal(localPath('/uploads/a.png','/'),'/uploads/a.png'); assert.equal(localPath('/uploads/a.png','/blog/'),'/blog/uploads/a.png'); assert.equal(localPath('/blog/uploads/a.png','/blog/'),'/blog/uploads/a.png'); });
test('external links are preserved',()=>assert.equal(localPath('https://example.org/a','/blog/'),'https://example.org/a'));
test('code and image articles are valid content; comments are not',()=>{
  for(const body of ['```js\nconsole.log(1);\n```','![작품](/uploads/art.webp)','설정은 onload=ready 입니다.']) assert.deepEqual(validatePost(data,body,'post.md'),[]);
  assert.match(validatePost(data,'<!-- unfinished -->','post.md').join(' '),/본문/);
});

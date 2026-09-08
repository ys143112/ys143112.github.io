import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import sharp from 'sharp';
import { optimizeMedia } from '../src/lib/optimize-media.mjs';

test('EXIF portrait dimensions and srcset match actual outputs without enlargement', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'form-to-code-media-'));
  t.after(async () => {
    const target = resolve(directory);
    assert.ok(target.startsWith(resolve(tmpdir()) + sep));
    assert.ok(target.split(sep).at(-1).startsWith('form-to-code-media-'));
    await rm(target, {recursive:true, force:true});
  });
  const buffer = await sharp({create:{width:1200,height:800,channels:3,background:'#234cec'}})
    .jpeg().withMetadata({orientation:6}).toBuffer();
  const result = await optimizeMedia(buffer, directory);
  assert.equal(result.width, 800);
  assert.equal(result.height, 1200);
  assert.deepEqual(result.variants.map(v=>v.width), [480,800]);
  for(const variant of result.variants) {
    const output = await sharp(await readFile(join(directory, variant.src.split('/').at(-1)))).metadata();
    assert.equal(output.width, variant.width);
    assert.equal(output.height, variant.width * 1.5);
    assert.equal(output.orientation, undefined);
  }
});

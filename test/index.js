import test from 'ava';
import isStream from 'is-stream';
import Vinyl from 'vinyl';

import puppy from '../';

test('puppy returns a promise that resolves to a readable stream', async t => {
  const src = await puppy();
  t.true(isStream.readable(src));
});

test('puppy stream sources vinyl files', async t => {
  const files = await puppy({
    pages: './test/fixture/src/pages/**/*',
    data: './test/fixture/src/data/**/*',
    stream: false,
  });
  const assertVinylFile = file => t.assert(file instanceof Vinyl);
  files.forEach(assertVinylFile);
});

test('vinyl files are annotated with puppy site and page data', async t => {
  const files = await puppy({
    pages: './test/fixture/src/pages/**/*',
    data: './test/fixture/src/data/**/*',
    stream: false,
  });
  const fileData = files.map(f => f.data).filter(f => !!f);
  t.snapshot(fileData);
});

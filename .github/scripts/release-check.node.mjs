import assert from 'node:assert/strict';
import { test } from 'node:test';
import { releaseStatus, releaseTag } from './release.mjs';

const sha = 'a'.repeat(40);
const pkg = { name: '@migma/mcp', version: '1.7.3' };
const metadata = { name: pkg.name, 'dist-tags': { latest: '1.7.2' }, versions: {
  '1.7.2': { name: pkg.name, version: '1.7.2', gitHead: sha },
} };
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
const tagOptions = { repository: 'MigmaAI/migma-mcp', sha, version: pkg.version, token: 'test-token' };

test('new stable version releases; scoped package request uses official registry', async () => {
  const result = await releaseStatus(pkg, async url => {
    assert.equal(url, 'https://registry.npmjs.org/%40migma%2Fmcp');
    return response(metadata);
  });
  assert.equal(result.publish, true);
});

test('published version skips and retains original commit for retry recovery', async () => {
  const result = await releaseStatus({ ...pkg, version: '1.7.2' }, async () => response(metadata));
  assert.equal(result.publish, false);
  assert.equal(result.published_sha, sha);
});

test('major and minor increments release', async () => {
  for (const version of ['1.8.0', '2.0.0']) {
    assert.equal((await releaseStatus({ ...pkg, version }, async () => response(metadata))).publish, true);
  }
});

test('unpublished older version cannot replace latest', async () => {
  await assert.rejects(releaseStatus({ ...pkg, version: '1.6.9' }, async () => response(metadata)), /greater than npm latest/);
});

test('invalid, prerelease, and private packages fail before network', async () => {
  const unexpected = () => { throw new Error('network must not run'); };
  for (const version of ['1.7.3-beta.1', '1.7.3\n', '01.7.3', '1.7', '1.7.3\ninjected=true']) {
    await assert.rejects(releaseStatus({ ...pkg, version }, unexpected), /stable major.minor.patch/);
  }
  await assert.rejects(releaseStatus({ ...pkg, private: true }, unexpected), /public npm package/);
});

test('registry errors never authorize publishing', async () => {
  for (const status of [401, 403, 404, 429, 500, 503]) {
    await assert.rejects(releaseStatus(pkg, async () => response({}, status)), /registry check failed/);
  }
  await assert.rejects(releaseStatus(pkg, async () => { throw new Error('network outage'); }), /network outage/);
});

test('malformed registry responses fail closed', async () => {
  for (const body of [{}, { ...metadata, name: 'other' }, { ...metadata, versions: [] }, { ...metadata, versions: 'invalid' }, { ...metadata, 'dist-tags': {} }]) {
    await assert.rejects(releaseStatus(pkg, async () => response(body)));
  }
  await assert.rejects(releaseStatus(pkg, async () => new Response('not JSON')));
});

test('invalid published metadata cannot produce release outputs', async () => {
  const version = '1.7.2';
  for (const published of [{}, { name: pkg.name, version, gitHead: 'bad\noutput=true' }]) {
    await assert.rejects(releaseStatus({ ...pkg, version }, async () => response({ ...metadata, versions: { [version]: published } })));
  }
});

test('tag preflight reads only; missing tag is allowed', async () => {
  await releaseTag(tagOptions, async (url, options) => {
    assert.match(url, /\/ref\/tags\/v1\.7\.3$/);
    assert.equal(options.method, undefined);
    return response({}, 404);
  });
});

test('matching existing tag is idempotent', async () => {
  await releaseTag({ ...tagOptions, create: true }, async () => response({ object: { type: 'commit', sha } }));
});

test('conflicting tag stops release and is never moved', async () => {
  await assert.rejects(releaseTag({ ...tagOptions, create: true }, async () => response({ object: { type: 'commit', sha: 'b'.repeat(40) } })), /will not be moved/);
});

test('annotated tag must resolve to tested commit', async () => {
  let count = 0;
  await releaseTag(tagOptions, async () => response({ object: count++ ? { type: 'commit', sha } : { type: 'tag', sha: 'b'.repeat(40) } }));
  assert.equal(count, 2);
});

test('successful publication can create missing tag for exact commit', async () => {
  let count = 0;
  await releaseTag({ ...tagOptions, create: true }, async (url, options) => {
    if (!count++) return response({}, 404);
    assert.match(url, /\/git\/refs$/);
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { ref: 'refs/tags/v1.7.3', sha });
    return response({}, 201);
  });
  assert.equal(count, 2);
});

test('GitHub permission errors and creation conflicts fail safely', async () => {
  await assert.rejects(releaseTag(tagOptions, async () => response({}, 403)), /tag check failed/);
  await assert.rejects(releaseTag({ ...tagOptions, create: true }, async (url, options) => response({}, options.method === 'POST' ? 422 : 404)), /tag creation failed/);
});

test('missing credentials and invalid refs fail before network', async () => {
  for (const override of [{ token: '' }, { sha: 'main' }, { sha: sha + '\n' }, { repository: '../other' }, { version: '1.7.3-rc.1' }]) {
    let calls = 0;
    await assert.rejects(releaseTag({ ...tagOptions, ...override }, () => { calls++; throw new Error('network must not run'); }));
    assert.equal(calls, 0);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { getV2Handler, listV2Handler } from '../lib/fuzzykey-handlers.js';

async function withKV(binding, run) {
  const previous = globalThis.FUZZYKEY;
  globalThis.FUZZYKEY = binding;
  try { await run(); } finally {
    if (previous === undefined) delete globalThis.FUZZYKEY;
    else globalThis.FUZZYKEY = previous;
  }
}

test('v2 read distinguishes missing, stored null, false, and zero', async () => {
  for (const [raw, exists, value] of [[null, false, null], ['null', true, null], ['false', true, false], ['0', true, 0]]) {
    await withKV({ get: async key => { assert.equal(key, 'scope/key'); return raw; } }, async () => {
      const response = await getV2Handler(new Request('https://fixture.example/v2/read?scope=scope&key=key'));
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { version: 2, key: 'scope/key', exists, value });
    });
  }
});

test('v2 list returns one bounded page and forwards opaque cursor', async () => {
  const calls = [];
  await withKV({ list: async options => {
    calls.push(options);
    return { keys: [], list_complete: false, cursor: 'opaque-next' };
  } }, async () => {
    const response = await listV2Handler(new Request('https://fixture.example/v2/list?scope=team&limit=25&cursor=opaque-in'));
    assert.deepEqual(await response.json(), {
      version: 2, scope: 'team', keys: [], listComplete: false, cursor: 'opaque-next',
    });
  });
  assert.deepEqual(calls, [{ prefix: 'team/', limit: 25, cursor: 'opaque-in' }]);
});

test('v2 validates selectors and list limits before KV access', async () => {
  let calls = 0;
  await withKV({ get: async () => calls++, list: async () => calls++ }, async () => {
    assert.equal((await getV2Handler(new Request('https://fixture.example/v2/read'))).status, 400);
    for (const limit of ['0', '1001', '1.5', 'nope']) {
      assert.equal((await listV2Handler(new Request(`https://fixture.example/v2/list?limit=${limit}`))).status, 400);
    }
  });
  assert.equal(calls, 0);
});

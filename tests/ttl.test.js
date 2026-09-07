import test from 'node:test';
import assert from 'node:assert/strict';
import { postHandler } from '../lib/fuzzykey-handlers.js';

const request = body => new Request('https://fixture.example/', {
  method: 'POST', body: JSON.stringify(body)
});

async function withKV(binding, run) {
  const previous = globalThis.FUZZYKEY;
  globalThis.FUZZYKEY = binding;
  try { await run(); } finally {
    if (previous === undefined) delete globalThis.FUZZYKEY;
    else globalThis.FUZZYKEY = previous;
  }
}

for (const [label, ttl, expected] of [['explicit', 3600, 3600], ['default', undefined, 28800], ['minimum', 60, 60]]) {
  test(`${label} TTL reaches the KV expiration option`, async () => {
    const calls = [];
    await withKV({ put: async (...args) => { calls.push(args); } }, async () => {
      const response = await postHandler(request({scope:'cache',key:'sample',value:{ok:true},ttl,metadata:{source:'test'}}));
      assert.equal(response.status, 200);
      const data = await response.json();
      assert.equal(data.status, true);
      assert.equal(data.details.ttl, expected);
    });
    assert.equal(calls.length, 1);
    const [key, value, options] = calls[0];
    assert.equal(key, 'cache/sample');
    assert.equal(value, '{"ok":true}');
    assert.equal(options.expirationTtl, expected);
    assert.equal(options.metadata.ttl, expected);
    assert.equal(options.metadata.source, 'test');
    assert.equal(typeof options.metadata.created, 'number');
  });
}

test('invalid TTL fails with an explicit error before any KV write', async () => {
  let writes = 0;
  await withKV({put:async()=>{writes++;}}, async()=>{
    for(const ttl of [null,0,-1,59,60.5,'60',true,{},[],Number.MAX_SAFE_INTEGER+1]) {
      const response = await postHandler(request({key:'sample',value:'data',ttl}));
      assert.equal(response.status,400,`ttl=${JSON.stringify(ttl)}`);
      const data = await response.json();
      assert.equal(data.status,false);
      assert.equal(data.code,'FUZZYKEY_INVALID_TTL');
    }
  });
  assert.equal(writes,0);
});

test('list requests do not validate or apply write TTL', async () => {
  await withKV({list:async()=>({keys:[],list_complete:true})},async()=>{
    const response = await postHandler(request({list:true,ttl:0}));
    assert.equal(response.status,200);
    assert.equal((await response.json()).status,true);
  });
});

test('a rejected KV write is an HTTP failure, not success',async()=>{
  await withKV({put:async()=>{throw new Error('fixture persistence failure');}},async()=>{
    const response=await postHandler(request({key:'sample',value:'data',ttl:60}));
    assert.equal(response.status,500);
    assert.equal((await response.json()).code,'FUZZYKEY_WRITE_FAILED');
  });
});

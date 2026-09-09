

import { corsHeaders } from './cors-handler.js'
// import { downloadFileBuf, handleSearchParams, handleAddFile, handleGetFile, handleListFile, handleDownloadFile, handleHashDownload } from './helpers.js'
// import { handleAirtable } from './airtable-handlers.js'
// import { getPresignedUrl } from './presign-handler.js'

// export const OPTIONS = (request) => {
// }






const listByScope = async (scope, listData) => {
  if(listData == null) listData = true

  let data = {}, list;
  if (scope)
    list = await FUZZYKEY.list({ prefix: scope });
  else
    list = await FUZZYKEY.list();

  if (listData) {
    for (const key of list.keys) {
      const result = await FUZZYKEY.get(key.name);
      let resultData
      try {
        resultData = JSON.parse(result)
      } catch (e) {
        resultData = result
      }
      data[key.name] = resultData
    }
  }

  const returnData = {
    status: true,
    scope: scope,
    list,
  }

  if (listData) returnData.data = data

  return new Response(JSON.stringify(returnData), {
    headers: corsHeaders
  });
};

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const decodeStoredValue = value => {
  try { return JSON.parse(value); } catch (_) { return value; }
};

export const getV2Handler = async request => {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    const key = searchParams.get('key');
    if (!key) return jsonResponse({ version: 2, code: 'FUZZYKEY_KEY_REQUIRED' }, 400);
    const namespaceKey = `${scope ? scope + '/' : ''}${key}`;
    const rawValue = await FUZZYKEY.get(namespaceKey);
    return jsonResponse({
      version: 2,
      key: namespaceKey,
      exists: rawValue !== null,
      value: rawValue === null ? null : decodeStoredValue(rawValue),
    });
  } catch (error) {
    console.error('[getV2Handler]', error);
    return jsonResponse({ version: 2, code: 'FUZZYKEY_READ_FAILED' }, 500);
  }
};

export const listV2Handler = async request => {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const limit = limitParam === null ? 1000 : Number(limitParam);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
      return jsonResponse({ version: 2, code: 'FUZZYKEY_INVALID_LIMIT' }, 400);
    }
    const options = { limit };
    if (scope) options.prefix = `${scope}/`;
    if (cursor) options.cursor = cursor;
    const page = await FUZZYKEY.list(options);
    return jsonResponse({
      version: 2,
      scope,
      keys: page.keys,
      listComplete: page.list_complete,
      ...(page.list_complete ? {} : { cursor: page.cursor }),
    });
  } catch (error) {
    console.error('[listV2Handler]', error);
    return jsonResponse({ version: 2, code: 'FUZZYKEY_LIST_FAILED' }, 500);
  }
};







export const getHandler = async (request) => {
  /* 
    - list all keys
    - get specific key by scope / key
  */
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);

    const list = params.get('list');
    const listData = params.get('listData');
    const scope = params.get('scope');
    const key = params.get('key');
    const metadata = params.get('metadata');

    // only do this if not a pure GET handler (e.g. via POST command)
    // let { scope, key, metadata } = JSON.parse(body)
    let namespaceKey = `${scope ? scope + '/' : ''}${key||''}`

    console.log('namespaceKey:', namespaceKey)
  
    let data;

    /* 
    
      ⛔️ important note: metadata==true means the payload is returned as {value: ...} but if it's false, it'll just returned the data itself
      we try to mirror this, but maybe we shouldn't as it's hella inconsistent and unexpeted
    
    */
    // listing all keys w/ scope
    if (list) {
      return listByScope(scope, listData)
    } else {
      console.log('getting data')
      // retrieving data
      if (metadata) {
        data = await FUZZYKEY.getWithMetadata(namespaceKey)
        // try { data = JSON.parse(data) } catch (e) { }
        try { data['value'] = JSON.parse(data?.value)} catch (e) {}
        console.log('&&&& w/ metadata; returning data object:', data)
        // delete data?.value // saves some data
        // data = { data }
      } else {
        data = await FUZZYKEY.get(namespaceKey)
        try { data = JSON.parse(data) } catch (e) { }
        // data = {data} // encapsulate so this shape looks like getWithMetadata's shape, for easier coding later
      }
      return new Response(JSON.stringify({
        status: data?.value ? true : false,
        key: namespaceKey,
        ...data
      }), {
        headers: corsHeaders
      })
    }

  } catch (e) {
    console.error('[getHandler]', e)
    return new Response(JSON.stringify(`Something went wrong with your request`), {
      headers: corsHeaders
    });
  }
}




export const postHandler = async (request) => {
  try {
    const body = await request.text();
    let { list, listData, scope, key, value, metadata, ttl = 3600 * 8 } = JSON.parse(body)
    let namespaceKey = `${scope ? scope + '/' : ''}${key||''}`
    // console.log('postHandler:', list, scope, key, value, metadata, ttl)

    // listing all keys w/ scope
    if (list) {
      return listByScope(scope, listData)

    } else {

      if (!Number.isSafeInteger(ttl) || ttl < 60) {
        return new Response(JSON.stringify({
          status: false,
          code: 'FUZZYKEY_INVALID_TTL',
          error: 'ttl must be an integer number of seconds greater than or equal to 60',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!key || !value) {
        return new Response(JSON.stringify(`POST needs a key and/or value`), {
          headers: corsHeaders
        });
      }
      if (typeof value !== 'string') {
        value = JSON.stringify(value)
      }

      if(!metadata) {
        metadata = {}
      }
      metadata['created'] = Date.now()

      await FUZZYKEY.put(namespaceKey, value, {
        expirationTtl: ttl,
        metadata: { ...metadata, ttl },
      });

      return new Response(JSON.stringify({
        status: true,
        details: { namespaceKey, scope, key, value, metadata, ttl },
      }), {
        headers: corsHeaders
      })
    }
  } catch(e) {
    console.error('[postHandler]', e)
    return new Response(JSON.stringify({
      status: false,
      code: 'FUZZYKEY_WRITE_FAILED',
      error: 'Fuzzykey could not complete the request',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}




export const deleteHandler = async (request) => {
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);
    const scope = params.get('scope');
    const key = params.get('key');

    let namespaceKey = `${scope ? scope + '/' : ''}${key||''}`

    if (!key) {
      return new Response(JSON.stringify(`DELETE needs a key`));
    }

    console.log('Deleting:', namespaceKey)

    await FUZZYKEY.delete(namespaceKey);

    return new Response(JSON.stringify({
      status: true,
    }), {
      headers: corsHeaders
    })
  } catch (e) {
    console.error('[deleteHandler]', e)
    return new Response('Something went wrong with your request')
  }
}
















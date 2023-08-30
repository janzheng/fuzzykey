

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

    // console.log('-----/>', listData)
  if (listData) {
    for (const key of list.keys) {
      const result = await FUZZYKEY.get(key.name);
      let resultData
      try {
        resultData = JSON.parse(result)
      } catch (e) { }
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

    // listing all keys w/ scope
    if (list) {
      return listByScope(scope, listData)
    } else {
      console.log('getting data')
      // retrieving data
      if (metadata) {
        data = await FUZZYKEY.getWithMetadata(namespaceKey)
        try { data.data = JSON.parse(data?.value)} catch (e) {}
        delete data?.value // saves some data
      } else {
        data = await FUZZYKEY.get(namespaceKey)
        try { data = JSON.parse(data) } catch (e) {}
        data = {data} // encapsulate so this shape looks like getWithMetadata's shape, for easier coding later
      }
      return new Response(JSON.stringify({
        status: data?.value || data ? true : false,
        namespace: namespaceKey,
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
    return new Response(JSON.stringify(`Something went wrong with your request`), {
      headers: corsHeaders
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

















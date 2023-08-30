
import { handleOptions, authorizeRequest } from './lib/cors-handler.js'
// import { downloadFileBuf } from './lib/helpers.js'
import { getHandler, postHandler, deleteHandler } from './lib/fuzzykey-handlers.js'


addEventListener('fetch', (event, env) => {
  try {
    event.respondWith(handleRequest(event.request))
  } catch(e) {
    console.error('[fetchListener error]:', e)
  }
})

async function handleRequest(request, env) {

  const url = new URL(request.url);
  let key = url.pathname.slice(1);

  if (!authorizeRequest(request, key)) {
    console.log('**** FORBIDDEN ****')
    return new Response('Forbidden', { status: 403 });
  }

  switch (request.method) {

    case 'OPTIONS':
      return handleOptions(request);
      
    case 'POST':
      return await postHandler(request);

    // case 'PUT':
      // return await putHandler(request, key);

    case 'GET':
      return getHandler(request);

    case 'DELETE':
      return await deleteHandler(request);

    default:
      console.log('**** Method not handled:', request.method)
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          Allow: 'PUT, GET, DELETE',
        },
      });
  }


  console.log('????')
}


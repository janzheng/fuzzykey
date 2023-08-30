# Fuzzykey

Fuzzykey is a Cloudflare worker that provides a simple interface for interacting with Cloudflare's Key-Value (KV) store. It allows you to list all keys and retrieve specific keys by scope or key.
Installation

You can install Fuzzykey using either npm or yarn:
```
npm install
# or
yarn install
```

## Configuration

Before you can use Fuzzykey, you need to configure it with your Cloudflare account details. Rename the wrangler.toml.example file to wrangler.toml and replace the placeholders with your actual account details.

```
name = "fuzzykey"
account_id = "ENTER_YOUR_ACCOUNT_ID_HERE"
workers_dev = true
main = "index.js"
compatibility_date = "2022-08-04"

kv_namespaces = [
  { binding = "FUZZYKEY", preview_id = "PREVIEW_KV_ID", id = "PROD_KV_ID"}
]
```

## Usage

Fuzzykey provides several npm scripts for development and deployment:

- dev: Starts the development server.
- preview: Previews your project.
- deploy: Deploys your project to Cloudflare.
- prod: Alias for deploy.

```
  "scripts": {
    "batcher": "node --experimental-json-modules batcher.js",
    "dev": "wrangler dev --remote",
    "devnote": "sometimes wrangler dev will fail for Buckets, and you have to do --remote. No idea why",
    "preview": "wrangler preview",
    "deploy": "wrangler deploy",
    "prod": "wrangler deploy",
    "commit": "git add . -A ; git commit ; git push origin main; ",
    "test": "echo \"Error: no test specified\" && exit 1",
    "format": "prettier --write '**/*.{js,css,json,md}'"
  },
  ```


For example, to start the development server, you would run:
```
npm run dev
# or
yarn dev
```

## API

Fuzzykey provides a simple HTTP API for interacting with the KV store. The following routes are available:

- GET /:key: Retrieves the value of the specified key.
- POST /:key: Sets the value of the specified key.
- DELETE /:key: Deletes the specified key.

```
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
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          Allow: 'PUT, GET, DELETE',
        },
      });
  }
  ```


## License

Fuzzykey is licensed under the MIT license.

```
Copyright (c) 2023 Jan Zheng <https://twitter.com/@yawnxyz>

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

```

## Contributing

Contributions to Fuzzykey are welcome. Please make sure to read the Contributing Guide before making a pull request.

Thank you to all the people who already contributed to Fuzzykey!
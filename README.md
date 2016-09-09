# static serve middlware for koa

[![Build Status](https://travis-ci.org/vicanso/koa-static-serve.svg?style=flat-square)](https://travis-ci.org/vicanso/koa-static-serve)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/koa-static-serve/master.svg?style=flat)](https://coveralls.io/r/vicanso/koa-static-serve?branch=master)
[![npm](http://img.shields.io/npm/v/koa-static-serve.svg?style=flat-square)](https://www.npmjs.org/package/koa-static-serve)
[![Github Releases](https://img.shields.io/npm/dm/koa-static-serve.svg?style=flat-square)](https://github.com/vicanso/koa-static-serve)

- `ETag` The module use weak etag, which is derived from last-modified time and file length. 

- `Last-Modified` File last-modified time.

## Installation

```bash
$ npm i koa-static-serve
```

## Examples
  
View the [./examples](examples) directory for working examples. 

## API

serve(staticPath, options)

```js
const Koa = require('koa');
const path = require('path');
const app = new Koa();
const serve = require('koa-static-serve');
const staticPath = path.join(__dirname, '..');
app.use(serve(staticPath, {
  maxAge: 3600,
  sMaxAge: 600,
  headers: {
    'X-Server': 'koa-static-serve',
  },
  dotfiles: 'allow',
  denyQuerystring: true,
  etag: false,
  lastModified: false,
  '404': 'next',
}));
const port = process.env.PORT || 10000;
app.listen(port);
console.dir('server listen on:' + port);
```

### staticPath `static file path`

### options

- `maxAge` Static file's http response header, Cache-Control max-age, default is 0.

- `sMaxAge` Static file's http response header, Cache-Control s-maxage for cache application(eg. varnish). If not set, it will be Math.min(3600, maxAge).

- `headers` The default header.

- `dotfiles` Dot file access permission, it can be 'allow', 'deny', 'ignore'. Default is 'ignore'.

- `denyQuerystring` Deny query string, default is `false`. If using a http cache server(varnish) for the static files, query string should be denied. Otherwise there will be different cache for the same file.

- `charset` Default content charset.

- `etag` Enable or disable etag generation, default is true.

- `lastModified` Set the Last-Modified header to the last modified date of the file on the OS, default is true.

- `404` Set not found handler. If set 'next', it will call next when not found, otherwise will throw an error (404).

## License

MIT

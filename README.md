# static serve middlware for koa

[![Build Status](https://travis-ci.org/vicanso/koa-static-serve.svg?style=flat-square)](https://travis-ci.org/vicanso/koa-static-serve)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/koa-static-serve/master.svg?style=flat)](https://coveralls.io/r/vicanso/koa-static-serve?branch=master)
[![npm](http://img.shields.io/npm/v/koa-static-serve.svg?style=flat-square)](https://www.npmjs.org/package/koa-static-serve)
[![Github Releases](https://img.shields.io/npm/dm/koa-static-serve.svg?style=flat-square)](https://github.com/vicanso/koa-static-serve)

- `ETag` The modules use weak etag, which is derived from last-modified time and file length. The version number is inserted in file name normally(eg. angular.1183712.js), so ETag can be disabled.

- `Last-Modified` As above.

## Installation

```bash
$ npm i koa-static-serve
```



## API

serve(staticPath, options)

```js
const Koa = require('koa');
const path = require('path');
const app = new Koa();
const serve = require('koa-static-serve');
const staticPath = path.join(__dirname, '..');
app.use(serve(staticPath, {
  maxAge : 600
}));
const port = process.env.PORT || 10000;
app.listen(port);
console.dir('server listen on:' + port);
```

### staticPath `static file path`

### options

- `maxAge` static file's http response header, Cache-Control max-age

- `sMaxAge` static file's http response header, Cache-Control s-maxage for cache application(eg. varnish)

- `headers` default header

- `dotfiles` dot file access permission, it can be 'allow', 'deny', 'ignore'. Default is 'ignore'

- `denyQuerystring` deny query string, default is `false`. If using a http cache server(varnish) for the static files, query string should be denied. 

- `charset` default content charset

- `disableEtag` disable etag header

- `disableLastModified` disable last-modified header

## License

MIT
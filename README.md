# static serve middlware for koa

```js
var koa = require('koa');
var path = require('path');
var app = koa();
var serve = require('koa-static-serve');
var staticPath = path.join(__dirname, '..');
app.use(serve(staticPath, {
  maxAge : 600
}));
var port = process.env.PORT || 10000;
app.listen(port);
console.dir('server listen on:' + port);
```
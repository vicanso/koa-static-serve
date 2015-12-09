# static serve middlware for koa

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
const Koa = require('koa');
const path = require('path');
const app = new Koa();
const serve = require('../lib/serve');
const staticPath = path.join(__dirname, '../assets');
app.use(serve(staticPath, {
  maxAge : 600
}));
const port = process.env.PORT || 10000;
app.listen(port);
console.info(`server listen on: http://0.0.0.0:${port}/index.html`);

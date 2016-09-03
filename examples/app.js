const Koa = require('koa');
const path = require('path');
const app = new Koa();
const serve = require('../lib/serve');
const staticPath = path.join(__dirname, '../assets');
app.use(serve(staticPath, {
  maxAge: 3600,
  sMaxAge: 600,
  headers: {
    'X-Server': 'koa-static-serve',
  },
  dotfiles: 'allow',
  denyQuerystring: true,
  disableETag: true,
  disableLastModified: true,
  '404': 'next',
}));
const port = process.env.PORT || 10000;
app.listen(port);
console.info(`server listen on: http://0.0.0.0:${port}/index.html`);

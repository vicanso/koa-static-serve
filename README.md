# static serve middlware for koa

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

- `headers` default header

- `dotfiles` dot file access permission, it can be 'allow', 'deny', 'ignore'. Default is 'ignore'

- `denyQuerystring` deny query string, default is false


## License

MIT
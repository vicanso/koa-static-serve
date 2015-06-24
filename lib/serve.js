'use strict';
const koaStatic = require('koa-static');
const moment = require('moment');
const util = require('util');
const path = require('path');
const url = require('url');
const debug = require('debug')('jt.koa-static-serve');

module.exports = serve;

function serve(staticPath, options) {
  debug('static path:%s, options:%j', staticPath, options);
  let handler = koaStatic(staticPath, {});
  options = options || {};
  let maxAge = options.maxAge;
  let mount = options.mount || '';
  let length = mount.length;
  let notFoundMaxAge = Math.min(maxAge, 300);
  return function *(next) {
    yield handler.call(this, next);
    let ctx = this;
    let file = path.join(staticPath, ctx.url);

    if (self.body) {
      let sMaxAge = Math.min(3600, maxAge);
      ctx.set({
        'Expires' : moment().add(maxAge, 'seconds').toString(),
        'Cache-Control' : util.format('public, max-age=%d, s-maxage=%d', maxAge, sMaxAge),
        'Vary' : 'Accept-Encoding'
      });
    } else {
      ctx.set({
        'Expires' : moment().add(notFoundMaxAge, 'seconds').toString(),
        'Cache-Control' : util.format('public, max-age=%d', notFoundMaxAge),
        'Vary' : 'Accept-Encoding'
      });
      ctx.throw(404);
    }
  }
}

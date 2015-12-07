'use strict';
const koaStatic = require('koa-static');
const moment = require('moment');
const util = require('util');
const path = require('path');
const url = require('url');
const debug = require('debug')('jt.koa-static-serve');

module.exports = serve;

/**
 * [serve 静态文件的处理（请将静态文件的请求添加特定的前缀，此模块在对应目录中找不到文件则thorw 404）]
 * @param  {[type]} staticPath [description]
 * @param  {[type]} options    [description]
 * @return {[type]}            [description]
 */
function serve(staticPath, options) {
  debug('static path:%s, options:%j', staticPath, options);
  let handler = koaStatic(staticPath, {});
  options = options || {};
  let maxAge = options.maxAge;
  let notFoundMaxAge = Math.min(maxAge, 60);
  return function*(next) {
    yield * handler.call(this, next);
    const ctx = this;
    let now = Date.now();
    if (ctx.body) {
      let sMaxAge = Math.min(3600, maxAge);
      ctx.set({
        'Expires': new Date(now + maxAge * 1000).toGMTString(),
        'Cache-Control': util.format('public, max-age=%d, s-maxage=%d', maxAge, sMaxAge),
        'Vary': 'Accept-Encoding'
      });
    } else {
      ctx.set({
        'Expires': new Date(now + notFoundMaxAge * 1000).toGMTString(),
        'Cache-Control': util.format('public, max-age=%d', notFoundMaxAge),
        'Vary': 'Accept-Encoding'
      });
      ctx.throw(404);
    }
  };
}
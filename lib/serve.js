'use strict';
const debug = require('debug')('jt.koa-static-serve');
const path = require('path');
const fs = require('fs');
const etag = require('etag');
const mime = require('mime');

/**
 * [exists description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function exists(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (e, stat) => {
      if (e) {
        const err = e;
        err.status = 404;
        reject(err);
      } else if (stat.isDirectory()) {
        const err = new Error('The path is directory');
        err.status = 404;
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
}

/**
 * [serve 静态文件的处理（请将静态文件的请求添加特定的前缀，此模块在对应目录中找不到文件则thorw 404）]
 * @param  {[type]} staticPath [description]
 * @param  {[type]} options    [description]
 * @return {[type]}            [description]
 */
function serve(staticPath, options) {
  const opts = Object.assign({
    etag: true,
    lastModified: true,
  }, options);
  debug('static path:%s, opts:%j', staticPath, opts);
  if (options && (options.disableETag || options.disableLastModified)) {
    /* eslint max-len:0 no-console:0 */
    console.warn('disableETag and disableLastModified is deprecated, please use etag and lastModified.');
  }
  const maxAge = opts.maxAge || 0;
  const sMaxAge = opts.sMaxAge || Math.min(3600, maxAge);
  const root = path.resolve(staticPath);
  const defaultHeaders = opts.headers;
  const accessList = ['allow', 'deny', 'ignore'];
  const denyQuerystring = opts.denyQuerystring;
  const defaultCharset = opts.charset || 'utf-8';
  opts.dotfiles = accessList.indexOf(opts.dotfiles) === -1 ? 'ignore' : opts.dotfiles;

  return (ctx, next) => {
    if (ctx.status !== 404) {
      return next();
    }
    if (denyQuerystring && ctx.querystring) {
      return ctx.throw(403);
    }
    const file = path.join(root, ctx.path);
    const basename = path.basename(file);
    let access = accessList[0];
    if (file.indexOf(root) !== 0) {
      access = 'deny';
    } else if (basename.charAt(0) === '.') {
      access = opts.dotfiles;
    }
    switch (access) {
      case 'allow':
        break;
      case 'deny':
        return ctx.throw(403);
      default:
        return ctx.throw(404);
    }

    return exists(file).then((stats) => {
      const type = mime.lookup(file);
      const charset = mime.charsets.lookup(type) || defaultCharset;
      const headers = Object.assign({}, defaultHeaders);
      if (opts.etag) {
        headers.ETag = etag(stats);
      }
      if (opts.lastModified) {
        headers['Last-Modified'] = stats.mtime.toUTCString();
      }
      headers['Content-Length'] = stats.size;
      headers['Content-Type'] = type + (charset ? `; charset=${charset}` : '');
      headers['Cache-Control'] = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;
      headers.Expires = new Date(Date.now() + maxAge * 1000).toGMTString();
      ctx.set(headers);
      /* eslint no-param-reassign:0 */
      ctx.status = 200;
      if (ctx.fresh) {
        /* eslint no-param-reassign:0 */
        ctx.status = 304;
        ctx.remove('Content-Type');
        ctx.remove('Content-Length');
      } else {
        /* eslint no-param-reassign:0 */
        ctx.body = fs.createReadStream(file);
      }
      return next();
    }).catch(err => {
      if (opts['404'] === 'next') {
        return next();
      }
      throw err;
    });
  };
}


module.exports = serve;

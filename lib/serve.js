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
  const opts = options || {};
  debug('static path:%s, opts:%j', staticPath, opts);
  const maxAge = opts.maxAge || 0;
  const sMaxAge = opts.sMaxAge || Math.min(3600, maxAge);
  const root = path.resolve(staticPath);
  const defaultHeaders = opts.headers;
  const accessList = ['allow', 'deny', 'ignore'];
  const denyQuerystring = opts.denyQuerystring;
  const defaultCharset = opts.charset || 'utf-8';
  opts.dotfiles = accessList.indexOf(opts.dotfiles) === -1 ? 'ignore' : opts.dotfiles;

  const getHeaders = () => {
    const headers = {};
    if (!defaultHeaders) {
      return headers;
    }
    Object.keys(defaultHeaders).forEach((key) => {
      headers[key] = defaultHeaders[key];
    });
    return headers;
  };

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
    if (basename.charAt(0) === '.') {
      access = opts.dotfiles;
    } else if (file.indexOf(root) !== 0) {
      access = 'deny';
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
      const cloneCxt = ctx;
      const type = mime.lookup(file);
      const charset = mime.charsets.lookup(type) || defaultCharset;
      const headers = getHeaders();
      if (!options || !options.disableETag) {
        headers.ETag = etag(stats);
      }
      if (!options || !options.disableLastModified) {
        headers['Last-Modified'] = stats.mtime.toUTCString();
      }
      headers['Content-Length'] = stats.size;
      headers['Content-Type'] = type + (charset ? `; charset=${charset}` : '');
      headers['Cache-Control'] = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;
      headers.Expires = new Date(Date.now() + maxAge * 1000).toGMTString();
      ctx.set(headers);
      cloneCxt.body = fs.createReadStream(file);
      return next();
    }).catch(err => {
      if (options && options['404'] === 'next') {
        return next();
      }
      throw err;
    });
  };
}


module.exports = serve;

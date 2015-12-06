'use strict';
const debug = require('debug')('jt.koa-static-serve');
const path = require('path');
const resolve = path.resolve;
const fs = require('fs');
const etag = require('etag');
const mime = require('mime');


module.exports = serve;

/**
 * [serve 静态文件的处理（请将静态文件的请求添加特定的前缀，此模块在对应目录中找不到文件则thorw 404）]
 * @param  {[type]} staticPath [description]
 * @param  {[type]} opts    [description]
 * @return {[type]}            [description]
 */
function serve(staticPath, opts) {
	opts = opts || {};
	debug('static path:%s, opts:%j', staticPath, opts);
	const maxAge = opts.maxAge || 0;
	const sMaxAge = Math.min(3600, maxAge);
	const notFoundMaxAge = Math.min(maxAge, 60);
	const root = resolve(staticPath);
	const defaultHeaders = opts.headers;
	const accessList = ['allow', 'deny', 'ignore'];
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
		const file = path.join(root, ctx.url);
		const basename = path.basename(file);
		let access = accessList[0];
		if (basename.charAt(0) === '.') {
			access = opts.dotfiles;
		}
		switch (access) {
			case 'allow':
				break;
			case 'deny':
				return ctx.throw(403);
			case 'ignore':
				return ctx.throw(404);
			default:
				return ctx.throw(404);
		}

		return exists(file).then((stats) => {
			const type = mime.lookup(file);
			const charset = mime.charsets.lookup(type);
			const headers = getHeaders();
			headers.ETag = etag(stats);
			headers['Last-Modified'] = stats.mtime.toUTCString();
			headers['Content-Length'] = stats.size;
			headers['Content-Type'] = type + (charset ? '; charset=' + charset : '');
			headers['Cache-Control'] = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;
			headers.Expires = new Date(Date.now() + maxAge * 1000).toGMTString();
			ctx.set(headers);
			ctx.body = fs.createReadStream(file);
			return next();
		});
	};
}


/**
 * [exists description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function exists(file) {
	return new Promise(function(resolve, reject) {
		fs.stat(file, function onstat(err, stat) {
			if (err) {
				err.status = 404;
				reject(err);
			} else if (stat.isDirectory()) {
				const err = new Error('the path is directory');
				err.status = 404;
				reject(err);
			} else {
				resolve(stat);
			}
		});
	});
}
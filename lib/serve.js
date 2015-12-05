'use strict';
const debug = require('debug')('jt.koa-static-serve');
const send = require('send');
const path = require('path');
const resolve = path.resolve;
const fs = require('fs');


module.exports = serve;

/**
 * [serve 静态文件的处理（请将静态文件的请求添加特定的前缀，此模块在对应目录中找不到文件则thorw 404）]
 * @param  {[type]} staticPath [description]
 * @param  {[type]} options    [description]
 * @return {[type]}            [description]
 */
function serve(staticPath, options) {
	debug('static path:%s, options:%j', staticPath, options);
	const maxAge = options.maxAge || 0;
	const notFoundMaxAge = Math.min(maxAge, 60);
	const root = resolve(staticPath);
	return (ctx, next) => {
		const file = path.join(root, ctx.url);
		return exists(file).then(function() {
			ctx.body = send(ctx.req, ctx.url, {
				root: root
			});
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
				reject(err);
			} else if (stat.isDirectory()) {
				const err = new Error('the path is directory');
				err.status = 404;
				reject(err);
			} else {
				resolve();
			}
		});
	});
	// fs.stat(path, function onstat(err, stat) {
	// if (err && err.code === 'ENOENT' && !extname(path) && path[path.length - 1] !== sep) {
	// 	// not found, check extensions
	// 	return next(err)
	// }
	// if (err) return self.onStatError(err)
	// if (stat.isDirectory()) return self.redirect(self.path)
	// self.emit('file', path, stat)
	// self.send(path, stat)
}
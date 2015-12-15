'use strict';
const Koa = require('koa');
const path = require('path');
const request = require('supertest');
const assets = path.join(__dirname, '../assets');
const serve = require('../lib/serve');
const assert = require('assert');

describe('serve', function() {
	it('should 404 when get dotfiles', function(done) {
		const app = new Koa();

		app.use(serve(assets));
		request(app.listen())
			.get('/.dotfile')
			.expect(404, done);
	});

	it('should 403 when get dotfiles', function(done) {
		const app = new Koa();

		app.use(serve(assets, {
			dotfiles: 'deny'
		}));
		request(app.listen())
			.get('/.dotfile')
			.expect(403, done);
	});

	it('should 404 when get file not exists', function(done) {
		const app = new Koa();

		app.use(serve(assets));
		request(app.listen())
			.get('/not-exists')
			.expect(404, done);
	});

	it('should 404 when get directory', function(done) {
		const app = new Koa();

		app.use(serve(assets));
		request(app.listen())
			.get('/path')
			.expect(404, done);
	});

	it('should get dotfiles successful', function(done) {
		const app = new Koa();

		app.use(serve(assets, {
			dotfiles: 'allow'
		}));
		request(app.listen())
			.get('/.dotfile')
			.expect(200, 'dot file', done);
	});

	it('should set default headers successful', function(done) {
		const app = new Koa();
		const defaultHeaders = {
			vary: 'Accept-Encoding'
		};
		app.use(serve(assets, {
			headers: defaultHeaders
		}));

		request(app.listen())
			.get('/test.js')
			.end(function(err, res) {
				if (err) {
					done(err);
				} else {
					assert.equal(res.status, 200);
					Object.keys(defaultHeaders).forEach(function(key) {
						assert.equal(res.headers[key], defaultHeaders[key]);
					});
					done();
				}
			});
	});

	it('should set max-age=0 default', function(done) {
		const app = new Koa();
		app.use(serve(assets));
		request(app.listen())
			.get('/test.js')
			.expect('Cache-Control', 'public, max-age=0, s-maxage=0')
			.expect(200, done);
	});

	it('should has Last-Modified, Content-Type, Content-Length and ETag', function(done) {
		const app = new Koa();
		const keys = 'Last-Modified Content-Type Content-Length ETag'.split(' ');
		app.use(serve(assets));
		request(app.listen())
			.get('/test.js')
			.end(function(err, res) {
				if (err) {
					done(err);
				} else {
					const headerKeys = Object.keys(res.headers);
					keys.forEach(function(key) {
						key = key.toLowerCase();
						assert(headerKeys.indexOf(key) !== -1);
					});
					done();
				}
			});
	});


	it('should deny access file not in root path', function(done) {
		const app = new Koa();
		app.use(serve(assets));
		request(app.listen())
			.get('/../package.json')
			.expect(403, done);
	});

	it('should return content when ctx.status is not 404', done => {
		const app = new Koa();
		app.use((ctx, next) => {
			ctx.body = 'OK';
			return next();
		});
		app.use(serve(assets));
		request(app.listen())
			.get('/test.js')
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				assert.equal(res.status, 200);
				assert.equal(res.text, 'OK');
				done();
			});
	});

});
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

	// it('should serve js file successful', function(done) {
	// 	const app = new Koa();

	// 	app.use(serve(assets, {
	// 		maxAge: 1000,
	// 		headers: {
	// 			Vary: 'Accept-Encoding'
	// 		}
	// 	}));
	// 	request(app.listen())
	// 		.get('/test.js')
	// 		.end(function(err, res) {
	// 			if (err) {
	// 				done(err);
	// 			} else {
	// 				assert.equal(res.status, 200);
	// 				assert(res.headers.etag);
	// 				done();
	// 			}
	// 		});
	// });
});


// var dateRegExp = /^\w{3}, \d+ \w+ \d+ \d+:\d+:\d+ \w+$/;
// var fixtures = path.join(__dirname, 'fixtures');
// var app = http.createServer(function(req, res){
//   function error(err) {
//     res.statusCode = err.status;
//     res.end(http.STATUS_CODES[err.status]);
//   }

//   function redirect() {
//     res.statusCode = 301;
//     res.setHeader('Location', req.url + '/');
//     res.end('Redirecting to ' + req.url + '/');
//   }

//   send(req, req.url, {root: fixtures})
//   .on('error', error)
//   .on('directory', redirect)
//   .pipe(res);
// });

// describe('send.mime', function(){
//   it('should be exposed', function(){
//     assert(send.mime);
//   })
// })

// describe('send(file).pipe(res)', function(){
//   it('should stream the file contents', function(done){
// request(app)
// .get('/name.txt')
// .expect('Content-Length', '4')
// .expect(200, 'tobi', done)
//   })

//   it('should stream a zero-length file', function (done) {
//     request(app)
//     .get('/empty.txt')
//     .expect('Content-Length', '0')
//     .expect(200, '', done)
//   })
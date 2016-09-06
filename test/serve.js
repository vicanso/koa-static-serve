'use strict';
const Koa = require('koa');
const path = require('path');
const request = require('supertest');
const assets = path.join(__dirname, '../assets');
const serve = require('../lib/serve');
const assert = require('assert');

describe('serve', function() {
  it('should 404 when get dotfiles', done => {
    const app = new Koa();

    app.use(serve(assets));
    request(app.listen())
      .get('/.dotfile')
      .expect(404, done);
  });

  it('should 403 when get dotfiles', done => {
    const app = new Koa();

    app.use(serve(assets, {
      dotfiles: 'deny'
    }));
    request(app.listen())
      .get('/.dotfile')
      .expect(403, done);
  });

  it('should 404 when get file not exists', done => {
    const app = new Koa();

    app.use(serve(assets));
    request(app.listen())
      .get('/not-exists')
      .expect(404, done);
  });

  it('should go next whe get file not exists', done => {
    const app = new Koa();

    app.use(serve(assets, {
      '404': 'next',
    }));

    app.use(ctx => {
      ctx.body = null;
    });
    request(app.listen())
      .get('/not-exists')
      .expect(204, done);
  });

  it('should 404 when get directory', done => {
    const app = new Koa();

    app.use(serve(assets));
    request(app.listen())
      .get('/path')
      .expect(404, done);
  });

  it('should get dotfiles successful', done => {
    const app = new Koa();

    app.use(serve(assets, {
      dotfiles: 'allow'
    }));
    request(app.listen())
      .get('/.dotfile')
      .expect(200, 'dot file', done);
  });

  it('should set default headers successful', done => {
    const app = new Koa();
    const defaultHeaders = {
      vary: 'Accept-Encoding'
    };
    app.use(serve(assets, {
      headers: defaultHeaders
    }));

    request(app.listen())
      .get('/test.js')
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          Object.keys(defaultHeaders).forEach(key => {
            assert.equal(res.headers[key], defaultHeaders[key]);
          });
          ['ETag', 'Last-Modified', 'Content-Length', 
            'Content-Type', 'Cache-Control', 'Expires'].forEach(key => {
            assert(res.get(key));
          });
          done();
        }
      });
  });

  it('should set max-age=0 default', done => {
    const app = new Koa();
    app.use(serve(assets));
    request(app.listen())
      .get('/test.js')
      .expect('Cache-Control', 'public, max-age=0, s-maxage=0')
      .expect(200, done);
  });

  it('should set custom s-maxage', done => {
    const app = new Koa();
    app.use(serve(assets, {
      maxAge: 300,
      sMaxAge: 30,
    }));
    request(app.listen())
      .get('/test.js')
      .expect('Cache-Control', 'public, max-age=300, s-maxage=30')
      .expect(200, done);
  });

  it('should has Last-Modified, Content-Type, Content-Length and ETag', done => {
    const app = new Koa();
    const keys = 'Last-Modified Content-Type Content-Length ETag'.split(' ');
    app.use(serve(assets));
    request(app.listen())
      .get('/test.js')
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          const headerKeys = Object.keys(res.headers);
          keys.forEach(key => {
            key = key.toLowerCase();
            assert(headerKeys.indexOf(key) !== -1);
          });
          done();
        }
      });
  });

  it('should response 304 when has "If-None-Match" header', done => {
    const app = new Koa();
    app.use(serve(assets));
    const server = app.listen();
    request(server)
      .get('/test.js')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        request(server)
          .get('/test.js')
          .set('If-None-Match', res.get('ETag'))
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            assert.equal(res.status, 304);
            done();
          });
      });
  });

  it('should response 304 when has "If-Modified-Since" header', done => {
    const app = new Koa();
    app.use(serve(assets));
    const server = app.listen();
    request(server)
      .get('/test.js')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        request(server)
          .get('/test.js')
          .set('If-Modified-Since', res.get('Last-Modified'))
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            assert.equal(res.status, 304);
            done();
          });
      });
  });

  it('should disable ETag', done => {
    const app = new Koa();
    app.use(serve(assets, {
      disableETag: true,
    }));
    request(app.listen())
      .get('/test.js')
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert(!res.get('ETag'));
          done();
        }
      });
  });

  it('should disable Last-Modified', done => {
    const app = new Koa();
    app.use(serve(assets, {
      disableLastModified: true,
    }));
    request(app.listen())
      .get('/test.js')
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert(!res.get('Last-Modified'));
          done();
        }
      });
  });


  it('should deny access file not in root path', done => {
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


  it('should deny access file with query string', done => {
    const app = new Koa();
    app.use(serve(assets, {
      denyQuerystring: true
    }));
    request(app.listen())
      .get('/test.js?a=123')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        assert.equal(res.status, 403);
        done();
      });
  });

});
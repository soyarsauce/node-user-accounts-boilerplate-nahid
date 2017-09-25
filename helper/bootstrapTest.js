"use strict";

const bootstrap = require('./bootstrap');

describe(`bootstrap`, function ()
{
  it(`basic 1`, function (done)
  {
    let app = {};
    let cfg = {};
    let req = {};
    let res = {};
    bootstrap(app, cfg)(req, res, done);
    req.audit();
  });

  it(`basic 2`, function (done)
  {
    let app = {};
    let cfg = {
      audit: function () {}
    };
    let req = {
      user: {}
    };
    let res = {};
    bootstrap(app, cfg)(req, res, done);
    req.audit();
  });
});

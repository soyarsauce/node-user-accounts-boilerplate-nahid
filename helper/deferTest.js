"use strict";

const defer = require('./defer');
const assert = require('assert');

describe(`defer`, function ()
{
  it(`basic`, function (done)
  {
    defer(done);
  });

  it(`argument forwarding`, function (done)
  {
    function callback(a, b, c)
    {
      assert.equal(a, 'a');
      assert.equal(b, 'b');
      assert.equal(c, 'c');
      done();
    }
    defer(callback, 'a', 'b', 'c');
  });
});

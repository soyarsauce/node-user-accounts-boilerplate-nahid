"use strict";

const reject = require('./reject');
const assert = require('assert');

describe(`error`, function ()
{
  let errorCalled = false;

  function error(a, b, c)
  {
    errorCalled = true;
    assert.equal(a, 'a');
    assert.equal(b, 'b');
    assert.equal(c, 'c');
  }
  it(`should call error`, function ()
  {
    reject({
      error
    }, 'b', 'c')('a');
    assert(errorCalled);
  })

  it(`should have detault params`, function ()
  {
    reject({
      error: i => i
    })('a');
  })

});

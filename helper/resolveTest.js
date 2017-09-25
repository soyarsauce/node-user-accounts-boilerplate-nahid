"use strict";

const resolve = require('./resolve');
const assert = require('assert');

describe(`reject`, function ()
{
  let rejectCalled = false;
  let errorCalled = false;

  function reject(a, e)
  {
    assert.equal(a, 'a_FAILURE');
    assert.equal(e, 'e');
    rejectCalled = true;
    return function ()
    {
      errorCalled = true;
    };
  }
  let successCalled = false;

  function success(m, a, e)
  {
    assert.equal(m, 'm');
    assert.equal(a, 'a_SUCCESS');
    assert.equal(e, 'e');
    successCalled = true;
  }

  beforeEach(function ()
  {
    rejectCalled = false;
    errorCalled = false;
    successCalled = false;
  });

  async function promiseSuccess()
  {
    return 'PASS'
  }

  async function promiseFailure()
  {
    throw new Error('FAIL');
  }

  it(`should call success`, function (done)
  {
    resolve({
      reject,
      success
    }, promiseSuccess(), 'm', 'a', 'e');
    setTimeout(() =>
    {
      assert(rejectCalled);
      assert(!errorCalled);
      assert(successCalled);
      done();
    }, 50);
  })

  it(`should call failure`, function (done)
  {
    resolve({
      reject,
      success
    }, promiseFailure(), 'm', 'a', 'e');
    setTimeout(() =>
    {
      assert(rejectCalled);
      assert(errorCalled);
      assert(!successCalled);
      done();
    }, 50);
  })

});

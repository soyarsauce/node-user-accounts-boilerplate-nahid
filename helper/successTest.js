"use strict";

const success = require('./success');
const assert = require('assert');

// mirror of error
describe(`success`, function ()
{
  let statusCode;

  function status(statusCodeParam)
  {
    statusCode = statusCodeParam;
    return {
      json
    };
  }
  let jsonValue;

  function json(jsonValueParam)
  {
    jsonValue = jsonValueParam;
  }
  let auditCalled = false;

  function audit()
  {
    auditCalled = true;
  }

  it(`empty success`, function ()
  {
    success({
      status
    })
    assert.equal(statusCode, 200)
    assert.deepEqual(jsonValue, {
      success: 'Success'
    })
  })

  it(`string success`, function ()
  {
    success({
      status
    }, 'string')
    assert.equal(statusCode, 200)
    assert.deepEqual(jsonValue, {
      success: 'string'
    })
  })

  it(`object success`, function ()
  {
    success({
      status
    }, {})
    assert.equal(statusCode, 200)
    assert.deepEqual(jsonValue, {})
  })

  it(`audit`, function ()
  {
    success({
      status,
      audit
    }, 'msg', 'audit')
    assert(auditCalled)
  })

  it(`audit + extra`, function ()
  {
    success({
      status,
      audit
    }, 'msg', 'audit', 'extra')
    assert(auditCalled)
  })

});

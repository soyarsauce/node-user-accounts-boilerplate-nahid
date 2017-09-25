"use strict";

const error = require('./error');
const assert = require('assert');

describe(`error`, function ()
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

  it(`empty error`, function ()
  {
    error({
      status
    })
    assert.equal(statusCode, 400)
    assert.deepEqual(jsonValue, {
      error: 'Failure'
    })
  })

  it(`string error`, function ()
  {
    error({
      status
    }, 'string')
    assert.equal(statusCode, 400)
    assert.deepEqual(jsonValue, {
      error: 'string'
    })
  })

  it(`object error`, function ()
  {
    error({
      status
    }, {})
    assert.equal(statusCode, 400)
    assert.deepEqual(jsonValue, {})
  })

  it(`audit`, function ()
  {
    error({
      status,
      audit
    }, 'msg', 'audit')
    assert(auditCalled)
  })

  it(`audit + extra`, function ()
  {
    error({
      status,
      audit
    }, 'msg', 'audit', 'extra')
    assert(auditCalled)
  })

});

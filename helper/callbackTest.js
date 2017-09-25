"use strict";

const callback = require('./callback');
const assert = require('assert');

describe(`callback`, function ()
{
  function success(parameter, callbackFunction)
  {
    assert.equal(parameter, 'parameter')
    callbackFunction(null, 'result')
  }
  it(`success`, async function ()
  {
    assert.equal(await callback(success, 'parameter'), 'result');
  });

  function failure(parameter, callbackFunction)
  {
    assert.equal(parameter, 'parameter')
    callbackFunction('error', null)
  }

  it(`failure`, async function ()
  {
    try
    {
      await callback(faulure, 'parameter')
    }
    catch (e)
    {
      return
    }
    throw new Error('FAIL');
  });
});

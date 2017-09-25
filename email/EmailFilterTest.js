"use strict";

const Class = require('./EmailFilter');
const assert = require('assert');

describe(Class.name, function ()
{
  it(`set name`, async function ()
  {
    const name = 'name' + Math.random();
    const instance = new Class(name);
    assert.equal(instance.name, name);
  });

  it(`abstract filter`, async function ()
  {
    const instance = new Class('name');
    try
    {
      await instance.doesAllow()
    }
    catch (e)
    {
      return;
    }
    throw new Error('FAIL');
  });

});

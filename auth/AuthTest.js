"use strict";

const Auth = require('./Auth');
const assert = require('assert');

describe(Auth.name, function ()
{
  let instance;
  beforeEach(function ()
  {
    instance = new Auth('test', {
      users: {
        lookup: {
          a: {
            id: 'a'
          },
          b: {
            id: 'b',
            credentials: [{
              type: 'test',
              value: 'a'
            }]
          }
        }
      }
    });
  });

  it(`should have a method`, async function ()
  {
    assert.deepEqual(instance.method, 'test')
  })

  it(`install is abstract`, async function ()
  {
    try
    {
      instance.install();
    }
    catch (e)
    {
      return
    }
    throw new Error('FAIL');
  })

  it(`should find users by credential`, async function ()
  {
    assert.deepEqual(instance.findUser('b'), false)
    assert.deepEqual(instance.findUser('a')
      .id, 'b')
  })

  it(`should create user from profile`, async function ()
  {
    instance.custom.xxx = {
      derive: () => 'xxx'
    }
    instance.custom.yyy = {
      derive: () => false
    }
    instance.custom.zzz = {}
    const user = instance.createUserFromProfile({
      id: 'testXX'
    });
    assert.deepEqual(user.credentials, [{
      type: instance.method,
      value: 'testXX'
    }])
    assert.notDeepEqual(user.id, 'testXX')
    assert.deepEqual(user.xxx, 'xxx')
    assert.deepEqual(user.yyy, undefined)
    assert.deepEqual(user.zzz, undefined)
  })
});

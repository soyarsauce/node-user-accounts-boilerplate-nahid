"use strict";

const assert = require('assert');
const describeConfig = require('./setupTester');
const NoAuth = require('./auth/NoAuth');
const PBKDF2 = require('./crypt/PBKDF2');

describeConfig('empty', {}, function (handler)
{
  it('should have no login methods', async function ()
  {
    const
    {
      status,
      data
    } = await handler.request('GET', '/api/accounts/methods.json');
    assert.deepEqual(status, 200);
    assert.deepEqual(data, []);
  });

  it('should not be able to access admin api', async function ()
  {
    const
    {
      status
    } = await handler.request('GET', '/api/accounts/search.json');
    assert.deepEqual(status, 400);
  });

  it('should not be able to access admin api', async function ()
  {
    const
    {
      data
    } = await handler.request('GET', '/api/accounts/current.json');
    assert.deepEqual(data, false);
  });
});

async function config()
{
  const cfg = {};
  cfg.users = await describeConfig.createUsers([{
    id: 'regular',
    password: 'INVALID'
  }, {
    id: 'admin',
    roles: {
      admin: true
    }
  }]);

  cfg.auth = [
    new NoAuth({
      method: 'regular',
      loginUserId: 'regular'
    }),
    new NoAuth({
      method: 'admin',
      loginUserId: 'admin'
    })
  ];

  cfg.auth[0].description.usesPassword = true

  cfg.fields = {
    customInvalid: {
      assign: () =>
      {
        throw new Error('Invalid')
      }
    },
    customValid: {
      assign: i => i
    }
  }

  cfg.crypt = new PBKDF2();

  cfg.administratorRoles = {
    admin: true
  };
  return cfg;
}

describeConfig('config', config, function (handler)
{
  it('should have login methods', async function ()
  {
    const
    {
      status,
      data
    } = await handler.request('GET', '/api/accounts/methods.json');
    assert.deepEqual(status, 200);
    assert.notDeepEqual(data, []);
  });

  it('should be able to login', async function ()
  {
    assert.deepEqual((await handler.request('GET', '/api/accounts/regular/login.json'))
      .status, 200);
    const
    {
      data
    } = await handler.request('GET', '/api/accounts/current.json');
    assert.deepEqual(data.id, 'regular');
    console.log(data)
    assert.deepEqual(data.password, true);
  });

  it('should be able to logout', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    await handler.request('GET', '/api/accounts/logout.json');
    assert.deepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data, false);
  });

  it('should be update display name', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        displayName: 'TEST'
      }))
      .status, 200);
    assert.deepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data.displayName, 'TEST');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        displayName: ['TEST2']
      }))
      .status, 400);
    assert.deepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data.displayName, 'TEST');
  });

  it('should be able to remove password', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        password: false
      }))
      .status, 200);
    assert.deepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data.password, undefined);
  });

  // it('should not be able to set password if a module that does not use passsword is not present', async function ()
  // {
  //   await handler.request('GET', '/api/accounts/admin/login.json');
  //   assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
  //       password: 'QAAS91723891ASD98@#!#'
  //     }))
  //     .status, 400);
  //   assert.deepEqual((await handler.request('GET', '/api/accounts/current.json'))
  //     .data.password, undefined);
  // });

  it('should not be able to set password if a crypt is not configured', async function ()
  {
    handler.getconfig()
      .crypt = null;
    await handler.request('GET', '/admin/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        password: 'QAAS91723891ASD98@#!#'
      }))
      .status, 400);
    assert.deepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data.password, undefined);
  });

  it('should be able to set password if a module that does use passsword is present', async function ()
  {
    handler.getconfig()
      .auth[0].description.usesPassword = true;
    await handler.request('GET', '/api/accounts/admin/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        password: 'QAAS91723891ASD98@#!#'
      }))
      .status, 200);
    assert.notDeepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data.password, undefined);
  });

  it('should not be able to update own roles', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        roles: {}
      }))
      .status, 400);
  });

  it('should not be able to update random fields', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        random: true
      }))
      .status, 400);
  });

  it('should be able to validate custom fields', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        customInvalid: true
      }))
      .status, 400);
  });

  it('should be able to valid custom fields', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/current.json', {}, {
        customValid: true
      }))
      .status, 200);
  });

  it('regular user should not see users list', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('GET', '/api/accounts/search.json'))
      .status, 400);
  });

  it('regular user should not see other users', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('GET', '/api/accounts/regular.json'))
      .status, 400);
  });

  it('regular user should not update other users', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/regular.json', {}, {}))
      .status, 400);
  });

  it('regular user should not delete other users', async function ()
  {
    await handler.request('GET', '/api/accounts/regular/login.json');
    assert.deepEqual((await handler.request('DELETE', '/api/accounts/regular.json'))
      .status, 400);
  });

  it('admin user should see users list', async function ()
  {
    await handler.request('GET', '/api/accounts/admin/login.json');
    assert.deepEqual((await handler.request('GET', '/api/accounts/search.json'))
      .status, 200);
  });

  it('admin user should see other users', async function ()
  {
    await handler.request('GET', '/api/accounts/admin/login.json');
    assert.deepEqual((await handler.request('GET', '/api/accounts/regular.json'))
      .status, 200);
    assert.deepEqual((await handler.request('GET', '/api/accounts/admin.json'))
      .status, 200);
  });

  it('admin user should update other users', async function ()
  {
    await handler.request('GET', '/api/accounts/admin/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/admin.json', {}, {}))
      .status, 200);
  });

  it('admin user should update other user role', async function ()
  {
    await handler.request('GET', '/api/accounts/admin/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/regular.json', {}, {
        roles: {
          admin: true
        }
      }))
      .status, 200);
  });

  it('admin user should not update own role', async function ()
  {
    await handler.request('GET', '/api/accounts/admin/login.json');
    assert.deepEqual((await handler.request('PUT', '/api/accounts/admin.json', {}, {
        roles: {}
      }))
      .status, 400);
  });

  it('admin user should delete other users', async function ()
  {
    await handler.request('GET', '/api/accounts/admin/login.json');
    assert.deepEqual((await handler.request('DELETE', '/api/accounts/regular.json'))
      .status, 200);
  });

  it('admin user should not delete self', async function ()
  {
    await handler.request('GET', '/api/accounts/admin/login.json');
    assert.deepEqual((await handler.request('DELETE', '/api/accounts/admin.json'))
      .status, 400);
  });

});

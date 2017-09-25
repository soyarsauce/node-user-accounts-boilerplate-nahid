"use strict";

const assert = require('assert');
const describeConfig = require('../setupTester');
const EmailAuth = require('./EmailAuth');
const PBKDF2 = require('../crypt/PBKDF2');

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

  cfg.crypt = new PBKDF2();

  cfg.auth = [
    new EmailAuth(cfg)
  ];

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

  it('should fail bad input', async function ()
  {
    assert.deepEqual((await handler.request('POST', '/api/accounts/email/login.json', {}))
      .status, 400);
    assert.deepEqual((await handler.request('POST', '/api/accounts/email/login.json', {}, {}))
      .status, 400);
    assert.deepEqual((await handler.request('POST', '/api/accounts/email/login.json', {}, {
        username: ''
      }))
      .status, 400);
    assert.deepEqual((await handler.request('POST', '/api/accounts/email/login.json', {}, {
        username: 'a'
      }))
      .status, 400);
    assert.deepEqual((await handler.request('POST', '/api/accounts/email/login.json', {}, {
        password: ''
      }))
      .status, 400);
    assert.deepEqual((await handler.request('POST', '/api/accounts/email/login.json', {}, {
        username: 'regular',
        password: ''
      }))
      .status, 400);
    assert.deepEqual((await handler.request('POST', '/api/accounts/email/login.json', {}, {
        username: 'regular',
        password: 'XXX'
      }))
      .status, 400);
    assert.deepEqual((await handler.request('POST', '/api/accounts/email/login.json', {}, {
        username: 'admin',
        password: 'XXX'
      }))
      .status, 400);
    // TODO: can't seem to figure out how to customise 
  });
});

describe(EmailAuth.name, function ()
{
  let instance;
  let emails = [];
  beforeEach(function ()
  {
    emails = [];
    instance = new EmailAuth({
      crypt: new PBKDF2(),
      emailSender: {
        send: function ()
        {
          emails.push(Array.prototype.slice.call(arguments))
        }
      }
    });
  });

  it(`should create profile from id`, async function ()
  {
    await instance.createProfileFromCredential('test@test');
    await instance.createProfileFromCredential('test@test', {
      password: 'xxx'
    });

    instance.createUserFromProfile(await instance.createProfileFromCredential('test@test', {
      password: 'xxx'
    }));

    instance.allowPasswordSettingDuringRegistration = true;

    instance.createUserFromProfile(await instance.createProfileFromCredential('test@test', {
      password: 'xxx'
    }));
  })

  it(`should send email`, async function ()
  {
    await instance.sendTemporaryPassword('', 'email', 'password', 'expireMinutes');
    await instance.sendTemporaryPassword('', 'email', 'password', 'expireMinutes', 'loginLinkPrefix');
    await instance.sendTemporaryPassword('register', 'email', 'password', 'expireMinutes', 'loginLinkPrefix');
    await instance.sendTemporaryPassword('recover', 'email', 'password', 'expireMinutes', 'loginLinkPrefix');
  })
})

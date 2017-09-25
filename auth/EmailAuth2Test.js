"use strict";

const assert = require('assert');
const describeConfig = require('../setupTester');
const EmailAuth = require('./EmailAuth');
const PBKDF2 = require('../crypt/PBKDF2');
process.on('unhandledRejection', (reason, p) => {
  console.log(reason.stack, p.stack);
});
function config(base = {})
{
  return async function ()
  {
    const cfg = JSON.parse(JSON.stringify(base));
    cfg.users = await describeConfig.createCollection([{
      id: 'regular',
      password: "0000001000002710aaf5309088073583635515b587c99a0d2d0c6a65063f8edf42e5e060c6be57d836515726956e8bb013b43682472adb140baa090d0cebae8c43c8be856a4f17a0b856a6f5bd67f9e98aa3b0fcf095a33ccba15f36cbd4609549e15461edc8fe5484a8eb10b8a28476931505bcd929eb7ea2460f9a5ea051161f5769a12c943209a7437df72452706d847361497f193cafaf4bf80ed79ba23c389b3453ca8721e981948ba0c95505dd8e3c0724e2c70db5a2623be6507a7c1a8d9e1caa48dbf31c524610713063475687f2abc3b749ea10e3982e0f487e47265a90d0c3bf0dbf7444dbbf6a949448e0536db4e37886a9ae00efb12ee7cdb53c2eb827cdfc4c325bf687d802aeeec3c58db253e88886e44a65d959817029e3d75a4b398ef299318ab469aee332ca0068eb5d6ff221f69a345af055ad1021b75dd49446f602dc05e961925ca083530def5e5e5670871a29ecd99de40f7bfe0ff3336b3359d17da8f0a85294d01368847f6af784e4eb361bb716842a8725708f518f554c93aa5aa40392cd866145537a35532607924461e5ac40a5101af3d6ca16c3f68ecb3f28637e8999f85abe4cb56b5312297ece745ccc7152e25b5db07e492e5ee7dd4942f8e02fd3b93787f091949a7735d501a97a4eed729f5eaf7b35dee12bcced045ff327953863016a121d19cf5ef0270ebfa61767e68befc1f9e457743a753f816135bea1cabe694da6a694f0343fe772231938",
      "credentials": [{
        "type": "email",
        "value": "username"
      }]
    }]);

    cfg.emails = [];
    cfg.emailSender = {
      send: function ()
      {
        cfg.emails.push(Array.prototype.slice.call(arguments));
      }
    }

    cfg.crypt = new PBKDF2();

    cfg.auth = [
      new EmailAuth(cfg)
    ];

    return cfg;
  }
}

describeConfig('normal flow', config(), function (handler)
{
  it(`normal login`, async function ()
  {
    await handler.request('POST', '/api/accounts/email/login.json', {}, {
      username: 'username',
      password: 'password'
    });
    assert.notDeepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data, false)
  });
});

describeConfig('passwordless', config(), function (handler)
{
  it(`normal login`, async function ()
  {
    // @@@@@@@@
    // send a passwordless login security token
    await handler.request('POST', '/api/accounts/email/passwordless.json', {}, {
      username: 'username',
    });
    // make sure it does not log us in
    assert.deepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data, false);
    // @@@@@@@@
    // extract security token from email
    assert.deepEqual(handler.getconfig()
      .emails.length, 1)
    const token = handler.getconfig()
      .emails[0][3].match(/[:] ([^<]+)\</)[1];
    // @@@@@@@@
    // login using security token
    await handler.request('POST', '/api/accounts/email/login.json', {}, {
      username: 'username',
      password: token,
    });
    assert.notDeepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data, false);
    // @@@@@@@@
    // make sure token expires
    await handler.request('POST', '/api/accounts/logout.json')
    await handler.request('POST', '/api/accounts/email/login.json', {}, {
      username: 'username',
      password: token,
    });
    assert.deepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data, false);
  });
});

describeConfig('simulate ordinary login', config({
  allowPasswordSettingDuringRegistration: true
}), function (handler)
{
  it(``, async function ()
  {
    // @@@@@@@@
    // instead of sending a passwordless request, we send a registration request
    await handler.request('POST', '/api/accounts/email/register.json', {}, {
      username: 'testusername',
      password: 'testpassword',
      loginLinkPrefix: '>>>',
    });
    // get verification token out of email
    assert.deepEqual(handler.getconfig()
      .emails.length, 1)
    const token = handler.getconfig()
      .emails[0][3].match(/>>>([^"]+)"/)[1];
    // @@@@@@@@
    // verify
    await handler.request('POST', '/api/accounts/email/verify.json', {}, {
      username: 'testusername',
      password: token,
    });
    // should be logged in
    assert.notDeepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data, false);
    // we should noe be able to log in using the password we specified
    await handler.request('POST', '/api/accounts/logout.json')
    await handler.request('POST', '/api/accounts/email/login.json', {}, {
      username: 'testusername',
      password: 'testpassword',
    });
    assert.notDeepEqual((await handler.request('GET', '/api/accounts/current.json'))
      .data, false);
    await handler.request('POST', '/api/accounts/logout.json')
    // @@@@@@@@
    // should also be able to recover accounts
    await handler.request('POST', '/api/accounts/email/recover.json', {}, {
      username: 'testusername',
    });
  })
});

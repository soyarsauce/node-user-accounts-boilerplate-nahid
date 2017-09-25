"use strict";

const recaptcha = require('./recaptcha');

// https://developers.google.com/recaptcha/docs/faq

const publicKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
const privateKey = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

describe('recaptcha', function ()
{


  it(`should not restrict if settings are not present 1`, function (done)
  {
    recaptcha()(null, null, done)
  });

  it(`should not restrict if settings are not present 2`, function (done)
  {
    recaptcha({})(null, null, done)
  });

  it(`should not restrict if settings are not present 3`, function (done)
  {
    recaptcha({
      publicKey
    })(null, null, done)
  });

  it(`should not restrict if settings are not present 4`, function (done)
  {
    recaptcha({
      privateKey
    })(null, null, done)
  });

  it(`should not restrict if everything is peachy`, function (done)
  {
    recaptcha({
      publicKey,
      privateKey
    })({
      body: {
        recaptchaResponse: 'test'
      }
    }, null, done)
  });

  it(`should restrict if body is not present`, function (done)
  {
    recaptcha({
      publicKey,
      privateKey
    })({
      body: {}
    }, {
      error: () => done()
    }, null)
  });

  it(`should restrict if validation fails`, function (done)
  {
    recaptcha({
      publicKey,
      privateKey: privateKey + 'xx'
    })({
      body: {
        recaptchaResponse: 'test'
      }
    }, {
      error: () => done()
    }, null)
  });

})

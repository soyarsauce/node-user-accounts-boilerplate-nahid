"use strict";

const Class = require('./EmailFilter');
const assert = require('assert');

module.exports = function (instantiate, toAddress = 'accoutnts-email-test@mailinator.com', fromAddress = 'test@mailinator.com')
{
  let instance;

  beforeEach(async function ()
  {
    instance = instantiate();
  });

  it(`send email`, async function ()
    {
      await instance.send(toAddress, fromAddress, 'TEST SUBJECT', 'TEST BODY');
    })
    .timeout(60 * 1000);
}

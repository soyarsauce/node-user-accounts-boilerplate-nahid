"use strict";

if (process.env.SES_TEST_REGION)
{
  const Class = require('./SESEmailSender');
  const tester = require('./emailSenderTester');

  tester(() => new Class(process.env.SES_TEST_REGION))
}

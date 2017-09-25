"use strict";

const Class = require('./NodeEmailSender');
const tester = require('./emailSenderTester');

tester(() => new Class())

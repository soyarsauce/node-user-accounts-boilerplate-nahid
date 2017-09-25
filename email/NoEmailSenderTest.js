"use strict";

const Class = require('./NoEmailSender');
const tester = require('./emailSenderTester');

tester(() => new Class())

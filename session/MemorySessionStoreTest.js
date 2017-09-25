"use strict";

const Store = require('./MemorySessionStore');
const tester = require('./sessionStoreTester');

tester(() => new Store());

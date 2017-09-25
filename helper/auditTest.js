"use strict";

const audit = require('./audit');
const assert = require('assert');

describe(`audit`, function ()
{
  it(`should never fail`, async function ()
  {
    audit()
    audit(1)
    audit(1, 2)
    audit(1, 2, 3)
    audit(1, 2, 3, 4)
    audit(1, 2, 3, 4, 5)
    audit(1, 2, 3, 4, 5, 6)
    let old = console.log
    console.log = false;
    audit(1, 2, 3, 4, 5, 6, 7)
    console.log = old;
    Date.prototype.toISOString = null;
    audit(1, 2, 3, 4, 5, 6, 7)
  })
});

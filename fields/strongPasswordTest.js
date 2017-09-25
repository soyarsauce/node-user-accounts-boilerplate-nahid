"use strict";

const assert = require('assert');
const { generate, checkStrongPassword } = require('./strongPassword');

describe(`generate password`, function ()
{
  it(`generates strong password`, function ()
  {
    for (let x = 0; x < 10; x++)
    {
      assert(checkStrongPassword(generate(10)));
    }
    generate();
  })
});

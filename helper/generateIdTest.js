"use strict";

const generateId = require('./generateId');
const assert = require('assert');

describe(`generateId`, function ()
{
  it(`should generate unique ids`, async function ()
  {
    let list = [];
    for (let x = 0; x < 100; x++)
    {
      let id = generateId();
      assert.equal(list.indexOf(id), -1);
      list.push(id)
    }
  })
})

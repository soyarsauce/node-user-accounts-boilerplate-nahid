"use strict";

const assert = require('assert');
const failure = require('./failure');

describe('failure', function ()
{
  let instance;
  beforeEach(async function ()
  {
    instance = failure({});
  });

  it(`should not restrict if settings are not present 1`, function (done)
  {
    failure()(null, null, done)
  });

  it(`operation`, function ()
  {
    let allows = 0;
    let error = false;
    while (!error)
    {

      let on
      let req = {};
      let res = {
        on: (_, cb) =>
        {
          on = cb;
        },
        error: () =>
        {
          error = true
        }
      };

      instance(req, res, () =>
      {
        allows++;
        res.status = 400;
        on();
      });
    }
    assert.equal(allows, 5);
  });

})

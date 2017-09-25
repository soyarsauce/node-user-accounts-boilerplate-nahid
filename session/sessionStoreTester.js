"use strict";

const assert = require('assert');

/**
 * @private
 */
module.exports = function (instantiate)
{
  describe(`${instantiate().constructor.name}`, function ()
  {
    let instance = null;

    beforeEach(function ()
    {
      instance = instantiate();
    });

    it(`can set and get`, function (done)
    {
      const id = Math.random()
        .toString();

      instance.set(id, {}, (err, sess) =>
      {
        instance.get(id, (err, sess) =>
        {
          delete sess.expires;
          delete sess.id;
          assert.equal(err, null);
          assert.deepEqual(sess, {});
          instance.destroy(id, done);
        });
      });
    })
  });
}

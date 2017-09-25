"use strict";

const assert = require('assert');

module.exports = function (Crypt)
{
  describe(Crypt.name, function ()
  {
    let crypt;

    beforeEach(function (done)
    {
      crypt = new Crypt();
      done();
    });

    it('should not hash empty string', async function ()
    {
      try
      {
        await crypt.hash('');
      }
      catch (e)
      {
        return;
      }
      throw new Error('FAIL')
    });

    it('should hash and verify non-empty strings', async function ()
    {
      const pass = 'a';
      const nonpass = 'b';

      const hash = await crypt.hash(pass);
      const success = await crypt.verify(pass, hash);

      assert(success);
      const failure = await crypt.verify(nonpass, hash);

      assert(!failure);
    });

  });
};

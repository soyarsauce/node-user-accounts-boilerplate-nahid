"use strict";

const Crypt = require('./Crypt');
const scrypt = require("scrypt");

/**
 * Use scrypt.
 * 
 * Requires scrypt (npm install scrypt).
 */
class SCRYPT extends Crypt
{

  /**
   * @param {Object} [options={}]
   * @param {Number} [options.maxtime=0.1] see https://www.npmjs.com/package/scrypt#params
   */
  constructor(options = {})
  {
    super();
    this.params = scrypt.paramsSync(options.maxtime || 0.1);
  }

  /**
   * @override
   */
  async hashImplementation(password)
  {
    const result = await scrypt.kdf(password, this.params);


    return result.toString('hex');
  }

  /**
   * @override
   */
  async verifyImplementation(password, hash)
  {
    return await scrypt.verifyKdf(new Buffer(hash, "hex"), password)
  }

}

module.exports = SCRYPT;

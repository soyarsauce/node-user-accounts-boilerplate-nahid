"use strict";

const Crypt = require('./Crypt');
const crypto = require('crypto');

/**
 * Use crypto.pbkdf2
 * 
 * implementation adapted from https://gist.github.com/skeggse/52672ddee97c8efec269
 */
class PBKDF2 extends Crypt
{

  /**
   * @param {Object} [options={}]
   * @param {String} [options.hashDigest=sha512] see https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
   * @param {Number} [options.hashBytes=512] see https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
   * @param {Number} [options.saltBytes=16] see https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
   * @param {Number} [options.iterations=10000] see https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
   */
  constructor(options = {})
  {
    super();
    this.hashDigest = options.hashDigest || 'sha512';
    this.hashBytes = options.hashBytes || 512;
    this.saltBytes = options.saltBytes || 16;
    this.iterations = options.iterations || 10000;
  }

  /**
   * @override
   */
  hashImplementation(password)
  {
    return new Promise((resolve, reject) =>
    {
      // generate a salt for pbkdf2
      crypto.randomBytes(this.saltBytes, (err, salt) =>
      {
        if (err)
        {
          return reject(err);
        }
        crypto.pbkdf2(password, salt, this.iterations, this.hashBytes, this.hashDigest, (err, hash) =>
        {
          if (err)
          {
            console.log('XXX', err);

            return reject(err);
          }

          let combined = new Buffer(hash.length + salt.length + 8);

          // include the size of the salt so that we can, during verification,
          // figure out how much of the hash is salt
          combined.writeUInt32BE(salt.length, 0, true);
          // similarly, include the iteration count
          combined.writeUInt32BE(this.iterations, 4, true);
          salt.copy(combined, 8);
          hash.copy(combined, salt.length + 8);

          resolve(combined.toString('hex'));
        });
      });
    });
  }

  /**
   * @override
   */
  verifyImplementation(password, oldhash)
  {
    return new Promise((resolve, reject) =>
    {
      let combined = new Buffer(oldhash, 'hex');
      // extract the salt and hash from the combined buffer
      const saltBytes = combined.readUInt32BE(0);
      const hashBytes = combined.length - saltBytes - 8;
      const iterations = combined.readUInt32BE(4);
      const salt = combined.slice(8, saltBytes + 8);
      const hash = combined.toString('binary', saltBytes + 8);
      // verify the salt and hash against the password

      crypto.pbkdf2(password, salt, iterations, hashBytes, this.hashDigest, (err, verify) =>
      {
        if (err)
        {
          return reject(err);
        }
        resolve(verify.toString('binary') === hash);
      });
    });
  }

}

module.exports = PBKDF2;

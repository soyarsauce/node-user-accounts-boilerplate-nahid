"use strict";

/**
 * Abstract class for taking care of password hashing and verification.
 */
class Crypt
{

  /**
   * Hash a password.
   * 
   * @param {string} password Password to hash
   * @return {string} Promise should return hash as string or error
   */
  async hash(password)
  {
    if (!password)
    {
      throw new Error('Empty password');
    }

    return await this.hashImplementation(password);
  }

  /**
   * Implementation of hash() minus checks.
   * 
   * @param {string} password_ Password to hash
   * @return {string} Promise should return hash as string or error
   * @abstract
   */
  async hashImplementation(password_)
  {
    throw new Error('TODO: Abstract method called');
  }

  /**
   * Verify a password against previously hashed password
   * 
   * @param {String} password Password to compare
   * @param {String} hash Previously hashed password
   * @return {boolean} Promise should return boolean result.
   */
  async verify(password, hash)
  {
    if (!password)
    {
      throw new Error('Empty password');
    }
    if (!hash)
    {
      throw new Error('Empty hash');
    }

    return await this.verifyImplementation(password, hash);
  }

  /**
   * Implementation of verify() minus checks.
   * 
   * Default implementation hashes new password and does string compare.
   * This'll work for weaker hashes like md5 but won't work for stronger ones
   * like scrypt.
   * 
   * @param {String} password Password to compare
   * @param {String} hash Previously hashed password
   * @return {boolean} Promise should return boolean result.
   */
  async verifyImplementation(password, hash)
  {
    return hash === await this.hash(password);
  }

}

module.exports = Crypt;

"use strict";

const crypto = require('crypto');

/**
 * Helper method that generates a new user id.
 * 
 * This method uses current timestamp and random number generator to come up
 * with unique ids.
 * 
 * @return {string}
 */
module.exports = function ()
{
  return `${crypto.randomBytes(4)
    .toString('hex')}.${(Date.now() + Math.random())
    .toString(26)}`;
}

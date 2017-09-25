"use strict";

/**
 * Returns a function that calls res.error
 * 
 * @param {Response} res use as res.reject(...)
 * @param {string} [audit=false] audit event type
 * @param {string} [extra=undefined] extra audit payload which may help debug event
 */
function reject(res, audit = false, extra = undefined)
{
  return function (err)
  {
    // console.error(err);
    res.error(err && err.message || err, audit, extra);
  };
}

module.exports = reject;

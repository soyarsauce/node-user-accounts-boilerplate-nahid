"use strict";

/**
 * Calls a callback caller that calls a callback call for async instead of using promises.
 * 
 * @param {Function} fn function to call
 * @param [args] arguments to call function with
 * @return {Promise} It returns a promise which resolves on callback call.
 */
function callback(fn, ...args)
{
  return new Promise(function (resolve, reject)
  {
    function handler(err, result)
    {
      if (err)
      {
        reject(new Error(err));
      }
      else
      {
        resolve(result);
      }
    }
    args.push(handler);
    fn(...args);
  });
}

module.exports = callback;

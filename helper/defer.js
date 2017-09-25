"use strict";

/**
 * Call a function later.
 * @param {Function} fn function to call
 * @param args Can also specify 0 or more arguments to call function with.
 */
function defer(fn, args)
{
  fn && process.nextTick(fn.bind(...arguments));
}

module.exports = defer;

"use strict";

/**
 * Monitors a Promise and returns success or error based on promise outcome.
 * 
 * @param {Response} res use as res.resolve(...)
 * @param {Promise} promiseObj Promise objecy to monitor
 * @param {string|object} [message=undefined] success or error message to return; if this is not specified, result of promise is returned.
 * @param {string} [audit=false] audit event type. note that '_SUCCESS' or '_FAILURE' is attached to this type depenidng on outcome
 * @param {string} [extra=undefined] extra audit payload which may help debug event
 */
function resolve(res, promiseObj, message = undefined, audit = false, extra = undefined)
{
  promiseObj.then((response) =>
  {
    res.success(message || response, audit && `${audit}_SUCCESS`, extra);
  }, res.reject(audit && `${audit}_FAILURE`, extra));
}

module.exports = resolve;

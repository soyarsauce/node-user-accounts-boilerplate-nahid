"use strict";

/**
 * Return error status and payload as response.
 * 
 * @param {Response} res use as res.error(...)
 * @param {string|object} [message='Failure'] error message to return; if a strig is specified, it will be converted to an error object
 * @param {string} [audit=false] audit event type
 * @param {string} [extra=undefined] extra audit payload which may help debug event
 */
function error(res, message = 'Failure', audit = false, extra = undefined)
{
  if (audit)
  {
    res.audit(audit, message, extra);
  }
  if (typeof message === 'string')
  {
    message = {
      error: message
    };
  }
  res.status(400)
    .json(message);
}

module.exports = error;

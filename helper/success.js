"use strict";

/**
 * Return success status and payload as response.
 * 
 * @param {Response} res use as res.success(...)
 * @param {string|object} [message='Success'] success message to return
 * @param {string} [audit=false] audit event type
 * @param {string} [extra=undefined] extra audit payload which may help debug event
 */
function success(res, message = 'Success', audit = false, extra = undefined)
{
  if (audit)
  {
    res.audit(audit, message, extra);
  }
  if (typeof message === 'string')
  {
    message = {
      success: message
    };
  }
  res.status(200)
    .json(message);
}

module.exports = success;

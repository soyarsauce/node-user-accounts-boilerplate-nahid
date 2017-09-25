"use strict";

/**
 * Implementation of failure aware rate restriction.
 * 
 * Will intercept monitor requests. After a certain number of failures, it will block for a duration.
 * 
 * Requires ```block-failed``` package.
 * 
 * @param {object} [settings] settings for rate restriction, or null to disable
 * @param {number} settings.blockAttemptMs duration to monitor failure for
 * @param {number} settings.blockAttemptCount number of failures allowed in this duration
 * @param {number} settings.blockDurationMs duration to block for
 * @return {ExpressMiddlewareFunction}
 */
function failure(settings = null)
{
  if (settings)
  {
    let blocker = require('block-failed');

    // decypher config and defaults
    const blockAttemptMs = settings.blockAttemptMs || 60 * 1000;
    const blockAttemptCount = settings.blockAttemptCount || 5;
    const blockDurationMs = settings.blockDurationMs || 5 * 60 * 1000;

    // construct block object
    const block = blocker(blockDurationMs, blockAttemptMs, blockAttemptCount - 1);

    return function (req, res, next)
    {
      let attempted = false;

      block(req.clientIp, (on_failure) =>
      {
        attempted = true;
        res.on('finish', function ()
        {
          if (res.statusCode !== 200)
          {
            on_failure();
          }
        });
        next();
      }, (blockedMs) =>
      {
        if (!attempted)
        {
          res.error(`Operation is disabled due to too many failed attempts. Please try again in ${Math.round(blockedMs / 1000)} seconds`);
        }
      });
    };
  }

  return function (req, res, next)
  {
    next();
  };

}

module.exports = failure;

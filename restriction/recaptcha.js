"use strict";

/**
 * Implementation of reCAPTCHA rate restriction.
 * 
 * Will validate recaptcha using req.body.recaptchaResponse value.
 * 
 * Requires ```node-recaptcha2``` package.
 * 
 * @param {object} [settings] settings for recaptcha, or null to disable
 * @param {string} settings.privateKey also known as secret key
 * @param {string} settings.publicKey also known as site key
 * @return {ExpressMiddlewareFunction}
 */
function recaptcha(settings = null)
{
  if (settings)
  {
    // make sure we have all the settings we need
    const privateKey = settings.privateKey || false;
    const publicKey = settings.publicKey || false;

    if (privateKey && publicKey)
    {
      let Recaptcha = require('node-recaptcha2')
        .Recaptcha;


      return function (req, res, next)
      {
        if (!req.body.recaptchaResponse || typeof req.body.recaptchaResponse !== 'string' || req.body.recaptchaResponse.length < 1)
        {
          return res.error('reCAPTCHA response not included');
        }
        (new Recaptcha(publicKey, privateKey, {
          remoteip: req.clientIp,
          response: req.body.recaptchaResponse
        }))
        .verify((success, errCode) =>
        {
          if (!success)
          {
            res.error('Failed verifying reCAPTCHA');
          }
          else
          {
            next();
          }
        });
      };
    }
  }

  return function (req, res, next)
  {
    next();
  };
}

module.exports = recaptcha;

"use strict";

const Auth = require('./Auth');
const audit = require('../helper/audit');

/**
 * Allows login without any form of credential exchange.
 * 
 * Meant for testing / developer debugging etc.
 */
class NoAuth extends Auth
{

  /**
   * @param {object} options options
   * @param {string} [options.method='nothing'] method name
   * @param {string} options.loginUserId id of user to give access of
   */
  constructor(options = {})
  {
    super(options.method || 'nothing', options);

    /**
     * @type string
     */
    this.loginUserId = options.loginUserId;
  }

  /**
   * Make any request to /<method>/login.json to gain access.
   * 
   * @override
   */
  install(app, prefix)
  {
    app.all(`${prefix}/login.json`, (req, res) =>
    {
      req.login({
        id: this.loginUserId
      }, function (err)
      {
        if (err)
        {
          res.error(`Login failed: ${err}`, audit.LOGIN_FAILURE);
        }
        else
        {
          res.success('Logged in', audit.LOGIN);
        }
      });
    });
  }
}

module.exports = NoAuth;

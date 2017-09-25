"use strict";


const Auth = require('./Auth');
const Strategy = require('passport-facebook')
  .Strategy;

/**
 * OAuth login using facebook login provider
 * 
 * Requires ```passport-facebook``` package.
 */
class FacebookAuth extends Auth
{

  /**
   * @param {object} options see Auth class + additional options for email configuration.
   */
  constructor(options = {})
  {
    super('facebook', options);
    this.description.redirect = true;

    /**
     * OAuth 2 Client ID
     */
    this.facebookClientID = options.facebookClientID;

    /**
     * OAuth 2 Client Secret
     */
    this.facebookClientSecret = options.facebookClientSecret;
  }

  /**
   * @override
   */
  install(app, prefix, passport)
  {
    passport.use(new Strategy({
        clientID: this.facebookClientID,
        clientSecret: this.facebookClientSecret,
        callbackURL: `${prefix}/callback.json`,
        scope: ['email', 'public_profile'],
        state: true,
        passReqToCallback: true,
        proxy: true,
      }, (req, accessToken, refreshToken, profile, done) =>
      this.handleUserLoginByProfile(null, profile, done, req)));

    app.all(`${prefix}/login.json`, passport.authenticate('facebook', {}));

    app.all(`${prefix}/callback.json`, passport.authenticate('facebook', this.authenticateOptions), this.loggedIn(true));
  }

}

module.exports = FacebookAuth;

"use strict";

const Auth = require('./Auth');
const Strategy = require('passport-linkedin-oauth2')
  .Strategy;

/**
 * OAuth login using linkedin login provider
 * 
 * Requires ```passport-linkedin-oauth2``` package.
 */
class LinkedinAuth extends Auth
{

  /**
   * @param {object} options see Auth class + additional options for email configuration.
   */
  constructor(options = {})
  {
    super('linkedin', options);
    this.description.redirect = true;

    /**
     * OAuth 2 Client ID
     */
    this.linkedinClientID = options.linkedinClientID;

    /**
     * OAuth 2 Client Secret
     */
    this.linkedinClientSecret = options.linkedinClientSecret;
  }

  /**
   * @override
   */
  install(app, prefix, passport)
  {
    passport.use(new Strategy({
        clientID: this.linkedinClientID,
        clientSecret: this.linkedinClientSecret,
        callbackURL: `${prefix}/callback.json`,
        scope: ['r_emailaddress', 'r_basicprofile'],
        state: true,
        passReqToCallback: true,
        proxy: true,
      }, (req, accessToken, refreshToken, profile, done) =>
      this.handleUserLoginByProfile(null, profile, done, req)));

    app.all(`${prefix}/login.json`, passport.authenticate('linkedin', {}));

    app.all(`${prefix}/callback.json`, passport.authenticate('linkedin', this.authenticateOptions), this.loggedIn(true));
  }

}

module.exports = LinkedinAuth;

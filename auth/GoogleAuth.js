"use strict";


const Auth = require('./Auth');
const Strategy = require('passport-google-oauth2')
  .Strategy;

/**
 * OAuth login using google login provider
 * 
 * Requires ```passport-google-oauth2``` package.
 */
class GoogleAuth extends Auth
{

  /**
   * @param {object} options see Auth class + additional options for email configuration.
   */
  constructor(options = {})
  {
    super('google', options);
    this.description.redirect = true;

    /**
     * OAuth 2 Client ID
     */
    this.googleClientID = options.googleClientID;

    /**
     * OAuth 2 Client Secret
     */
    this.googleClientSecret = options.googleClientSecret;
  }

  /**
   * @override
   */
  install(app, prefix, passport)
  {
    passport.use(new Strategy({
        clientID: this.googleClientID,
        clientSecret: this.googleClientSecret,
        callbackURL: `${prefix}/callback.json`,
        scope: ['email', 'profile'],
        state: true,
        passReqToCallback: true,
        proxy: true,
      }, (req, accessToken, refreshToken, profile, done) =>
      this.handleUserLoginByProfile(null, profile, done, req)));

    app.all(`${prefix}/login.json`, passport.authenticate('google', {}));

    app.all(`${prefix}/callback.json`, passport.authenticate('google', this.authenticateOptions), this.loggedIn(true));
  }

}

module.exports = GoogleAuth;

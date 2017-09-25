"use strict";


const Auth = require('./Auth');
const Strategy = require('passport-github2')
  .Strategy;

/**
 * OAuth login using githuhb login provider
 * 
 * Requires ```passport-github2``` package.
 */
class GithubAuth extends Auth
{
  /**
   * @param {object} options see Auth class + additional options for email configuration.
   */
  constructor(options = {})
  {
    super('github', options);
    this.description.redirect = true;
    /**
     * OAuth 2 Client ID
     */
    this.githubClientID = options.githubClientID;
    /**
     * OAuth 2 Client Secret
     */
    this.githubClientSecret = options.githubClientSecret;
  }

  /**
   * @override
   */
  install(app, prefix, passport)
  {
    passport.use(new Strategy({
        clientID: this.githubClientID,
        clientSecret: this.githubClientSecret,
        callbackURL: `${prefix}/callback.json`,
        passReqToCallback: true,
        proxy: true,
      }, (req, accessToken, refreshToken, profile, done) =>
      this.handleUserLoginByProfile(null, profile, done, req)));

    app.all(`${prefix}/login.json`, passport.authenticate('github', {
      scope: ['user:email']
    }));

    app.all(`${prefix}/callback.json`, passport.authenticate('github', this.authenticateOptions), this.loggedIn(true));
  }

}

module.exports = GithubAuth;

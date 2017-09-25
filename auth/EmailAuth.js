"use strict";

const audit = require('../helper/audit');
const failureImpl = require('../restriction/failure');
const generatePassword = require('../fields/strongPassword').generate;
const json = require('body-parser')
  .json();
const recaptchaImpl = require('../restriction/recaptcha');

const Auth = require('./Auth');
const LocalStrategy = require('passport-local');

/**
 * Email based login.
 *
 * Requies ```passport-local``` package.
 */
class EmailAuth extends Auth
{

  /**
   * @param {object} options see Auth class + additional options for email configuration.
   * @property {number} [options.tokenExpxiryMinutes=10] number of minutes to restrict token exchange to for passwordless login
   */
  constructor(options = {})
  {
    super('email', options);

    /**
     * Instance of email sender class for sending emails.
     *
     * If this is not specified, email login is disabled.
     *
     * @type {EmailSender}
     */
    this.emailSender = options.emailSender;

    /**
     * Instance of crypt class for encrypting and verifying passwords.
     *
     * @type {Crypt}
     */
    this.crypt = options.crypt;

    /**
     * Name of application.
     * Used for sending email.
     * @type {string}
     */
    this.applicationName = options.applicationName || 'Account';

    /**
     * Email from address
     * Used for sending email.
     * @type {string}
     */
    this.fromAddress = options.fromAddress || 'no-thanks@reply-factory.com';

    this.description.usesPassword = true;
    this.description.tokenExpiryMinutes = options.tokenExpiryMinutes || 10;

    /**
     * @private
     */
    this.tokenExpiryMilliseconds = this.description.tokenExpiryMinutes * 60 * 1000;

    /**
     * Settings for rate limiting failed requests.
     *
     * Note: use this or recaptcha.
     */
    this.block = options.block || undefined;

    /**
     * Settings for rate limiting through recaptcha.
     *
     * Note: use this or recaptcha.
     */
    this.recaptcha = options.recaptcha || undefined;


    if (this.recaptcha)
    {
      if (this.recaptcha.publicKey)
      {
        this.description.recaptcha = this.recaptcha.publicKey;
      }
      else
      {
        this.recaptcha = undefined;
      }
    }

    /**
     * If true, it remembers any passwords specified registration.
     */
    this.allowPasswordSettingDuringRegistration = options.allowPasswordSettingDuringRegistration || false;


    /**
     * login security tokens
     * @protected
     */
    this.tokens = {};
  }

  /**
   * logs users in based on token or based on username(email)/password
   */
  async strategyImpl(req, username, password, done)
  {
    const tokens = this.tokens;

    // call if unsuccessful
    function error(msg, detailed = undefined)
    {
      req.audit(audit.LOGIN_FAILURE, msg, detailed);
      if (typeof msg === 'string')
      {
        msg = {
          error: msg
        };
      }
      done(null, msg);
    }

    // expire aged tokens
    const now = Date.now();

    for (let tok in tokens)
    {
      if (now >= tokens[tok].expires)
      {
        delete tokens[tok];
      }
    }

    // passwordless login
    if (tokens[username])
    {
      if (tokens[username].password === password)
      {
        const profile = await this.createProfileFromCredential(username, tokens[username].extra);

        delete tokens[username];

        this.handleUserLoginByProfile(username, profile, done, req);
      }
      // else
      // {
      //   error('Temporary Login password did not match.', username);
      // }
    }
    // else // username / password login
    // {
    const user = this.findUser(username);

    if (user && user.credentials) // if found, log in found account
    {
      for (let credential of user.credentials)
      {
        if (credential.type === this.method && credential.value === username && user.password)
        {
          this.crypt.verify(password, user.password)
            .then((verified) =>
            {
              if (verified)
              {
                done(null, user);
              }
              else
              {
                error('Email and password combination not found.', username);
              }
            }, done);

          return;
        }
      }
    }
    error('Email and password combination not found.', username);
    // }
  }

  /**
   * sends temporary login password to email address
   */
  async passwordlessImpl(req, res)
  {
    const tokens = this.tokens;
    try
    {
      const username = req.body.username;

      if (!req.body.username || typeof req.body.username !== 'string')
      {
        return res.error('Username not specified', audit.LOGIN_FAILURE);
      }
      const temporaryPassword = generatePassword();
      const theme = req.params.theme || 'login';

      await this.sendTemporaryPassword(theme, username, temporaryPassword, this.description.tokenExpiryMinutes, req.body.loginLinkPrefix);
      tokens[username] = {
        password: temporaryPassword,
        expires: Date.now() + this.tokenExpiryMilliseconds,
        extra: req.body,
      };
      res.success('A login email has been sent to email address.', audit.LOGIN, username);
    }
    catch (e)
    {
      console.log(e);
      res.error('Error sending email. Please verify that your address is correct and is valid.', audit.LOGIN_FAILURE.e);
    }
  }

  /**
   * @override
   */
  install(app, prefix, passport)
  {
    // Protect methods with restriction.
    // Verify does not need it as we are doing simple memory lookup in  small
    // sized table. May still be an issue unless we receive enough registrations
    // to fill up memory.
    const limit = this.block ? failureImpl(this.block) : recaptchaImpl(this.recaptcha);

    passport.use(new LocalStrategy({
      passReqToCallback: true,
    }, this.strategyImpl.bind(this)));

    app.all([`${prefix}/login.json`,
        `${prefix}/verify.json`
      ],
      json,
      limit,
      passport.authenticate('local', this.authenticateOptions),
      this.loggedIn());

    // PASSWORDLESS LOGIN

    if (this.emailSender)
    {
      app.all(`${prefix}/:theme.json`, json, limit, this.passwordlessImpl.bind(this));
    }
  }

  /**
   * helper method that creates a profile object from a credential address
   */
  async createProfileFromCredential(id, extra = {})
  {
    const profile = await super.createProfileFromCredential(id, extra);

    if (extra.password && this.crypt)
    {
      profile.password = await this.crypt.hash(extra.password);
    }

    return profile;
  }

  /**
   * Override of helper method that inserts password into produced user
   * if allowed by setting.
   *
   * @override
   */
  createUserFromProfile(profile)
  {
    // we allow password setting
    let user = super.createUserFromProfile(profile);

    if (profile.password && this.allowPasswordSettingDuringRegistration)
    {
      user.password = profile.password;
    }

    return user;
  }

  /**
   * Helper method that sends temporary password to an email address for rego/login.
   *
   * Should be able to override this to specify custom formats for email.
   *
   * @param {string} theme register | recover | passwordless etc. anything other than login or verify
   * @param {string} to target email address
   * @param {string} password temporary login token
   * @param {number} expireMinutes number of minutes after which this login token will expire
   * @param {string} [loginLinkPrefix] forward url for any links in email
   */
  sendTemporaryPassword(theme, to, password, expireMinutes, loginLinkPrefix)
  {
    let subject = `${this.applicationName}`;

    switch (theme)
    {
    case 'register':
      subject += ' Registration';
      break;
    case 'recover':
      subject += ' Account Recovery';
      break;
    default:
      subject += ' Login';
      break;
    }

    let message = '';

    message += `<p>You have received this email because someone requested access to the ${this.applicationName} using this email address.</p>\n`;

    if (theme === 'register' && loginLinkPrefix)
    {
      message += `<p>Use the following link to verify this email address and complete your registration: <a href="${loginLinkPrefix}${password}">verify</a>.</p>\n`;
    }
    else if (theme === 'recover' && loginLinkPrefix)
    {
      message += `<p>Use the following link to log into the system to change your password: <a href="${loginLinkPrefix}${password}">login</a>.</p>\n`;
    }
    else
    if (loginLinkPrefix)
    {
      message += `<p>Use the following link to log into the system: <a href="${loginLinkPrefix}${password}">login</a>.</p>\n`;
      message += `<p>Alternatively, you can use the following password: ${password}</p>\n`;
      message += `<p>Note: this link and password will expire within ${expireMinutes} minutes of request time.</p>\n`;
    }
    else
    {
      message += `<p>Use the following password to log into the system: ${password}</p>\n`;
      message += `<p>Note: this password will expire within ${expireMinutes} minutes of request time.</p>\n`;
    }
    message += `<p>If this is not you, please contact system administrators.</p>\n`;
    message += `<p>Kind Regards,</p>\n`;
    message += `<p>${this.applicationName} Team</p>\n`;
    message += `<p></p>\n`;
    message += `<p>WARNING: This is an automaticly generated email. Do not reploy to it.</p>\n`;

    return this.emailSender.send(to, this.fromAddress, subject, message);
  }
}

module.exports = EmailAuth;

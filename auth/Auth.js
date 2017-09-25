"use strict";

const audit = require('../helper/audit');
const generateId = require('../helper/generateId');

/**
 * Authenticator/passport strategy wrapper abstraction.
 *
 * I.e. it is the parent class of all auth classes.
 */
class Auth
{

  /**
   * @param {string} method
   * @param {object} options common options for all auth classes; see properties
   */
  constructor(method, options)
  {

    /**
     * Authentication method name. E.g. 'email' for Email based authentication.
     * This is used as an unique id for various things.
     * @type string
     */
    this.method = method;

    /**
     * This is a standard descriptor of this authentication mechanism that is publicly shared.
     * Clients should use this to figure out how to use a login auth from outside.
     *
     * Not directly configurable.
     *
     * @type object
     */
    this.description = {
      method: this.method
    };

    /**
     * Additional settings given to passport.authenticate.
     *
     * Not directly configurable.
     *
     * @type object
     */
    this.authenticateOptions = {
      failureMessage: 'login failed',
      badRequestMessage: 'XXX'
    };

    /**
     * Users collection.
     *
     * Note: various things all assume that a CachedCollection is being used.
     *
     * @type {CachedCollection}
     */
    this.users = options.users || options.collection;

    /**
     * Default roles new registered users should assume.
     *
     * @type {object}
     */
    this.defaultRoles = options.defaultRoles || {};

    /**
     * Custom fields
     *
     * @type {object}
     */
    this.custom = options.custom || {};

    //~ /**
    //~ * Instance of email sender class for sending emails.
    //~ *
    //~ * @type {EmailSender}
    //~ */
    //~ this.emailSender = options.emailSender;


    //~ this.defaultNotificationInterval = options.defaultNotificationInterval || -1;

    //~ if (options.recaptcha)
    //~ {
    //~ this.description.recaptcha = true;
    //~ }
  }

  /**
   * Must be overridden to provide implementation of said authentication method.
   * @param {ExpressApplication} app express application
   * @param {string} prefix all route prefix
   * @param {Passport} passport passport class
   * @abstract
   */
  install(app, prefix, passport)
  {
    throw new Error('TODO: ABSTRACT');
  }

  /**
   * Helper method that finds an user based on a credential.
   *
   * A credential is something like an email address or a facebook user id.
   *
   * This is something that uniquely identifies an account.
   *
   * @param {string} value
   * @return {User|false}
   */
  findUser(value)
  {
    const users = this.users.lookup;

    for (let userId in users)
    {
      let user = users[userId];
      let credentials = (user.credentials || [])
        .filter((credential) => credential.type === this.method && credential.value === value);

      if (credentials.length > 0)
      {
        return user;
      }
    }

    return false;
  }

  /**
   * Helper method for SSO type logins.
   *
   * This method finds existing or creates new accounts basen on profile
   * information returned from oauth partner.
   *
   * @param {string} username unique id
   * @param {Profile} profile unique id
   * @param {Function} done callback to call when our work is done
   * @param {Request} [req] request object
   */
  handleUserLoginByProfile(username, profile, done, req = undefined)
  {
    username = username || profile.id;
    // find an account
    let user = this.findUser(username);

    if (user) // if found, log in found account
    {
      done(null, user);
    }
    else // if not found, make a new user and log new user in
    {
      user = this.createUserFromProfile(profile);
      this.users.createRecord(user)
        .then((user) =>
        {
          req && req.audit(audit.ACCOUNT_CREATE, JSON.stringify({
            user,
            profile
          }));
          done(null, user);
        }, done);
    }
  }

  /**
   * Helper method that creates an User object from a Profile
   *
   * @param {Profile} profile
   * @return {User}
   */
  createUserFromProfile(profile)
  {
    let user = {
      // unique id
      // can't use id from profile as these might conflict across login providers
      id: generateId(),
      // login credentials
      credentials: [{
        type: this.method,
        value: profile.id
      }],
      // new user roles
      roles: this.defaultRoles,
      // profile bs
      displayName: profile.displayName,
      //~ name: profile.name,
      photos: profile.photos,
      //~ // notification settings
      //~ notifications: [],
      //~ notificationInterval: -1,
      //~ notificationLastSent: 0,
      //~ notificationSubscriptions: {},
    };

    for (let field in this.custom)
    {
      if (this.custom[field].derive)
      {
        let value = this.custom[field].derive(profile);

        if (value)
        {
          user[field] = value;
        }
      }
    }

    return user;
  }

  /**
   * helper method that creates a profile object from a credential address
   */
  async createProfileFromCredential(id, extra = {})
  {
    if (!id)
    {
      throw new Error(`id not specified: ${id}`);
    }
    // we don't accept spaces in id
    id = id.replace(/\s+/g, '');
    if (!id)
    {
      throw new Error(`id not specified: ${id}`);
    }
    let displayName = extra.displayName || (id.indexOf('@') !== -1 && id.substr(0, id.indexOf('@'))) || id;
    let user = {
      id,
      displayName
    };
    return user;
  }

  /**
   * Helper method that produces a middleware to handle successful logged in
   * case.
   *
   * @param {boolean} [redirect=false] redirect based login is used
   * @return {ExpressMiddleware}
   */
  loggedIn(redirect = false)
  {
    if (redirect && typeof redirect !== 'string')
    {
      redirect = '/';
    }

    return function (req, res)
    {
      // if not req.user.id then it is not a real use
      // i.e. we are forwarding error or custom payload
      if (!req.user.id)
      {
        res.error(req.user.error, audit.LOGIN_FAILURE);
        req.logout();
      }
      else
      {
        // otherwise, we make a fuss about logging in
        res.audit(audit.LOGIN, `Logged in via ${this.method}`, JSON.stringify({
          id: req.user.id,
          displayName: req.user.displayName,
          roles: req.user.roles
        }));

        // for redirect based login methods, we redirect back to some url
        if (redirect)
        {
          res.redirect(redirect);
        }
        else
        {
          // otherwise we return a login success message
          res.success(`Logged in via ${this.method}`, audit.LOGIN);
        }
      }
    }.bind(this);
  }

}

module.exports = Auth;

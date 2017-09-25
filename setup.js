"use strict";

const audit = require('./helper/audit');
const access = require('./helper/access');
const bootstrap = require('./helper/bootstrap');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const json = require('body-parser')
  .json();
const parseFilters = require('./filters/parse');
const passport = require('passport');

const CollectionSessionStore = require('./session/CollectionSessionStore');
const MemorySessionStore = require('./session/MemorySessionStore');

const passwordField = require('./fields/password');
const defaultFields = require('./fields/defaultFields');

/**
 * Library entry point
 *
 * @param {Express} app result of express()
 * @param {Config} config configuration
 */
function setup(app, config)
{
  // PASSPORT BOILERPLATE
  app.use(bootstrap(app, config));
  app.use(cookieParser());
  app.use(expressSession({
    secret: Math.round(Date.now() / 1000 / 3600 / 24)
      .toString(16),
    resave: true,
    saveUninitialized: false,
    store: config.sessions ? new CollectionSessionStore(config.sessions, config) : new MemorySessionStore(config),
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  config.users = config.users || config.collection;

  // User serialisation
  passport.serializeUser(function (user, done)
  {
    done(null, user.id || 'none');
  });
  passport.deserializeUser(function (user, done)
  {
    done(null, config.users.lookup[user] || {});
  });

  // API endpoint
  config.prefix = config.prefix || '/api/accounts';
  config.fields = config.fields || {};
  for (let field in defaultFields)
  {
    if (!config.fields[field])
    {
      config.fields[field] = defaultFields[field];
    }
  }

  // setup APIs
  setupAuthAPI(app, config);
  setupAccountsAPI(app, config);
}

function setupAuthAPI(app, config)
{
  const prefix = config.prefix;

  // login/registration
  const methods = [];

  for (let auth of config.auth || [])
  {
    methods.push(auth.description);
    auth.install(app, `${prefix}/${auth.method}`, passport);
    if (auth.description.usesPassword && !config.fields.password)
    {
      config.fields.password = passwordField;
    }
  }
  app.get(`${prefix}/methods.json`, (req, res) =>
  {
    res.json(methods);
  });

  const fields = summariseFields(config.fields);
  app.get(`${prefix}/fields.json`, (req, res) =>
  {
    res.json(fields);
  });

  // self read
  app.get(`${prefix}/current.json`, (req, res) =>
  {
    if (req.user && req.user.id)
    {
      res.json(summariseUserRecord(req.user, config.fields));
    }
    else
    {
      res.json(false);
    }
  });

  // self update
  app.put(`${prefix}/current.json`, access.LOGGEDIN, json, async (req, res) =>
  {
    let user = req.user;
    if (req.body)
    {
      try
      {
        await updateUserRecord(user, req.body || {}, user, config);
        res.resolve(config.users.updateRecord(user), 'Done', audit.ACCOUNT_CHANGE);
      }
      catch (e)
      {
        res.error(e.message, `${audit.ACCOUNT_CHANGE}_FAILURE`)
      }
    }
  });

  // logout
  app.all(`${prefix}/logout.json`, (req, res) =>
  {
    res.success('Logged out', audit.LOGOUT);
    req.logout();
    req.session.destroy();
  });
}

function setupAccountsAPI(app, config)
{
  // ACCOUNT MANAGEMENT API
  const prefix = config.prefix;
  const collection = config.users;

  // discover
  const USER_DATA_ACCESS = access.ROLE_ONE_OF(config.administratorRoles || {});

  app.all(`${prefix}/search.json`, USER_DATA_ACCESS, (req, res) =>
  {
    let query = parseFilters(collection.searchMeta, req.query);
    res.resolve(collection.searchRecords(query), false, audit.ACCOUNT_SEARCH, JSON.stringify(query));
  });

  app.post(`${prefix}/:user.json`, USER_DATA_ACCESS, json, async (req, res) =>
  {
    try
    {
      let auth = config.auth.filter(auth => auth.method === req.body.type)[0];
      let user = auth.findUser(req.body.value);
      if (user)
      {
        throw new Error('user already exists');
      }
      let profile = await auth.createProfileFromCredential(req.body.value, req.body);
      user = auth.createUserFromProfile(profile);
      user = await config.users.createRecord(user);
      res.success({success: 'Created!', user}, audit.ACCOUNT_CREATE + audit.SUCCESS);
    }
    catch (e)
    {
      res.audit(audit.ACCOUNT_CREATE + audit.FAILURE, e.message, JSON.stringify(req.body));
      res.error('Account creation failed')
    }
  });

  // read
  app.get(`${prefix}/:user.json`, USER_DATA_ACCESS, (req, res) =>
  {
    let query = {};
    query[collection.primaryKey] = req.params.user;

    collection.readRecord(query)
      .then((user) =>
      {
        res.json(summariseUserRecord(user, config.fields, {credentials: true}));
        res.audit(audit.ACCOUNT_READ + audit.SUCCESS, JSON.stringify(query));
      }, res.reject(audit.ACCOUNT_READ + audit.FAILURE), JSON.stringify(query));
  });

  // update
  app.put(`${prefix}/:user.json`, USER_DATA_ACCESS, json, (req, res) =>
  {
    let query = {};

    query[collection.primaryKey] = req.params.user;
    collection.readRecord(query)
      .then(async (record) =>
      {
        let params = Object.keys(req.body);

        params = JSON.stringify(Object.assign({
          params
        }, query));
        try
        {
          await updateUserRecord(record, req.body, req.user, config);
          res.resolve(collection.updateRecord(record), 'Done', audit.ACCOUNT_UPDATE, params);
        }
        catch (e)
        {
          res.error(e.message, audit.ACCOUNT_UPDATE + audit.FAILURE, params);
        }
      }, res.reject(audit.ACCOUNT_UPDATE + audit.FAILURE, JSON.stringify(query)));
  });

  // delete
  app.delete(`${prefix}/:user.json`, USER_DATA_ACCESS, (req, res) =>
  {
    let query = {};

    query[collection.primaryKey] = req.params.user;
    if (req.params.user !== req.user.id)
    {
      res.resolve(collection.deleteRecord(query), 'User deleted', audit.ACCOUNT_DELETE, JSON.stringify(req.params));
    }
    else
    {
      res.error("Can't delete yourself", audit.ACCOUNT_DELETE + audit.FAILURE);
    }
  });

}

function summariseUserRecord(user, fields, addiionalToInclude={})
{
  const output = {};
  for (let field in user)
  {
    const meta = fields[field];
    if (meta)
    {
      if (meta.mask)
      {
        output[field] = true;
      }
      else
      {
        output[field] = user[field];
      }
    }
    else if (addiionalToInclude[field])
    {
      output[field] = user[field];
    }
  }
  output.roles = user.roles;
  return output;
}

async function updateUserRecord(user, update, loginUser, config)
{
  for (let field in update)
  {
    const meta = config.fields[field];
    if (meta)
    {
      const value = update[field];

      if (meta.self === false && loginUser.id === user.id)
      {
        throw new Error(`Can't update your own ${field}`);
      }

      await meta.assign(user, field, value, meta, loginUser, config);
      continue;
    }
    else
    {
      throw new Error(`${field} not editable`);
    }
  }
}

function summariseFields(inputFields)
{
  let fields = Object.keys(inputFields).map(field =>
  {
    return {
      name: field,
      order: inputFields[field].order || 10,
      type: inputFields[field].type || 'string',
      self: inputFields[field].self !== undefined? inputFields[field].self : true,
      admin: inputFields[field].admin !== undefined? inputFields[field].admin : true,
      enabled: inputFields[field].enabled !== undefined? inputFields[field].enabled : true,
    };
  });
  fields.sort(function(a, b)
  {
    if (a.order !== b.order)
    {
      return a.order - b.order;
    }
    else
    {
      if (a.name < b.name)
      {
        return -1
      }
      else
      {
        return 1;
      }
    }
  });
  return fields;
}

module.exports = setup;

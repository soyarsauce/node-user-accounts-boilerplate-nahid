const requestIp = require('request-ip');
const success = require('./success');
const error = require('./error');
const audit = require('./audit');
const resolve = require('./resolve');
const reject = require('./reject');

/**
 * Out boilerplate to make things easier.
 * 
 * @return {ExpressMiddleware} a middleware that will attach a bunch of convenience properties and functions to req and res.
 */
function bootstrap(app, config)
{
  // helper function
  config.audit = config.audit || app.audit || audit;
  app.audit = config.audit;

  return function (req, res, next)
  {
    req.clientIp = requestIp.getClientIp(req);
    req.audit = res.audit = function ()
    {
      let source = `${req.user ? req.user.id : 'anonymous'}@${req.clientIp}`;

      app.audit.apply(null, [source].concat(Array.prototype.slice.call(arguments)));
    };
    res.success = success.bind(null, res);
    res.error = error.bind(null, res);
    res.reject = reject.bind(null, res);
    res.resolve = resolve.bind(null, res);
    next();
  }
}

module.exports = bootstrap;

"use strict";

const AUDIT_PERMISSION_ERROR = 'SESSION_PERMISSION_ERROR';

module.exports.AUDIT_PERMISSION_ERROR = AUDIT_PERMISSION_ERROR;

/**
 * Express middleware for blocking non-logged in users
 */
module.exports.LOGGEDIN = function (req, res, next)
{
  if (req.user)
  {
    return next();
  }
  res.error('Must be logged in', AUDIT_PERMISSION_ERROR);
};

/**
 * Express middleware generator for blocking non-logged in users or users that do not have one of the specified roles
 * @param {object} roles map of roles
 * @return {ExpressMiddlewareFunction}
 */
module.exports.ROLE_ONE_OF = function (roles)
{
  return function (req, res, next)
  {
    if (req.user)
    {
      let userRoles = req.user.roles || {};

      for (let role in userRoles)
      {
        if (userRoles[role] && roles[role])
        {
          return next();
        }
      }
      req.audit(AUDIT_PERMISSION_ERROR, 'MUST HAVE', JSON.stringify(roles), 'HAVE', JSON.stringify(req.user && req.user.roles || null));
      res.error('Must have access');
    }
    else
    {
      res.error('Must be logged in', AUDIT_PERMISSION_ERROR);
    }
  };
};

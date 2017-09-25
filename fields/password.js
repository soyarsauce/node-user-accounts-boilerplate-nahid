"use strict";

module.exports.order = 50;
module.exports.type = 'string';
module.exports.mask = true;
module.exports.assign = async function(user, field, value, fieldMeta, loginUser, config)
{
  if (loginUser.id !== user.id || typeof value === 'boolean' || value === '')
  {
    delete user[field];
    return
  }

  if (typeof value !== this.type)
  {
    throw new Error(`${field} value is not ${this.type}`);
  }

  if (value.length === 0)
  {
    throw new Error(`${field} value is empty`);
  }

  if (!config.crypt)
  {
    throw new Error('A crypt is not configured');
  }

  const hash = config.crypt.hash(value);

  user[field] = hash;
};

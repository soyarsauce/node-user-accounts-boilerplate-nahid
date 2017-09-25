"use strict";

module.exports.order = 100;
module.exports.type = 'object';
module.exports.self = false;
module.exports.assign = async function(user, field, value, fieldMeta, loginUser, config)
{
  user[field] = value;
};

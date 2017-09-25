
module.exports.order = 1000;
module.exports.type = 'string';
module.exports.assign = async function(user, field, value, fieldMeta, loginUser)
{
  throw new Error(`${field} is disabled.`);
};
module.exports.enabled = false;

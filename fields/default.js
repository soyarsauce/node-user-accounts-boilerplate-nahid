
module.exports.order = 0;
module.exports.type = 'string';
module.exports.assign = async function(user, field, value, fieldMeta, loginUser)
{
  if (typeof value !== this.type)
  {
    throw new Error(`${field} value is not ${this.type}`);
  }
  user[field] = value;
};

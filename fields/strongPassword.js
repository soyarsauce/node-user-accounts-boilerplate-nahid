"use strict";

const password = require('./password');

module.exports = Object.assign({}, password);

module.exports.assign = async function(user, field, value, fieldMeta, loginUser, config)
{
  if (typeof value === 'string' && value !== '')
  {
    this.checkStrongPassword(value);
  }
  await password.assign.call(this, user, field, value, fieldMeta, loginUser, config);
};

const sequences = [
  'abcdefghijklmnopqrstuvwxyz',
  'pyfgcrlaoeuidhtnsqjkxbmwvz',
  '0123456789',
  'qwertyuiop[]asdfghjkl;\'zxcvbnm,./',
  '!@#$%^&*()_+'
];

function findMaxSequenceSize(password)
{
  var maxSequence = 0;

  password = password.toLowerCase();

  sequences.forEach(function(sequence)
  {
    var converted = Array.prototype.map.call(password, function(c)
    {
      return sequence.indexOf(c);
    });
    var progressiveSize = 1;
    var sameSize = 1;
    for (var x = 1; x < converted.length; x++)
    {
      if (converted[x] === converted[x - 1] && converted[x] !== -1)
      {
        sameSize++;
      }
      else
      {
         if (sameSize > maxSequence)
         {
           maxSequence = sameSize;
         }
         sameSize = 1;
      }
      if (converted[x] === converted[x - 1] + 1 && converted[x - 1] !== -1)
      {
        progressiveSize++;
      }
      else
      {
         if (progressiveSize > maxSequence)
         {
           maxSequence = progressiveSize;
         }
         progressiveSize = 1;
      }
    }
    if (sameSize > maxSequence)
    {
      maxSequence = sameSize;
    }
    if (progressiveSize > maxSequence)
    {
      maxSequence = progressiveSize;
    }
  });
  return maxSequence;
}

module.exports.checkStrongPassword = function(password)
{
  if (password.length > 12)
  {
    return true;
  }

  if (!password || password.length < 10)
  {
    throw new Error('Password must be provided and must be at least 10 characters. Must consist of lowercase, uppercase letters, numbers, symbols. Must not contain spaces. Must not be sequential.');
  }

  if (!password.match(/[a-z]+/))
  {
    throw new Error('Password must consist of lowercase, uppercase letters, numbers and symbols.');
  }

  if (!password.match(/[A-Z]+/))
  {
    throw new Error('Password must consist of lowercase, uppercase letters, numbers and symbols.');
  }

  if (!password.match(/[0-9]+/))
  {
    throw new Error('Password must consist of lowercase, uppercase letters, numbers and symbols.');
  }

  if (!password.match(/[^a-zA-Z0-9]+/))
  {
    throw new Error('Password must consist of lowercase, uppercase letters, numbers and symbols.');
  }

  if (password.match(/\s+/))
  {
    throw new Error('Password must not consist whitespace characters');
  }

  if (findMaxSequenceSize(password) > 2)
  {
    throw new Error('Password must not consist of sequences of size greater than 2.');
  }

  return true;
}

/**
 * generate strong password
 * @param {number} [length=10] length of password to generate
 * @return {string}
 */
module.exports.generate = function generate(length = 10)
{
  const groups = [
    '0123456789',
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGJIJKLMNOPQRSTUVWXYZ',
    '!@$%^*_'
  ];

  let availableOrder = [0, 1, 2, 3];
  let order = [];

  while (availableOrder.length > 0)
  {
    order.push(availableOrder.splice(Math.floor(Math.random() * availableOrder.length), 1)[0]);
  }

  let password = '';

  for (let i = 0; i < length; i++)
  {
    let currentGroup = groups[i % groups.length];

    password += currentGroup[Math.floor(Math.random() * currentGroup.length)];
  }

  return password;
}

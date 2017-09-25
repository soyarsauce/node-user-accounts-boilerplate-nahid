"use strict";

/**
 * An email filter validates an email address
 */
class EmailFilter
{

  /**
   * @param {string} name name of filter
   */
  constructor(name)
  {

    /**
     * name of filter
     * @type {string}
     */
    this.name = name;
  }

  /**
   * @param {string} address_ address to validate
   */
  async doesAllow(address_)
  {
    throw new Error('TODO: Implement filter');
  }
}

module.exports = EmailFilter;

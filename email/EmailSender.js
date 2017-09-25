"use strict";

/**
 * An email sender sends an email
 */
class EmailSender
{
  constructor()
  {

    /**
     * Filters to validate address with before sending emails to.
     * @type {Array<EmailFilter>}
     */
    this.filters = [];
  }

  /**
   * Send an email. This performs various checks and calls sendImplementation
   * 
   * @param {string} to where to send email
   * @param {string} from reply address
   * @param {string} subject subject of email
   * @param {string} body content of email
   */
  async send(to, from, subject, body)
  {
    for (let filter of this.filters)
    {
      if (!await filter.doesAllow(to))
      {
        throw new Error(`${filter.name} does not allow specified email address: '${to}'.`);
      }
    }
    await this.sendImplementation(to, from, subject, body);
  }

  /**
   * @abstract
   * 
   * @param {string} to where to send email
   * @param {string} from reply address
   * @param {string} subject subject of email
   * @param {string} body content of email
   */
  async sendImplementation(to_, from_, subject_, body_)
  {
    throw new Error('TODO: not implemented');
  }
}

module.exports = EmailSender;

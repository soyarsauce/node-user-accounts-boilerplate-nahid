"use strict";

const EmailSender = require('./EmailSender');

/**
 * Stub email sending that prints to console instead of sending email.
 */
class NodeEmailSender extends EmailSender
{
  sendImplementation(to, from, subject, body)
  {
    return new Promise((resolve) =>
    {
      console.log('EMAIL FROM:', from);
      console.log('EMAIL TO:', to);
      console.log('EMAIL SUBJECT:', subject);
      console.log('EMAIL BODY:', body);
      resolve();
    });
  }
}

module.exports = NodeEmailSender;

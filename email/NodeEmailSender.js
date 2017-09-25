"use strict";

const EmailSender = require('./EmailSender');
const callback = require('../helper/callback');
let sendmail = require('sendmail');

sendmail = sendmail();

/**
 * Send email using node.js sendmail.
 * 
 * Requires ```sendmail``` package.
 */
class NodeEmailSender extends EmailSender
{
  sendImplementation(to, from, subject, body)
  {
    return callback(sendmail, {
      from,
      to,
      subject,
      html: body,
    });
  }
}

module.exports = NodeEmailSender;

"use strict";

const EmailSender = require('./EmailSender');
const AWS = require('aws-sdk');
const callback = require('../helper/callback');

/**
 * Send email using AWS SES.
 * 
 * Requires ```aws-sdk``` package.
 */
class SESEmailSender extends EmailSender
{
  constructor(region)
  {
    super();
    AWS.config.update({
      region
    });
    this.ses = new AWS.SES({
      apiVersion: '2010-12-01'
    });
  }

  sendImplementation(to, from, subject, body)
  {
    const packet = {
      Source: from,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Html: {
            Data: body,
          }
        }
      }
    };


    return callback(this.ses.sendEmail.bind(this.ses), packet);
  }
}

module.exports = SESEmailSender;

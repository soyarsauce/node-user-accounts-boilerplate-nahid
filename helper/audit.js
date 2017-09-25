"use strict";

/**
 * Fill in method for audit logging
 * 
 * Use as req.audit(...) or res.audit(...)
 * 
 * @param {string} source source of event. e.g. user or ip
 * @param {string} event type of event. e.g. user or ip
 * @param {string} params data associated with event
 */
function audit(source, event, ...params)
{
  try
  {
    console.log('AUDIT', (new Date())
      .toISOString(), source, event, params.join(' '));
  }
  catch (e)
  {
    try
    {
      console.log('Exception during audit', e);
    }
    catch (ee)
    {}
  }
}

/**
 * Audit event type constants.
 */
const notifications = {
  OPERATION_SUCCESS: 'OPERATION_SUCCESS',
  OPERATION_FAILURE: 'OPERATION_FAILURE',
  OPERATION_START: 'OPERATION_START',
  EXCEPTION: 'ERROR_EXCEPTION',
  UNEXPECTED_ERROR: 'ERROR_UNEXPECTED',
  INVALID_REQUEST: 'ERROR_INVALID_REQUEST',
  LOGIN: 'SESSION_LOGIN',
  LOGOUT: 'SESSION_LOGOUT',
  PERMISSION_ERROR: 'SESSION_PERMISSION_ERROR',
  LOGIN_FAILURE: 'SESSION_LOGIN_FAILURE',
  TRACK: 'SESSION_TRACK',
  TIMEOUT: 'SESSION_TIMEOUT',
  ACCOUNT_CHANGE: 'SESSION_ACCOUNT_DETAILS_CHANGE',
  ACCOUNT_CHANGE_PASSWORD: 'SESSION_ACCOUNT_PASSWORD_CHANGE',
  ACCOUNT_CHANGE_PASSWORD_FAILURE: 'SESSION_ACCOUNT_PASSWORD_CHANGE_FAILURE',
  ACCOUNT_SEARCH: 'ACCOUNT_SEARCH',
  ACCOUNT_CREATE: 'ACCOUNT_CREATE',
  ACCOUNT_READ: 'ACCOUNT_READ',
  ACCOUNT_UPDATE: 'ACCOUNT_UPDATE',
  ACCOUNT_DELETE: 'ACCOUNT_DELETE',
  SUCCESS: '_SUCCESS',
  FAILURE: '_FAILURE',
};

for (const k in notifications)
{
  audit[k] = notifications[k];
}

module.exports = audit;

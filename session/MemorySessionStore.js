"use strict";

const Store = require('express-session/session/store');
const defer = require('../helper/defer');

/**
 * In memory session store.
 * 
 * Apparently the default session store is not menat to be used for prouction
 * or something.
 * 
 * Will not scale horizontally.
 */
class MemorySessionStore extends Store
{

  /**
   * @param {object} options see fields
   */
  constructor(options = {})
  {
    super();

    /**
     * In memory sessions list.
     */
    this.sessions = {};

    /**
     * Session dueation
     */
    this.sessionsTTL = options.sessionsTTL || 8 * 60 * 60 * 1000;
  }

  /**
   * clean up expired sessions
   * @protected
   */
  cleanup()
  {
    for (let sessionId in this.sessions)
    {
      let session = this.sessions[sessionId];

      if (session)
      {
        if (session.expires < Date.now())
        {
          delete this.sessions[sessionId];
        }
      }
    }
  }

  /**
   * @override
   */
  get(sessionId, callback)
  {
    this.cleanup();
    defer(callback, null, this.sessions[sessionId]);
  }

  /**
   * @override
   */
  set(sessionId, session, callback)
  {
    this.cleanup();
    this.sessions[sessionId] = session;
    session.expires = Date.now() + this.sessionsTTL;
    defer(callback);
  }

  /**
   * @override
   */
  destroy(sessionId, callback)
  {
    delete this.sessions[sessionId];
    defer(callback);
  }
}

module.exports = MemorySessionStore;

"use strict";

const Store = require('express-session/session/store');
const defer = require('../helper/defer');

/**
 * Drop in replacement for express session store that saves session data in
 * a collection.
 */
class CollectionSessionStore extends Store
{

  /**
   * @param {CachedCollection} collection collection wrapped
   * @param {object} options see fields
   */
  constructor(collection, options = {})
  {
    super();

    /**
     * collection wrapped
     */
    this.collection = collection;

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
    const collection = this.collection;
    const sessions = collection.lookup;

    for (let sessionId in sessions)
    {
      let session = sessions[sessionId];

      if (session)
      {
        if (session.expires < Date.now())
        {
          collection.deleteRecord(session);
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
    defer(callback, null, this.collection.lookup[sessionId]);
  }

  /**
   * @override
   */
  set(sessionId, session, callback)
  {
    this.cleanup();
    session = JSON.parse(JSON.stringify(session));
    session.id = sessionId;

    // let's not send an update to database every time the user makes a request
    const THRESHOLD = this.sessionsTTL / 10;

    session.expires = Math.ceil((Date.now() + this.sessionsTTL) / THRESHOLD) * THRESHOLD;

    if (this.collection.lookup[sessionId] && JSON.stringify(this.collection.lookup[sessionId]) !== JSON.stringify(session))
    {
      this.collection.updateRecord(session);
    }
    else if (!this.collection.lookup[sessionId])
    {
      this.collection.createRecord(session);
    }
    defer(callback);
  }

  /**
   * @override
   */
  destroy(sessionId, callback)
  {
    let session = this.collection.lookup[sessionId];

    if (session)
    {
      this.collection.deleteRecord(session);
    }
    defer(callback);
  }
}

module.exports = CollectionSessionStore;

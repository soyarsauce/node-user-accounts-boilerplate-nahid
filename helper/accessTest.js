"use strict";

const access = require('./access');
const assert = require('assert');

describe(`access.LOGGED_IN`, function ()
{

  it(`not logged in`, function (done)
  {
    access.LOGGEDIN({}, {
      error: () => done()
    })
  });

  it(`logged in`, function (done)
  {
    access.LOGGEDIN({
      user: true
    }, {}, () => done())
  });

});

describe(`access.ROLE_ONE_OF`, function ()
{
  let audtCalled = false;

  beforeEach(function ()
  {
    audtCalled = false;
  });

  function audit()
  {
    audtCalled = true;
  }

  it(`not logged in`, function (done)
  {
    access.ROLE_ONE_OF()({}, {
      error: () => done()
    })
  });

  it(`user no roles`, function (done)
  {
    access.ROLE_ONE_OF({})({
      user: {},
      audit
    }, {
      error: () =>
      {
        if (audtCalled)
        {
          done()
        }
      }
    })
  });

  it(`user no roles`, function (done)
  {
    access.ROLE_ONE_OF({
      role: true
    })({
      user: {},
      audit
    }, {
      error: () =>
      {
        if (audtCalled)
        {
          done()
        }
      }
    })
  });

  it(`config no roles`, function (done)
  {
    access.ROLE_ONE_OF({})({
      user: {
        roles: {
          role: true
        }
      },
      audit
    }, {
      error: () =>
      {
        if (audtCalled)
        {
          done()
        }
      }
    })
  });

  it(`config no roles`, function (done)
  {
    access.ROLE_ONE_OF({
      role: true
    })({
      user: {
        roles: {
          role: true
        }
      },
      audit
    }, {}, () => done())
  });

});

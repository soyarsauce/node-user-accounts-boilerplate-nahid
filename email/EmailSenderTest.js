"use strict";

const Filter = require('./EmailFilter');
const Class = require('./EmailSender');
const assert = require('assert');

class FilterImpl extends Filter
{

  constructor(allow)
  {
    super('stub')
    this.allow = allow;
  }

  async doesAllow(address_)
  {
    return this.allow;
  }

}

describe(Class.name, function ()
{
  let instance;
  let oldSendImplementation = Class.prototype.sendImplementation;

  beforeEach(async function ()
  {
    instance = new Class();
  });

  afterEach(async function ()
  {
    Class.prototype.sendImplementation = oldSendImplementation;
  });

  it(`empty filters`, async function ()
  {
    assert.deepEqual(instance.filters, []);
  });

  it(`abstract implementation`, async function ()
  {
    try
    {
      await instance.sendImplementation('test@localhost', 'test@localhost', 'SUBJECT', 'BODY')
    }
    catch (e)
    {
      return;
    }
    throw new Error('FAIL');
  });

  it(`filter does not allow`, async function ()
  {
    try
    {
      instance.filters.push(new FilterImpl(false))
      await instance.send('test@localhost', 'test@localhost', 'SUBJECT', 'BODY')
    }
    catch (e)
    {
      return;
    }
    throw new Error('FAIL');
  });

  it(`no filters go through`, function (done)
  {
    instance.sendImplementation = () => done()
    instance.send('test@localhost', 'test@localhost', 'SUBJECT', 'BODY')
  });

  it(`filter allows`, function (done)
  {
    instance.sendImplementation = () => done()
    instance.filters.push(new FilterImpl(true))
    instance.send('test@localhost', 'test@localhost', 'SUBJECT', 'BODY')
  });
});

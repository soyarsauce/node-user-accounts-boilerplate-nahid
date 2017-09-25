"use strict";

const Store = require('./CollectionSessionStore');
const tester = require('./sessionStoreTester');

class Collection
{
  constructor()
  {
    this.lookup = {};
  }
  async createRecord(record)
  {
    this.lookup[record.id] = record;
  }
  async deleteRecord(record)
  {
    delete this.lookup[record.id];
  }
}

tester(() => new Store(new Collection()));

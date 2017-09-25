"use strict";

const parse = require('./parse');
const assert = require('assert');

// mirror of error
describe(`parse`, function ()
{
  it(`defaults`, function ()
  {
    assert.deepEqual(parse({}, {}), {
      offset: 0,
      limit: 20,
      filter: [],
      sort: false,
      order: 'asc',
      extra: [],
      returnFacets: false
    })
  })

  it(`facets`, function ()
  {
    assert.equal(parse({}, {})
      .returnFacets, false)
    assert.equal(parse({
        facets: true
      }, {
        facets: false
      })
      .returnFacets, true)
    assert.equal(parse({
        facets: true
      }, {
        facets: true
      })
      .returnFacets, true)
  })

  it(`extra`, function ()
  {
    assert.deepEqual(parse({}, {})
      .extra, [])
    assert.deepEqual(parse({}, {
        extra: 'a'
      })
      .extra, ['a'])
    assert.deepEqual(parse({}, {
        extra: 'a|b'
      })
      .extra, ['a', 'b'])
  })

  it(`limit`, function ()
  {
    assert.deepEqual(parse({}, {})
      .limit, 20)
    const limit = {
      minimum: 30,
      default: 45,
      maximum: 60
    };
    assert.deepEqual(parse({
        limit
      }, {})
      .limit, 45)
    assert.deepEqual(parse({
        limit
      }, {
        limit: 100
      })
      .limit, 60)
    assert.deepEqual(parse({
        limit
      }, {
        limit: 0
      })
      .limit, 30)
  })

  it(`sort`, function ()
  {
    assert.deepEqual(parse({}, {})
      .sort, false)
    const sort = ['a', 'b'];
    assert.deepEqual(parse({
        sort
      }, {
        sort: ''
      })
      .sort, false)
    assert.deepEqual(parse({
        sort
      }, {
        sort: 'a'
      })
      .sort, 'a')
    assert.deepEqual(parse({
        sort
      }, {
        sort: 'b'
      })
      .sort, 'b')
    assert.deepEqual(parse({
        sort
      }, {
        sort: 'c'
      })
      .sort, false)
  })

  it(`order`, function ()
  {
    assert.deepEqual(parse({}, {})
      .order, 'asc')
    assert.deepEqual(parse({}, {
        order: ''
      })
      .order, 'asc')
    assert.deepEqual(parse({}, {
        order: 'asc'
      })
      .order, 'asc')
    assert.deepEqual(parse({}, {
        order: 'dsc'
      })
      .order, 'dsc')
    assert.deepEqual(parse({}, {
        order: 'desc'
      })
      .order, 'dsc')
  })

  it(`offset`, function ()
  {
    assert.deepEqual(parse({}, {})
      .offset, 0)
    assert.deepEqual(parse({}, {
        offset: -99
      })
      .offset, 0)
    assert.deepEqual(parse({}, {
        offset: 50000
      })
      .offset, 50000)
    assert.deepEqual(parse({}, {
        offset: '2'
      })
      .offset, 2)
  })

  const fields = {
    fields: {
      field1: {},
      field2: {
        filters: []
      },
      field3: {
        filters: ['filter1']
      },
      field4: {
        filters: ['filter1', 'filter2']
      },
      field5: {
        filters: ['regex']
      },
      field6: {
        filters: ['filter'],
        enum: ['allowed']
      }
    }
  };

  it(`no fields 0`, function ()
  {
    assert.deepEqual(parse({}, {
        field0: 'xxx'
      })
      .filter, [])
  })

  it(`no fields 1`, function ()
  {
    assert.deepEqual(parse({
        fields: {}
      }, {
        field0: 'xxx'
      })
      .filter, [])
  })

  it(`no fields 2`, function ()
  {
    assert.deepEqual(parse({}, {
        field1: 'xxx'
      })
      .filter, [])
  })
  it(`no filters`, function ()
  {
    assert.deepEqual(parse(fields, {
        field1: 'xxx'
      })
      .filter, [])
    assert.deepEqual(parse(fields, {
        field2: 'xxx'
      })
      .filter, [])
  })
  it(`filter no match`, function ()
  {
    assert.deepEqual(parse(fields, {
        field3: 'xxx:xxx'
      })
      .filter, [{
        "field": "field3",
        "filter": "filter1",
        "value": [
          "xxx:xxx"
        ]
      }])
  })
  it(`default filter`, function ()
  {
    assert.deepEqual(parse(fields, {
        field3: 'xxx'
      })
      .filter, [{
        "field": "field3",
        "filter": "filter1",
        "value": [
          "xxx"
        ]
      }]
    )
  })
  it(`multi value seperator`, function ()
  {
    assert.deepEqual(parse(fields, {
        field3: 'xxx|yyy'
      })
      .filter, [{
        "field": "field3",
        "filter": "filter1",
        "value": [
          "xxx",
          "yyy"
        ]
      }]
    )
  })
  it(`multi filter seperator`, function ()
  {
    assert.deepEqual(parse(fields, {
        field3: ['xxx', 'yyy']
      })
      .filter, [{
        "field": "field3",
        "filter": "filter1",
        "value": [
          "xxx"
        ]
      }, {
        "field": "field3",
        "filter": "filter1",
        "value": [
          "yyy"
        ]
      }]
    )
  })
  it(`regex no seperator`, function ()
  {
    assert.deepEqual(parse(fields, {
        field5: 'xxx|yyy'
      })
      .filter, [{
        "field": "field5",
        "filter": "regex",
        "value": [
          "xxx|yyy"
        ]
      }]
    )
  })
  it(`non-default filter`, function ()
  {
    assert.deepEqual(parse(fields, {
        field4: 'filter2:yyy'
      })
      .filter, [{
        "field": "field4",
        "filter": "filter2",
        "value": [
          "yyy"
        ]
      }]
    )
  })
  it(`non-default filter empty value`, function ()
  {
    assert.deepEqual(parse(fields, {
        field4: 'filter2:'
      })
      .filter, [{
        "field": "field4",
        "filter": "filter2",
        "value": [
          ""
        ]
      }]
    )
  })
  it(`allowed values`, function ()
  {
    assert.deepEqual(parse(fields, {
        field6: 'allowed|notallowed'
      })
      .filter, [{
        "field": "field6",
        "filter": "filter",
        "value": [
          "allowed"
        ]
      }]
    )
  })

});

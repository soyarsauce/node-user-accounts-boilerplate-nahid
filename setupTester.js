"use strict";

const passport = require('passport');
const express = require('express');
const http = require('http');
const setup = require('./setup');

/**
 * @oaram {} name name of test class
 * @oaram {} config config
 * @oaram {} callback function to call once setting up is done
 */
function setupTester(name, config, callback)
{
  describe(name, function ()
  {
    let app;
    let server;
    let extraHeaders = {};
    let cfg;

    beforeEach(async function ()
    {
      // reset passport
      // passport library itself is one big globlal state
      // without resetting, it saves old state; will call out of date serializers etc.
      passport._strategies = {};
      passport._serializers = [];
      passport._deserializers = [];
      passport.init();

      app = express();
      cfg = typeof config === 'object' ? config : await config();

      if (!cfg.fields)
      {
        cfg.fields = {};
      }
      cfg.fields.id = {};

      setup(app, cfg);
      server = app.listen(0);
    });

    afterEach(async function ()
    {
      server.close();
    });

    function endpoint()
    {
      return `http://localhost:server.address().port/`;
    }

    function request(method, path, headers = {}, body = '')
    {
      return new Promise((resolve) =>
      {
        if (typeof body === 'object')
        {
          headers['content-type'] = 'application/json';
          body = JSON.stringify(body, null, 2);
        }
        const options = {
          host: 'localhost',
          port: server.address()
            .port,
          method,
          path,
          headers: Object.assign({}, extraHeaders, headers)
        };
        // `http://localhost:8080/${path}`
        const req = http.request(options, (res) =>
        {
          let data = new Buffer(0);

          res.on('data', (chunk) =>
          {
            data += chunk;
          });
          res.on('end', () =>
          {
            try
            {
              data = JSON.parse(data);
            }
            catch (e)
            {
              console.log(e.stack, data)
            }
            for (let header in res.headers)
            {
              if (header === 'set-cookie')
              {
                extraHeaders['cookie'] = res.headers[header];
              }
            }
            console.log(method, path, res.statusCode, res.statusCode != 200 ? body : '', res.statusCode != 200 ? data : '')
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data
            });
          });
        });
        req.write(body);
        req.end();
      });
    }

    function getconfig()
    {
      return cfg;
    }

    function getapp()
    {
      return app;
    }

    callback({
      endpoint,
      request,
      getconfig,
      getapp,
    });
  });
}

const CachedCollection = require('node-collections-boilerplate/CachedCollection');
const NoSearch = require('node-collections-boilerplate/search/NoSearch');
const MemoryStorage = require('node-collections-boilerplate/storage/MemoryStorage');

function createCollection(array, Collection = CachedCollection)
{
  return Collection.create(new MemoryStorage({
    array
  }), new NoSearch({}), Collection);
}

module.exports = setupTester;
module.exports.createUsers = createCollection;
module.exports.createCollection = createCollection;

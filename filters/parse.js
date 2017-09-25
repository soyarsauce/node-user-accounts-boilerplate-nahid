"use strict";


function parseFieldValues(output, searchField, field, values)
{
  for (let value of values)
  {
    if (searchField.filters && searchField.filters.length > 0)
    {
      let filter = searchField.filters[0];

      if (value.match(/^[a-z0-9]+:/))
      {
        let index = value.indexOf(':');

        filter = value.substr(0, index);
        if (searchField.filters.indexOf(filter) === -1)
        {
          filter = searchField.filters[0];
        }
        else
        {
          value = value.substr(index + 1);
        }
      }
      if (filter !== 'regex')
      {
        value = value.split('|');
      }
      else
      {
        value = [value];
      }
      if (searchField.enum)
      {
        value = value.filter((v) => v.length > 0 && searchField.enum.indexOf(v) !== -1);
      }
      output.filter.push({
        field: searchField.searchField || field,
        filter,
        value
      });
    }
  }
}

function getDefaultOutput(searchMetadata)
{
  return {
    offset: 0,
    limit: searchMetadata && searchMetadata.limit && searchMetadata.limit.default ? searchMetadata.limit.default : 20,
    filter: [],
    sort: false,
    order: 'asc',
    extra: [],
    returnFacets: false
  };
}

/**
 * Validate and parse Request.query against what is acceptable from a SearchMetadata specification
 * 
 * @param {SearchMetadata} searchMetadata
 * @param {Query} query
 * @return {ParsedQuery} will validated and parsed query filters
 */
function parse(searchMetadata, query)
{
  let output = getDefaultOutput(searchMetadata);
  // process query fields

  Object.keys(query)
    .sort()
    .forEach((field) =>
    {
      // filters
      if (searchMetadata.fields)
      {
        let searchField = searchMetadata.fields && searchMetadata.fields[field];

        if (searchField)
        {
          let values = query[field];

          if (!Array.isArray(values))
          {
            values = [values];
          }
          parseFieldValues(output, searchField, field, values);
        }
      }
      // paging
      if (field === 'offset')
      {
        console.log();
        output.offset = Math.max(0, parseInt(query.offset));
      }
      else if (field === 'limit' && searchMetadata.limit)
      {
        output.limit = Math.max(searchMetadata.limit.minimum, Math.min(searchMetadata.limit.maximum, parseInt(query.limit)));
      }
      // sorting
      else if (field === 'sort')
      {
        if (searchMetadata.sort && searchMetadata.sort.indexOf(query.sort) !== -1)
        {
          output.sort = query.sort;
        }
      }
      else if (field === 'order')
      {
        output.order = query.order.substr(0, 1) !== 'd' ? 'asc' : 'dsc';
      }
      // facets and extra columns
      else if (field === 'extra')
      {
        output.extra = query.extra.split(/\|/g)
          .filter((x) => x);
      }
      else if (field === 'facets' && searchMetadata.facets)
      {
        output.returnFacets = true;
      }
    });

  return output;
}

module.exports = parse;

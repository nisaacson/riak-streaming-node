var through = require('through')
var getIndexKey = require('../lib/get-index-key')

module.exports = function(opts) {
  var client = this.client
  var query = {
    bucket: opts.bucket,
    index: getIndexKey(opts.indexKey, opts.start),
    qtype: 1, // range query, use 0 for single value query
    range_min: opts.start,
    range_max: opts.end,
    return_terms: opts.returnTerms,
  }
  if (opts.hasOwnProperty('maxResults')) {
    query.max_results = opts.maxResults
  }
  var ts = through()
  client.getIndex(query, cb)
  return ts

  function cb(err, reply) {
    var results
    if (err) {
      ts.emit('error', err)
    }
    if (!opts.returnTerms) {
      results = reply.keys
    }
    else {
      results = reply.results
    }
    results.forEach(function(row) {
      ts.write(row)
    })
    ts.end()
  }
}


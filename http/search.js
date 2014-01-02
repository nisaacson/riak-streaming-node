var querystring = require('querystring')
var q = require('q')
var request = require('request')
var validateResponse = require('./validate-response')
var validStatusCodes = [200]

module.exports = function getKeysInBucket(opts) {
  var baseURL = this.baseURL
  return fetchKeys(opts).then(parseResponse)

  function fetchKeys(opts) {
    opts.wt = 'json'
    var queryOpts = querystring.stringify(opts)
    var url = baseURL + '/solr/select?' + queryOpts
    var requestOpts = {
      url: url,
      json: true
    }
    var deferred = q.defer()
    var cb = validateResponse(deferred, validStatusCodes, 'search request failed')
    request(requestOpts, cb)
    return deferred.promise
  }
}

function parseResponse(reply) {
  var response = reply.value.response
  return response
}

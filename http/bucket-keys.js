var q = require('q')
var request = require('request')
var validateResponse = require('./validate-response')
var validStatusCodes = [200]

module.exports = function getKeysInBucket(opts) {
  var baseURL = this.baseURL
  return fetchKeys(opts)
  .then(function(reply) {
    return reply.value.keys
  })

  function fetchKeys(opts) {
    var url = baseURL + '/buckets/' + opts.bucket + '/keys?keys=true'
    var requestOpts = {
      url: url,
      json: true
    }
    var deferred = q.defer()
    var cb = validateResponse(deferred, validStatusCodes, 'bucket keys')
    request(requestOpts, cb)
    return deferred.promise
  }
}

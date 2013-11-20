var q = require('q')
var request = require('request')
var validateResponse = require('./validate-response')
var validStatusCodes = [200]

module.exports = function getKeysInBucket(bucket) {
  var baseURL = this.baseURL
  return fetchKeys(bucket)
  .then(function(reply) {
    return reply.keys
  })

  function fetchKeys(bucket) {
    var url = baseURL + '/buckets/' + bucket + '/keys?keys=true'
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

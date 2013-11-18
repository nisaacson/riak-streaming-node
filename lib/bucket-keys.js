var q = require('q')
var request = require('request')
var validateResponse = require('./validate-response')
var requestError = require('./request-error')

var badStatusCodeMessages = require('./bad-status-code-messages')
var validStatusCodes = [204, 404]

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
    var cb = validateResponse(deferred, validateStatusCode)
    request(requestOpts, cb)
    return deferred.promise
  }
}

function validateStatusCode(res, body) {
  var statusCode = res.statusCode
  var msg = 'error getting all keys in bucket, bad status code in riak response: "' + statusCode + '" '
  if (validStatusCodes.indexOf(statusCode >= 0)) {
    return
  }
  msg += badStatusCodeMessages[statusCode] || 'Unknown Error'
  return requestError(statusCode, msg, body)
}


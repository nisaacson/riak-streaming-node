var q = require('q')
var request = require('request')
var validateResponse = require('./validate-response')
var requestError = require('./request-error')

var badStatusCodeMessages = require('./bad-status-code-messages')
var validStatusCodes = [204, 404]

module.exports = function getWithKey(opts) {
  var bucket = opts.bucket
  var key = opts.key
  var value = opts.value
  var url = this.baseURL + '/buckets/' + bucket + '/keys/' + key
  url += '?pr=all&pw=all&r=all&w=all'
  var requestOpts = {
    method: 'DELETE',
    body: value,
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    json: true
  }


  var deferred = q.defer()
  var cb = validateResponse(deferred, validateStatusCode)
  request(requestOpts, cb)
  return deferred.promise

}

function validateStatusCode(res, body) {
  var statusCode = res.statusCode
  var msg = 'error getting value for key, bad status code in riak response: "' + statusCode + '" '
  if (validStatusCodes.indexOf(statusCode) >= 0) {
    return
  }
  msg += badStatusCodeMessages[statusCode] || 'Unknown Error'
  return requestError(statusCode, msg, body)
}

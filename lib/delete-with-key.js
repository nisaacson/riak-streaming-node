var q = require('q')
var errorAdapter = require('error-adapter')
var request = require('request')
var validateResponse = require('./validate-response')

module.exports = function getWithKey(opts) {
  var bucket = opts.bucket
  var key = opts.key
  var value = opts.value
  var url = this.baseURL + '/buckets/' + bucket + '/keys/' + key
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
  if (statusCode === 202) {
    return
  }
  if (statusCode === 404) {
    return
  }
  if (statusCode === 400) {
    return createError(statusCode, msg += 'Bad Request', body)
  }
  if (statusCode === 503) {
    return createError(statusCode, msg += 'Service Unavailable', body)
  }
}

function createError(statusCode, msg, body) {
  return errorAdapter.create({
    message: msg,
    statusCode: statusCode,
    body: body
  })
}

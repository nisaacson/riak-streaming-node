var q = require('q')
var errorAdapter = require('error-adapter')
var request = require('request')

var validStatusCodes = [200]
var badStatusCodeMessages = {
  400: 'Bad Request',
  503: 'Service Unavailable',
  500: 'Internal Server Error'
}

module.exports = function getWithKey(opts) {
  opts.baseURL = this.baseURL
  var deferred = q.defer()
  var requestOpts = getRequestOpts(opts)
  request(requestOpts, cb)
  return deferred.promise

  function cb(err, res, body) {
    if (err) {
      return deferred.reject(err)
    }
    if (res.statusCode === 404) {
      return deferred.resolve()
    }
    var error = validateStatusCode(res, body)
    if (error) {
      return deferred.reject(error)
    }
    var data = JSON.parse(body)
    return deferred.resolve(data)
  }
}
function getRequestOpts(opts) {
  var bucket = opts.bucket
  var key = opts.key
  var url = opts.baseURL + '/buckets/' + bucket + '/keys/' + key
  var requestOpts = {
    url: url,
    json: false
  }
  return requestOpts
}

function validateStatusCode(res, body) {
  var statusCode = res.statusCode
  var msg = 'Error getting value for key, bad status code in riak response: "' + statusCode + '" '
  if (validStatusCodes.indexOf(statusCode) >= 0) {
    return
  }
  var customMessage = badStatusCodeMessages[statusCode] || 'Unknown Error'

  msg += customMessage
  return createError(statusCode, msg, body)
}

function createError(statusCode, msg, body) {
  return errorAdapter.create({
    message: msg,
    statusCode: statusCode,
    body: body
  })
}

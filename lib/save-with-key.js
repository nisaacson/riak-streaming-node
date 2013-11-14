var q = require('q')
var errorAdapter = require('error-adapter')
var request = require('request')

module.exports = function getWithKey(opts) {
  var bucket = opts.bucket
  var key = opts.key
  var value = opts.value
  var url = this.baseURL + '/buckets/' + bucket + '/keys/' + key
  var requestOpts = {
    method: 'PUT',
    body: value,
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    json: true
  }

  var deferred = q.defer()
  request(requestOpts, cb)
  return deferred.promise

  function cb(err, res, body) {
    if (err) {
      return deferred.reject(err)
    }
    var error = validateStatusCode(res, body)
    if (error) {
      return deferred.reject(error)
    }
    return deferred.resolve(body)
  }
}

function validateStatusCode(res, body) {
  var statusCode = res.statusCode
  var msg = 'error getting value for key, bad status code in riak response: "' + statusCode + '" '
  if (statusCode === 200) {
    return
  }
  if (statusCode === 201) {
    return
  }
  if (statusCode === 400) {
    return createError(statusCode, msg += 'Bad Request', body)
  }
  if (statusCode === 412) {
    return createError(statusCode, msg += 'Precondition Failed', body)
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

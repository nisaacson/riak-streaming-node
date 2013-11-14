var q = require('q')
var errorAdapter = require('error-adapter')
var request = require('request')

module.exports = function getWithKey(opts) {
  var bucket = opts.bucket
  var key = opts.key
  var url = this.baseURL + '/buckets/' + bucket + '/keys/' + key
  var requestOpts = {
    url: url,
    json: false
  }

  var deferred = q.defer()
  request(requestOpts, cb)
  return deferred.promise

  function cb(err, res, body) {
    if (err) {
      return deferred.reject(err)
    }
    if (res.statusCode === 404) {
      return deferred.resolve()
    }
    var error = validateStatusCode(res)
    if (error) {
      return deferred.reject(error)
    }
    return deferred.resolve(body)
  }
}

function validateStatusCode(res) {
  var statusCode = res.statusCode
  var msg = 'error getting value for key, bad status code in riak response: "' + statusCode + '" '
  if (statusCode === 200) {
    return
  }
  if (statusCode === 400) {
    return createError(statusCode, msg += 'Bad Request')
  }
  /*
   *if (statusCode === 404) {
   *  return createError(statusCode, msg += 'Not Found')
   *}
   */
  if (statusCode === 503) {
    return createError(statusCode, msg += 'Service Unavailable')
  }
}

function createError(statusCode, msg) {
  return errorAdapter.create({
    message: msg,
    statusCode: statusCode
  })
}

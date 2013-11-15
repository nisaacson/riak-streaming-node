var q = require('q')
var errorAdapter = require('error-adapter')
var getIndexKey = require('./get-index-key')
var request = require('request')

module.exports = function getWithKey(opts) {
  var deferred = q.defer()
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
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

function getRequestOpts(opts) {
  var requestOpts = {
    method: 'PUT',
    body: opts.value,
    url: getURL(opts),
    json: true
  }
  requestOpts.headers = getHeaders(opts)
  return requestOpts
}

function getURL(opts) {
  var bucket = opts.bucket
  var key = opts.key
  var url = [opts.baseURL, 'buckets', bucket, 'keys', key].join('/')
  return url
}

function getHeaders(opts) {
  var indices = opts.indices
  var headers = getIndexHeaders(indices)
  headers['Content-Type'] = 'application/json'
  return headers
}

function getIndexHeaders(indices) {
  if (!indices) {
    return {}
  }
  var headers = Object.keys(indices).reduce(function(a, key) {
    var value = indices[key]
    var indexKey = getIndexKey(key)
    var headerKey = 'X-Riak-Index-' + indexKey
    a[headerKey] = value
    return a
  }, {})
  return headers
}

function validateStatusCode(res, body) {
  var statusCode = res.statusCode
  var msg = 'error saving value for key, bad status code in riak response: "' + statusCode + '" '
  if (statusCode === 200) {
    return
  }
  if (statusCode === 201) {
    return
  }
  if (statusCode === 204) {
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
  if (statusCode === 500) {
    return createError(statusCode, msg += 'Internal Server Error', body)
  }
  return createError(statusCode, msg += 'Unknown Error', body)
}

function createError(statusCode, msg, body) {
  return errorAdapter.create({
    message: msg,
    statusCode: statusCode,
    body: body
  })
}

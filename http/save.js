var q = require('q')
var getIndexKey = require('../lib/get-index-key')
var request = require('request')
var indicesFromHeaders = require('./indices-from-headers')
var validateResponse = require('./validate-response')
var validStatusCodes = [200, 201, 204]

module.exports = function save(opts) {
  var deferred = q.defer()
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var cb = validateResponse(deferred, validStatusCodes, 'Save')
  request(requestOpts, cb)
  return deferred.promise.then(function(reply) {
    if (!reply) {
      return undefined
    }
    if (!opts.returnBody) {
      return undefined
    }
    if (!opts.returnMeta) {
      return reply.value
    }
    reply.indices = indicesFromHeaders(reply.headers)
    return reply
  })
}

function getRequestOpts(opts) {
  var method = opts.key ? 'PUT' : 'POST'
  var requestOpts = {
    method: method,
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
  if (opts.returnBody) {
    url += '?returnbody=true'
  }
  else {
    url += '?returnbody=false'
  }
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
    var indexKey = getIndexKey(key, value)
    var headerKey = 'X-Riak-Index-' + indexKey
    a[headerKey] = value
    return a
  }, {})
  return headers
}

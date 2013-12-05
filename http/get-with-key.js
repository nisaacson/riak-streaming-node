var inspect = require('eyespect').inspector()
var q = require('q')
var validateResponse = require('./validate-response')
var indicesFromHeaders = require('./indices-from-headers')
var request = require('request')

var validStatusCodes = [200, 404]

module.exports = function getWithKey(opts) {
  opts.baseURL = this.baseURL
  var promise = fetch(opts)
  return promise.then(parseResponse(opts))
}

function fetch(opts) {
  var deferred = q.defer()
  var requestOpts = getRequestOpts(opts)
  request(requestOpts, cb)
  return deferred.promise

  function cb(err, res, body) {
    if (res.statusCode === 404) {
      return deferred.resolve()
    }
    validateResponse(deferred, validStatusCodes, 'get with key')(err, res, body)
  }
}

function parseResponse(opts) {
  return function (reply) {
    if (!reply) {
      return q()
    }
    return q.fcall(function() {
      var data = reply.value
      try {
        data = JSON.parse(data)
      } catch(err) {}
      if (!opts.returnMeta) {
        return data
      }
      reply.value = data
      reply.indices = indicesFromHeaders(reply.headers)
      return reply
    })
  }
}
function getRequestOpts(opts) {
  var requestOpts = {
    url: getURL(opts),
    json: false
  }
  return requestOpts
}

function getURL(opts) {
  var bucket = opts.bucket
  var key = opts.key
  var url = [opts.baseURL, 'buckets', bucket, 'keys', key].join('/')
  return url
}

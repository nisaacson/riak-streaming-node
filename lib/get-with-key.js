var q = require('q')
var validateResponse = require('./validate-response')
var request = require('request')

var validStatusCodes = [200, 404]

module.exports = function getWithKey(opts) {
  opts.baseURL = this.baseURL
  var promise = fetch(opts)
  return promise.then(parseResponse)
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
function parseResponse(body) {
  if (!body) {
    return q()
  }
  return q.fcall(function() {
    var data = JSON.parse(body)
    return data
  })
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

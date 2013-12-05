var q = require('q')
var request = require('request')
var JSONStream = require('JSONStream')

module.exports = function buckets() {
  var baseURL = this.baseURL
  return q.fcall(function () {
    var buckets = []
    var deferred = q.defer()
    var requestOpts = getRequestOpts(baseURL)
    var transformer = JSONStream.parse(['buckets', true])
    var r = request(requestOpts)
    r.pipe(transformer)
    r.on('error', function(err) {
      transformer.emit('error', err)
    })
    transformer.on('data', function(bucket) {
      buckets.push(bucket)
    })
    transformer.on('end', function() {
      return deferred.resolve(buckets)
    })
    transformer.on('error', function (err) {
      return deferred.reject(err)
    })
    return deferred.promise
  })
}

function getRequestOpts(baseURL) {
  var url = baseURL + '/buckets?buckets=true'
  var requestOpts = {
    url: url,
    json: true
  }
  return requestOpts
}

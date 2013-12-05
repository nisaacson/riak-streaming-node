var request = require('request')
var JSONStream = require('JSONStream')

module.exports = function getKeysInBucket(opts) {
  var baseURL = this.baseURL
  var url = baseURL + '/buckets/' + opts.bucket + '/keys?keys=stream'
  var requestOpts = {
    url: url,
    json: true
  }
  var transformer = JSONStream.parse(['keys', true])
  var r = request(requestOpts)
  r.pipe(transformer)
  r.on('error', function(err) {
    transformer.emit('error', err)
  })
  return transformer
}



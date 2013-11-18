var request = require('request')
var JSONTransformer = require('./json-transformer')

module.exports = function getKeysInBucket(bucket) {
  var baseURL = this.baseURL
  var url = baseURL + '/buckets/' + bucket + '/keys?keys=stream'
  var requestOpts = {
    url: url,
    json: true
  }
  var transformer = new JSONTransformer('keys')
  var r = request(requestOpts)
  r.pipe(transformer)
  r.on('error', function(err) {
    transformer.emit('error', err)
  })
  return transformer
}



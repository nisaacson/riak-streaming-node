var request = require('request')
var JSONTransformer = require('./json-transformer')

module.exports = function buckets(bucket) {
  var baseURL = this.baseURL
  var url = baseURL + '/buckets?buckets=true'
  var requestOpts = {
    url: url,
    json: true
  }
  var transformer = new JSONTransformer('buckets')
  var r = request(requestOpts)
  r.pipe(transformer)
  r.on('error', function(err) {
    transformer.emit('error', err)
  })
  return transformer
}



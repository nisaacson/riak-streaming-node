var request = require('request')
var JSONStream = require('JSONStream')

module.exports = function buckets() {
  var baseURL = this.baseURL
  var url = baseURL + '/buckets?buckets=true'
  var requestOpts = {
    url: url,
    json: true
  }
  var transformer = JSONStream.parse(['buckets', true])
  var r = request(requestOpts)
  r.pipe(transformer)
  r.on('error', function(err) {
    transformer.emit('error', err)
  })
  return transformer
}



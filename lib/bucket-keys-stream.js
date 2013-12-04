var stream = require('stream')
var wrapStream = require('./wrap-stream')

module.exports = function bucketKeysStream(opts) {
  var client = this.client
  var params = { bucket: opts.bucket }
  var streaming = true
  var keyStream = client.getKeys(params, streaming)
  var ts = wrapStream(keyStream)
  var extractor = extractKeys()
  ts.pipe(extractor)
  ts.on('error', function(err) {
    extractor.emit('error', err)
  })

  return extractor
}

function extractKeys() {
  var stringify = new stream.Transform({
    objectMode: true
  })

  stringify._transform = function(chunk, encoding, done) {
    var keys = chunk.keys
    var self = this
    keys.forEach(function(key) {
      self.push(key)
    })
    done()
  }
  return stringify
}


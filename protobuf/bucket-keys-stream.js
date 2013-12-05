var stream = require('stream')

module.exports = function bucketKeysStream(opts) {
  var client = this.client
  var params = { bucket: opts.bucket }
  var streaming = true
  var keyStream = client.getKeys(params, streaming)
  var extractor = extractKeys(keyStream)

  return extractor
}

function extractKeys(keyStream) {
  var extractor = new stream.Transform({
    objectMode: true
  })

  extractor._transform = function(chunk, encoding, done) {
    var keys = chunk.keys
    var self = this
    keys.forEach(function(key) {
      self.push(key)
    })
    done()
  }
  keyStream.pipe(extractor)
  keyStream.on('error', function(err) {
    extractor.emit('error', err)
  })
  return extractor
}


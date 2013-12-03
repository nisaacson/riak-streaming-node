var through = require('through')

module.exports = function getKeysInBucket(bucket) {
  var ts = through(function(data) {
    this.queue(data)
  }, function() {
    this.queue(null)
  })

  var client = this.client
  var params = { bucket: bucket }
  var streaming = true
  var keyStream = client.getKeys(params, streaming)
  keyStream.on('data', dataHandler)
  keyStream.on('end', endHandler)
  keyStream.pipe(ts)
  return ts

  function endHandler() {
    ts.end()
  }
  function dataHandler(err, data) {
    if (err) {
      return ts.emit('error', err)
    }
    data.forEach(function(key) {
      ts.write(key)
    })
  }

}



var through = require('through')

module.exports = function(readStream) {
  var ts = through(function(data) {
    this.queue(data)
  }, function() {
    this.queue(null)
  })
  readStream.on('data', dataHandler)
  readStream.on('end', endHandler)
  return ts

  function endHandler() {
    ts.end()
  }
  function dataHandler(err, data) {
    if (err) {
      return ts.emit('error', err)
    }
    ts.write(data)
  }

}

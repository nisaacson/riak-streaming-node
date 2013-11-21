var formidable = require('formidable')
var resumer = require('resumer')

module.exports = function(readableStream) {
  var writeStream = resumer()
  readableStream.on('response', responseHandler)
  readableStream.on('data', readableDataHandler)

  return writeStream

  function responseHandler(res) {
    var statusCode = res.statusCode
    if (statusCode !== 200) {
      var error = new Error('invalid status code received from riak server: "' + statusCode + '"')
      writeStream.emit('error', error)
      readableStream.destroy()
      return
    }
    var form = new formidable.IncomingForm()
    form.on('error', function() {
      writeStream.emit('end')
    })
    form.onPart = partHandler
    form.parse(res)
    res.on('end', function() {
      writeStream.emit('end')
    })
  }
  function partHandler(part) {
    part.on('data', function(chunk) {
      writeStream.write(chunk)
    })
  }

  function readableDataHandler(chunk) {
    var data = chunk.toString()
    if (data === '{"error":"timeout"}') {
      var error = new Error('timeout received from riak server when running mapreduce job')
      writeStream.emit('error', error)
      readableStream.destroy()
    }
  }
}

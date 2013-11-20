var formidable = require('formidable')
var request = require('request')
var resumer = require('resumer')

var parseMapReduceStream = require('./parse-map-reduce-stream')
var getMapReduceRequestOpts = require('./get-map-reduce-request-opts')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var writeStream = resumer()
  var requestOpts = getMapReduceRequestOpts(opts)
  var readableStream = request(requestOpts)
  readableStream.on('response', responseHandler)
  var parsedStream = parseMapReduceStream()
  parsedStream.pipe(writeStream)
  return writeStream

  function responseHandler(res) {
    var statusCode = res.statusCode
    if (statusCode !== 200) {
      var error = new Error('invalid status code received from riak server: "' + statusCode + '"')
      resumer.emit('error', error)
    }
    var form = new formidable.IncomingForm()
    form.on('error', function() {
      parsedStream.emit('end')
    })
    form.onPart = partHandler
    form.parse(res)
    res.on('end', function() {
      parsedStream.emit('end')
    })
  }
  function partHandler(part) {
    part.on('data', parsedStream.write)
  }
}

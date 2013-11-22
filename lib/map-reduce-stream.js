var request = require('request')
var resumer = require('resumer')

var parseChunkedStream = require('./parse-chunked-stream')
var parseMapReduceStream = require('./parse-map-reduce-stream')
var getMapReduceRequestOpts = require('./get-map-reduce-request-opts')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var writeStream = resumer()
  var requestOpts = getMapReduceRequestOpts(opts)
  var readableStream = request(requestOpts)
  var unchunkedStream = parseChunkedStream(readableStream)
  var parsedStream = parseMapReduceStream()

  unchunkedStream.pipe(parsedStream).pipe(writeStream)
  return writeStream
}

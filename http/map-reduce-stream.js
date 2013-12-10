var request = require('request')

var parseChunkedStream = require('./parse-chunked-stream')
var parseMapReduceStream = require('./parse-map-reduce-stream')
var getMapReduceRequestOpts = require('./get-map-reduce-request-opts')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getMapReduceRequestOpts(opts)
  var readableStream = request(requestOpts)
  var unchunkedStream = parseChunkedStream(readableStream)
  var parsedStream = parseMapReduceStream(unchunkedStream)
  return parsedStream
}

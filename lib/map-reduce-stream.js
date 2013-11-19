var request = require('request')
var parseMapReduceStream = require('./parse-map-reduce-stream')
var getRequestOpts = require('./get-map-reduce-request-opts')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var readStream = request(requestOpts)
  var parsedStream = parseMapReduceStream(readStream)
  return parsedStream
}


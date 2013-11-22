var parseChunkedStream = require('./parse-chunked-stream')
var request = require('request')
var JSONStream = require('JSONStream')
var getIndexKey = require('./get-index-key')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var readableStream = request(requestOpts)
  var parsedStream = parseChunkedStream(readableStream)
  var resultsKey = jsonResultsKey(opts)
  var keysParser = JSONStream.parse([resultsKey, true])
  parsedStream.pipe(keysParser)
  parsedStream.on('error', function(err) {
    keysParser.emit('error', err)
  })

  return keysParser
}

function getRequestOpts(opts) {
  var url = getURL(opts)
  var requestOpts = {
    url: url,
    method: 'get',
    json: true
  }
  return requestOpts
}

function jsonResultsKey(opts) {
  if (opts.returnTerms) {
    return 'results'
  }
  return 'keys'
}

function getURL(opts) {
  var baseURL = opts.baseURL
  var start = opts.start
  var end = opts.end
  var indexKey = getIndexKey(opts.indexKey, start)
  var bucket = opts.bucket
  var url = [baseURL, 'buckets', bucket, 'index', indexKey, start, end].join('/')
  url += '?stream=true'
  if (opts.returnTerms) {
    url += '&return_terms=true'
  }
  if (opts.maxResults) {
    url += '&max_results=' + opts.maxResults
  }
  return url
}

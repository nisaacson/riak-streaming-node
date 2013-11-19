var getIndexKey = require('./get-index-key')
var request = require('request')
var parseMapReduceStream = require('./parse-map-reduce-stream')
var getMapReduceRequestOpts = require('./get-map-reduce-request-opts')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var readableStream = request(requestOpts)
  var parsedStream = parseMapReduceStream(readableStream)
  return parsedStream
}

function getRequestOpts(opts) {
  var indexKey = getIndexKey(opts.indexKey, opts.start)
  var mapPhase = {
    map: {
      keep: false,
      arg: indexKey,
      fn: mapKeys
    }
  }
  var reducePhase = {
    reduce: {
      keep: true,
      fn: sortKeys
    }
  }
  opts.mapReduceOpts = [mapPhase, reducePhase]
  var inputs = {
    bucket: opts.bucket,
    index: indexKey,
    start: opts.start,
    end: opts.end
  }
  opts.inputs = inputs
  var requestOpts = getMapReduceRequestOpts(opts)
  return requestOpts
}

function mapKeys(value) {
  var key = value.key
  return [key]
}

function sortKeys(list) {
  var sorted = list.sort()
  return sorted
}

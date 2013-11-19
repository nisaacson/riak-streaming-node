var request = require('request')
var getMapReduceRequestOpts = require('./get-map-reduce-request-opts')
var parseMapReduceStream = require('./parse-map-reduce-stream')
var getIndexKey = require('./get-index-key')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var readableStream = request(requestOpts)
  var parser = jsonParseStream()
  var parsedStream = parseMapReduceStream(readableStream)
  parsedStream.pipe(parser)
  parsedStream.on('error', function(err) {
    parser.emit('error', err)
  })
  return parser
}


/**
 * Riak when in streaming query mode returns boundary fields between data
 * Dump those boundary fields here
 * @return (Stream) filtered stream with only keys data emitted
 */
function jsonParseStream() {
  var stream = require('stream')
  var jsoner = new stream.Transform({
    objectMode: true
  })

  jsoner._transform = function(chunk, encoding, done) {
    if (typeof chunk === 'string') {
      this.push(chunk)
      return
    }
    var jsonStringData = chunk.data
    if (!jsonStringData) {
      this.push(chunk)
      return
    }
    var jsonData
    if (typeof jsonStringData === 'object') {
      jsonData = jsonStringData
    } else {
      jsonData = safeParse(jsonStringData)
    }
    this.push(jsonData)
    done()
  }

  return jsoner
}

function safeParse(data) {
  var json
  try {
    json = JSON.parse(data)
  } catch (err) {
    json = data
  }
  return json
}
function getRequestOpts(opts) {
  var indexKey = getIndexKey(opts.indexKey, opts.start)
  var mapPhase = {
    map: {
      keep: false,
      arg: indexKey,
      fn: mapValues
    }
  }
  var reducePhase = {
    reduce: {
      keep: true,
      fn: sortValues
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
function mapValues(value, keyData, args) {
  var indexKey = args
  var metadata = value.values[0].metadata
  var index = metadata.index[indexKey]
  var data = Riak.mapValuesJson(value)[0]
  // var data = value.values[0].data;
  var output = {
    index: index,
    data: data
  }

  return [output]
}

function sortValues(list) {
  var sorted = list.sort(function(a, b) {
    var aIndex = a.index
    var bIndex = b.index
    if (aIndex > bIndex) {
      return 1
    }
    if (aIndex < bIndex) {
      return -1
    }
    return 0
  })
  return sorted
}



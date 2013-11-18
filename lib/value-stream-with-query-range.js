var request = require('request')
var JSONStream = require('JSONStream')
var filterStream = require('./filter-stream')
var getMapReduceRequestOpts = require('./get-map-reduce-request-opts')
var getIndexKey = require('./get-index-key')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var r = request(requestOpts)
  var filterer = filterStream(validLine)
  var parser = jsonParseStream()
  var transformer = JSONStream.parse(['data', true])

  r.pipe(filterer).pipe(transformer).pipe(parser)

  r.on('error', function(err) {
    filterer.emit('error', err)
  })

  filterer.on('error', function(err) {
    transformer.emit('error', err)
  })

  transformer.on('error', function(err) {
    parser.emit('error', err)
  })

  return parser
}

function getRequestOpts(opts) {
  var indexKey = getIndexKey(opts.indexKey, opts.start)
  opts.mapOpts = {
    keep: false,
    arg: indexKey,
    mapFunction: mapValues
  }
  opts.reduceOpts = {
    keep: true,
    reduceFunction: sortValues
  }
  var requestOpts = getMapReduceRequestOpts(opts)
  return requestOpts
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
    var jsonStringData = chunk.data
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

function validLine(line) {
  var testString = '{"phase"'
  var index = line.indexOf(testString)
  if (index === 0) {
    return true
  }
  return false
}

var request = require('request')
var JSONTransformer = require('./json-transformer')
var getIndexKey = require('./get-index-key')
var filterStream = require('./filter-stream')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var r = request(requestOpts)
  var filterer = filterStream(validLine)
  var parser = jsonParseStream()
  var transformer = new JSONTransformer('data')

  r.pipe(filterer).pipe(transformer).pipe(parser)
  r.on('error', function(err) {
    transformer.emit('error', err)
  })
  transformer.on('error', function(err) {
    parser.emit('error', err)
  })
  return parser
}

function getURL(opts) {
  var baseURL = opts.baseURL
  var url = [baseURL, 'mapred'].join('/')
  url += '?chunked=true'
  return url
}

function getRequestOpts(opts) {
  var url = getURL(opts)
  var requestOpts = {
    method: 'post',
    url: url,
    json: getRequestJSON(opts)
  }
  return requestOpts
}

function getRequestJSON(opts) {
  var indexKey = getIndexKey(opts.indexKey)
  var bucket = opts.bucket
  var inputs = {
    bucket: bucket,
    index: indexKey,
    start: opts.start,
    end: opts.end
  }
  var mapPhase = buildMapPhase(indexKey)
  var reducePhase = buildReducePhase(indexKey)
  var query = [mapPhase, reducePhase]
  var json = {
    inputs: inputs,
    query: query
  }
  return json
}

function buildReducePhase() {
  var sortFunctionString = sortValues.toString()
  var reduce = {
    language: 'javascript',
    source: sortFunctionString,
    keep: true
  }
  var reducePhase = {
    reduce: reduce
  }
  return reducePhase
}

function buildMapPhase(indexKey) {
  var mapFunctionString = mapValues.toString()
  var map = {
    language: 'javascript',
    source: mapFunctionString,
    arg: indexKey,
    keep: false
  }
  var mapPhase = {
    map: map
  }
  return mapPhase
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

  var output = sorted.reduce(function(a, b) {
    var data = b.data
    a.push(data)
    return a
  }, [])
  return output
}

function mapValues(value, keyData, args) {
  var indexKey = args
  var index = value.values[0].metadata.index[indexKey]
  var data = value.values[0].data;
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
    var data = chunk.toString()
    var json = safeParse(data)
    this.push(json)
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

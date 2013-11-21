var getKeyValueStream = require('./get-key-value-stream')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  opts.mapFn = mapValues
  opts.reduceFn = sortValues
  var readableStream = getKeyValueStream.call(this, opts)
  var parser = jsonParseStream()
  readableStream.pipe(parser)
  readableStream.on('error', function(err) {
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
    var jsonData = parseChunk(chunk)
    this.push(jsonData)
    done()
  }
  return jsoner
}

function parseChunk(chunk) {
  if (typeof chunk === 'string') {
    return chunk
  }
  var jsonStringData = chunk.data
  if (!jsonStringData) {
    return chunk
  }
  var jsonData
  if (typeof jsonStringData === 'object') {
    jsonData = jsonStringData
  } else {
    jsonData = safeParse(jsonStringData)
  }
  return jsonData
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

function mapValues(value, keyData, args) {
  var indexKey = args
  var metadata = value.values[0].metadata
  var index = metadata.index[indexKey]
  var data = value.values[0].data;
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
    if (typeof aIndex !== 'string') {
      aIndex = aIndex.toString()
    }
    if (typeof bIndex !== 'string') {
      bIndex = bIndex.toString()
    }
    return aIndex.localeCompare(bIndex)
  })
  return sorted
}



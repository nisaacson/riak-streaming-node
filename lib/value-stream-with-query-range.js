var request = require('request')
var JSONTransformer = require('./json-transformer')
var getIndexKey = require('./get-index-key')
var filterStream = require('./filter-stream')

module.exports = function getKeysInBucket(opts) {
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
  /*
   *var url = [baseURL, 'buckets', bucket, 'index', indexKey, start, end].join('/')
   *url += '?stream=true'
   *return url
   */
}

function getRequestOpts(opts) {
  var indexKey = getIndexKey(opts.indexKey)
  var bucket = opts.bucket
  var url = getURL(opts)
  var requestOpts = {
    method: 'post',
    url: url
  }
  var inputs = {
    bucket: bucket,
    index: indexKey,
    start: opts.start,
    end: opts.end
  }
  var query = {
    map: {
      'language': 'erlang',
      'module': 'riak_kv_mapreduce',
      'function': 'map_object_value',
      'keep': true
    }
  }
  var json = {
    inputs: inputs,
    query: [query]
  }
  requestOpts.json = json

  return requestOpts

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

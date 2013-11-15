var request = require('request')
var JSONTransformer = require('./json-transformer')
var getIndexKey = require('./get-index-key')

module.exports = function getKeysInBucket(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var transformer = new JSONTransformer('keys')
  var r = request(requestOpts)
  var filterer = filterStream()
  r.pipe(filterer).pipe(transformer)
  r.on('error', function(err) {
    transformer.emit('error', err)
  })
  return transformer
}

function getURL(opts) {
  var baseURL = opts.baseURL
  var bucket = opts.bucket
  var start = opts.start
  var end = opts.end
  var indexKey = getIndexKey(opts.indexKey)
  var url = [baseURL, 'buckets', bucket, 'index', indexKey, start, end].join('/')
  url += '?stream=true'
  return url
}

function getRequestOpts(opts) {
  var url = getURL(opts)
  var requestOpts = {
    url: url,
    json: false
  }
  return requestOpts
}

/**
 * Riak when in streaming query mode returns boundary fields between data
 * Dump those boundary fields here
 * @return (Stream) filtered stream with only keys data emitted
*/
function filterStream() {
  var stream = require('stream')
  var liner = new stream.Transform({
    objectMode: true
  })

  liner._transform = function(chunk, encoding, done) {
    var data = chunk.toString()
    var lines = data.split('\n')
    lines.filter(validLine).forEach(this.push.bind(this))
    done()
    return
  }

  return liner
}

function validLine(line) {
  var testString = '{"keys"'
  var index = line.indexOf(testString)
  if (index === 0) {
    return true
  }
  return false
}

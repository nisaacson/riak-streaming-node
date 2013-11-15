var request = require('request')
var JSONTransformer = require('./json-transformer')
var getIndexKey = require('./get-index-key')
var filterStream = require('./filter-stream')

module.exports = function getKeysInBucket(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var transformer = new JSONTransformer('keys')
  var r = request(requestOpts)
  var filterer = filterStream(validLine)
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

function validLine(line) {
  var testString = '{"keys"'
  var index = line.indexOf(testString)
  if (index === 0) {
    return true
  }
  return false
}

var request = require('request')
var JSONTransformer = require('./json-transformer')
var getIndexKey = require('./get-index-key')
var filterStream = require('./filter-stream')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  var requestOpts = getRequestOpts(opts)
  var r = request(requestOpts)

  var filterer = filterStream(validLine)
  var transformer = new JSONTransformer('data')

  r.pipe(filterer).pipe(transformer)
  r.on('error', function(err) {
    transformer.emit('error', err)
  })

  return transformer
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

function buildMapPhase() {
  var mapFunctionString = mapValues.toString()
  var map = {
    language: 'javascript',
    source: mapFunctionString,
    keep: false
  }
  var mapPhase = {
    map: map
  }
  return mapPhase
}

function mapValues(value) {
  var key = value.key
  return [key]
}

function sortValues(list) {
  var sorted = list.sort()
  return sorted
}

function validLine(line) {
  var testString = '{"phase"'
  var index = line.indexOf(testString)
  if (index === 0) {
    return true
  }
  return false
}

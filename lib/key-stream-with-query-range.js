var request = require('request')
var JSONTransformer = require('./json-transformer')
var filterStream = require('./filter-stream')
var getMapReduceRequestOpts = require('./get-map-reduce-request-opts')

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

function getRequestOpts(opts) {
  opts.mapOpts = {
    keep: false,
    mapFunction: mapKeys
  }
  opts.reduceOpts = {
    keep: true,
    reduceFunction: sortKeys
  }
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

function validLine(line) {
  var testString = '{"phase"'
  var index = line.indexOf(testString)
  if (index === 0) {
    return true
  }
  return false
}

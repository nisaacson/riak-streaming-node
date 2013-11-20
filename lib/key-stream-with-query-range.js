var getKeyValueStream = require('./get-key-value-stream')

module.exports = function(opts) {
  opts.baseURL = this.baseURL
  opts.mapFn = mapKeys
  opts.reduceFn = sortKeys
  var readableStream = getKeyValueStream.call(this, opts)
  return readableStream
}

function mapKeys(value) {
  var key = value.key
  return [key]
}

function sortKeys(list) {
  var sorted = list.sort()
  return sorted
}

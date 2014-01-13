var q = require('q')
var parseIndices = require('./parse-indices')

module.exports = function getWithKey(opts) {
  var client = this.client
  var requestOpts = {
    bucket: opts.bucket,
    key: opts.key
  }
  var promise = q.ninvoke(client, 'get', requestOpts)
  return promise.then(parseResponse(opts))
}

function parseResponse(opts) {
  return function(body) {
    return q.fcall(function() {
      if (!body) {
        return q()
      }
      if (Object.keys(body).length === 0) {
        return q()
      }
      return parseContent(body.content[0])
    })
  }

  function parseContent(content) {
    var value = content.value
    var contentType = content.content_type
    if (contentType.match(/^text/)) {
      value = value.toString()
    }
    if (!opts.returnMeta) {
      return value
    }
    var indices = parseIndices(content.indexes)
    var reply = {
      value: value,
      indices: indices
    }
    return reply
  }
}

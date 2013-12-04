var q = require('q')

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
      var value = parseValue(body)
      if (!opts.returnIndices) {
        return value
      }
      var reply = {
        value: value,
        indices: body.content[0].indexes
      }
      return reply
    })
  }
}

function parseValue(body) {
  var output = body.content[0]
  if (output.content_type === 'application/json') {
    return JSON.parse(output.value)
  }
  return output.value.toString()
}

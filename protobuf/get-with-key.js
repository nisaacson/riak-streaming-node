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
      var value = body.content[0].value
      var contentType = body.content[0].content_type
      if (contentType.match(/^text/)) {
        value = value.toString()
      }
      if (!opts.returnMeta) {
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

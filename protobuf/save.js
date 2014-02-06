var errs = require('errs')
var q = require('q')
var getIndexKey = require('../lib/get-index-key')
var parseIndices = require('./parse-indices')

module.exports = function save(opts) {
  var self = this
  return q.fcall(function() {
    return save.call(self, opts)
  })
}

function save(opts) {
  var client = this.client
  var requestOpts = getRequestOpts(opts)
  var deferred = q.defer()
  try {
    client.put(requestOpts, cb)
  }
  catch(err) {
    var error = errs.merge(err, {
      action: 'save',
      requestOpts: requestOpts
    })
    throw error
  }
  return deferred.promise

  function cb(err, reply) {
    if (err) {
      deferred.reject(err)
      return
    }
    var promise = parseResponse(opts.returnBody)(reply)
    return promise.then(deferred.resolve).fail(deferred.reject)
  }
}

function getValueAndContentType(opts) {
  var contentType
  var value = opts.value
  if (typeof opts.value === 'object') {
    value = JSON.stringify(value)
    contentType = 'application/json'
  }
  else {
    value = opts.value
    contentType = 'text'
  }
  var output = {
    contentType: contentType,
    value: value
  }
  return output
}

function getRequestOpts(opts) {
  var valueAndContentType = getValueAndContentType(opts)
  var requestOpts = {
    bucket: opts.bucket,
    content: {
      value: valueAndContentType.value,
      content_type: valueAndContentType.contentType,
      indexes: getIndices(opts)
    },
    return_body: opts.returnBody
  }
  if (opts.key) requestOpts.key = opts.key
  return requestOpts
}

function getIndices(opts) {
  opts.indices = opts.indices || {}
  var indices = Object.keys(opts.indices).map(function(indexKey) {
    var indexValue = opts.indices[indexKey]
    indexKey = getIndexKey(indexKey, indexValue)
    var output = {
      key: indexKey,
      value: indexValue
    }
    return output
  })
  return indices
}
function parseResponse(returnBody) {
  return function(reply) {
    return q.fcall(function() {
      if (!returnBody) {
        return
      }
      var output = reply.content[0]
      var value = reply.content[0].value
      var contentType = output.content_type
      if (output.content_type === 'application/json') {
        try {
          value = JSON.parse(value)
        } catch (err) {
        }
      }
      if (contentType.match(/^text\//)) {
        value = value.toString()
      }
      if (!output.indexes) {
        output.indexes = []
      }
      output.value = value
      output.indices = parseIndices(output.indexes)
      delete output.indexes
      return output
    })
  }
}

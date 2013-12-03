var q = require('q')
var inspect = require('eyespect').inspector()
var getIndexKey = require('./get-index-key')

module.exports = function saveWithKey(opts) {
  var self = this
  return q.fcall(function() {
    return save.call(self, opts)
  })
}

function save(opts) {
  var client = this.client
  var value, contentType
  if (typeof opts.value === 'object') {
    value = JSON.stringify(opts.value)
    contentType = 'application/json'
  }
  else {
    value = opts.value
    contentType = 'text/raw'
  }
  var request = {
    bucket: opts.bucket,
    key: opts.key,
    content: {
      value: value,
      content_type: contentType
    },
    return_body: opts.returnBody
  }
  var promise = q.ninvoke(client, 'put', request)
  return promise.then(parseResponse(opts.returnBody))
}

function parseResponse(returnBody) {
  return function(reply) {
    if (!returnBody) {
      return reply
    }
    var output = reply.content[0]
    if (output.content_type === 'application/json') {
      output.value = JSON.parse(output.value)
    }
    else {
      output.value = output.value.toString()
    }
    return output
  }
}
/*
 *
 *function getRequestOpts(opts) {
 *  var requestOpts = {
 *    method: 'PUT',
 *    body: opts.value,
 *    url: getURL(opts),
 *    json: true
 *  }
 *  requestOpts.headers = getHeaders(opts)
 *  return requestOpts
 *}
 *
 *function getURL(opts) {
 *  var bucket = opts.bucket
 *  var key = opts.key
 *  var url = [opts.baseURL, 'buckets', bucket, 'keys', key].join('/')
 *  if (opts.returnBody) {
 *    url += '?returnbody=true'
 *  }
 *  else {
 *    url += '?returnbody=false'
 *  }
 *  return url
 *}
 *
 *function getHeaders(opts) {
 *  var indices = opts.indices
 *  var headers = getIndexHeaders(indices)
 *  headers['Content-Type'] = 'application/json'
 *  return headers
 *}
 *
 *function getIndexHeaders(indices) {
 *  if (!indices) {
 *    return {}
 *  }
 *  var headers = Object.keys(indices).reduce(function(a, key) {
 *    var value = indices[key]
 *    var indexKey = getIndexKey(key, value)
 *    var headerKey = 'X-Riak-Index-' + indexKey
 *    a[headerKey] = value
 *    return a
 *  }, {})
 *  return headers
 *}
 */

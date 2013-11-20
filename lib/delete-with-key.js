var q = require('q')
var request = require('request')
var validateResponse = require('./validate-response')
var validStatusCodes = [204, 404]

module.exports = function getWithKey(opts) {
  var bucket = opts.bucket
  var key = opts.key
  var value = opts.value
  var url = this.baseURL + '/buckets/' + bucket + '/keys/' + key
  url += '?pr=all&pw=all&r=all&w=all'
  var requestOpts = {
    method: 'DELETE',
    body: value,
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    json: true
  }


  var deferred = q.defer()
  var cb = validateResponse(deferred, validStatusCodes, 'delete with key')
  request(requestOpts, cb)
  return deferred.promise

}

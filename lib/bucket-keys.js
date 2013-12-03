var q = require('q')

module.exports = function getKeysInBucket(bucket) {
  var client = this.client
  var params = { bucket: bucket }
  var promise = q.ninvoke(client, 'getKeys', params)
  return promise.then(function(reply) {
    return reply.keys
  })
}

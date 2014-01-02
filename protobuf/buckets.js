var q = require('q')

module.exports = function buckets() {
  var client = this.client
  var deferred = q.defer()
  try {
    client.getBuckets(cb)
  } catch (err) {
    deferred.reject(err)
  }
  return deferred.promise

  function cb(err, reply) {
    if (err) {
      return deferred.reject(err)
    }
    deferred.resolve(reply.buckets)
  }
}

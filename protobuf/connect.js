var q = require('q')

module.exports = function connect() {
  var client = this.client
  var deferred = q.defer()
  try {
    client.connect(cb)
  } catch (err) {
    deferred.reject(err)
  }
  return deferred.promise

  function cb(err, reply) {
    if (err) {
      return deferred.reject(err)
    }
    deferred.resolve(reply)
  }
}

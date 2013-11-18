var q = require('q')

module.exports = function(bucket) {
  var self = this
  var deferred = q.defer()
  var promise = self.bucketKeys(bucket)
  promise.then(function(keys) {
    return q.all(keys.map(deleteKey))
  })
  promise.then(function() {
    return waitForClear().then(function() {
      deferred.resolve()
    })
  })
  return deferred.promise

  function waitForClear() {
    var deferred = q.defer()
    var iv = setInterval(getKeys, 100)
    return deferred.promise

    function getKeys() {
      self.bucketKeys(bucket).then(function(keys) {
        if (keys.length === 0) {
          clearInterval(iv)
          return deferred.resolve()
        }
      })
    }
  }

  function deleteKey(key) {
    var deleteOpts = {
      key: key,
      bucket: bucket
    }
    var promise = self.deleteWithKey(deleteOpts)
    return promise
  }
}

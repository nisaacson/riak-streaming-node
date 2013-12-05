var q = require('q')

module.exports = function(opts) {
  var self = this
  var bucket = opts.bucket
  var deferred = q.defer()
  var promise = self.bucketKeys(opts)
  promise.then(function(keys) {
    var promises = keys.map(function(key) {
      return deleteKey(key)
    })
    return q.all(promises)
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
      self.bucketKeys(opts).then(function(keys) {
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

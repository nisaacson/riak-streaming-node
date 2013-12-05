var q = require('q')

module.exports = function bucketKeys(opts) {
  var deferred = q.defer()
  var readStream = this.bucketKeysStream.call(this, opts)
  var keys = []
  readStream.on('data', dataHandler)
  readStream.on('end', endHandler)
  readStream.on('error', errorHandler)
  return deferred.promise

  function dataHandler(key) {
    keys.push(key)
  }

  function endHandler() {
    deferred.resolve(keys)
  }

  function errorHandler(err) {
    deferred.reject(err)
  }
}



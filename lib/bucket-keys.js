var q = require('q')
var bucketKeysStream = require('./bucket-keys-stream')

module.exports = function getKeysInBucket(opts) {
  var deferred = q.defer()
  var keysStream = bucketKeysStream.call(this, opts)
  bufferAllEvents(keysStream, deferred)
  return deferred.promise
}

function bufferAllEvents(keysStream, deferred) {
  var keys = []
  keysStream.on('data', dataHandler)
  keysStream.on('end', endHandler)
  keysStream.on('error', errorHandler)

  function dataHandler(key) {
    keys.push(key)
  }

  function endHandler() {
    return deferred.resolve(keys)
  }

  function errorHandler(err) {
    return deferred.reject(err)
  }
}

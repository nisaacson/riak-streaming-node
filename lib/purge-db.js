var q = require('q')

module.exports = function() {
  var deferred = q.defer()
  var self = this
  var promises = []
  var bucketStream = self.bucketStream()
  bucketStream.on('data', bucketStreamDataHandler)
  bucketStream.on('end', bucketStreamEndHandler)
  return deferred.promise

  function bucketStreamDataHandler(bucketName) {
    var promise = self.bucketDeleteAll(bucketName)
    promises.push(promise)
  }

  function bucketStreamEndHandler() {
    var promise = q.all(promises)
    promise.then(function() {
      deferred.resolve()
    })
  }
}

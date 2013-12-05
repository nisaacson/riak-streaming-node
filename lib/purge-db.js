var q = require('q')

module.exports = function() {
  var deferred = q.defer()
  var self = this
  var promises = []
  var bucketsStream = self.bucketsStream()
  bucketsStream.on('data', bucketStreamDataHandler)
  bucketsStream.on('end', bucketStreamEndHandler)
  return deferred.promise

  function bucketStreamDataHandler(bucketName) {
    var opts = {
      bucket: bucketName
    }
    var promise = self.bucketDeleteAll.call(self, opts)
    promises.push(promise)
  }

  function bucketStreamEndHandler() {
    var promise = q.all(promises)
    promise.then(function() {
      deferred.resolve()
    })
  }
}

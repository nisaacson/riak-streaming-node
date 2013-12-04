var q = require('q')
var async = require('async')
var DEFAULT_CONCURRENCY = 5

module.exports = function(opts) {
  var self = this
  var promise = deleteKeys.call(self, opts)
  return promise.then(waitForClear.bind(self))
}

function deleteKeys(opts) {
  var self = this
  var deferred = q.defer()
  var concurrency = opts.concurrency || DEFAULT_CONCURRENCY
  var boundDelete = deleteKey.bind(self)
  var queue = async.queue(boundDelete, concurrency)
  queue.drain = drainHandler
  var promise = self.bucketKeys(opts)
  promise.then(queueKeysForDelete)
  return deferred.promise


  function drainHandler() {
    deferred.resolve(opts)
  }

  function queueKeysForDelete(keys) {
    keys.forEach(function(key) {
      var task = {
        key: key,
        bucket: opts.bucket
      }
      queue.push(task)
    })
  }
}

function waitForClear(opts) {
  var self = this
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

function deleteKey(opts, cb) {
  var self = this
  var deleteOpts = {
    key: opts.key,
    bucket: opts.bucket
  }
  var promise = self.deleteWithKey(deleteOpts)
  return promise.nodeify(cb)
}

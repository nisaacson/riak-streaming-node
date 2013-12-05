var through = require('through')
var buckets = require('./buckets')

module.exports = function bucketsStream() {
  var ts = through()
  var promise = buckets.call(this)
  promise.then(writeBuckets).fail(failHandler)
  return ts

  function writeBuckets(buckets) {
    if (!buckets) {
      return ts.end()
    }
    buckets.forEach(function(bucket) {
      ts.write(bucket)
    })
    ts.end()

  }

  function failHandler(err) {
    if (err) {
      ts.emit('error', err)
      return
    }
  }
}

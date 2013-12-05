var q = require('q')

module.exports = function getWithKey(opts) {
  var client = this.client
  var deleteOpts = {
    bucket: opts.bucket,
    key: opts.key
  }
  var promise = q.ninvoke(client, 'del', deleteOpts)
  return promise

}

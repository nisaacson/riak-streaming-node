var defaults = require('./lib/defaults')

function Client(opts) {
  opts = opts || {}
  this.hostname = getValue(opts, 'host')
  this.port = getValue(opts, 'port')
  this.protocol = getValue(opts, 'protocol')
  this.baseURL = getBaseURL(opts)
}

function getValue(opts, key) {
  return opts[key] || defaults[key]
}

function getBaseURL(opts) {
  var protocol = opts.protocol || defaults.protocol
  var host = opts.host || defaults.host
  var port = opts.port || defaults.port
  var baseURL = protocol + '://' + host + ':' + port
  return baseURL
}

Client.prototype.purgeDB = require('./lib/purge-db')
Client.prototype.bucketKeys = require('./lib/bucket-keys')
Client.prototype.bucketKeysStream = require('./lib/bucket-keys-stream')
Client.prototype.bucketStream = require('./lib/bucket-stream')
Client.prototype.bucketDeleteAll = require('./lib/bucket-delete-all')
Client.prototype.getWithKey = require('./lib/get-with-key')
Client.prototype.saveWithKey = require('./lib/save-with-key')
Client.prototype.deleteWithKey = require('./lib/delete-with-key')
Client.prototype.keyStreamWithQueryRange = require('./lib/key-stream-with-query-range')
Client.prototype.valueStreamWithQueryRange = require('./lib/value-stream-with-query-range')
Client.prototype.mapReduceStream = require('./lib/map-reduce-stream')


module.exports = Client



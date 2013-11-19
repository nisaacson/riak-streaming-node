var purgeDB = require('./lib/purge-db')
var bucketKeys = require('./lib/bucket-keys')
var bucketKeysStream = require('./lib/bucket-keys-stream')
var bucketDeleteAll = require('./lib/bucket-delete-all')
var bucketStream = require('./lib/bucket-stream')
var getWithKey= require('./lib/get-with-key')
var saveWithKey= require('./lib/save-with-key')
var deleteWithKey= require('./lib/delete-with-key')
var keyStreamWithQueryRange = require('./lib/key-stream-with-query-range')
var valueStreamWithQueryRange = require('./lib/value-stream-with-query-range')
var mapReduceStream = require('./lib/map-reduce-stream')

var defaults = require('./lib/defaults')

function Client(opts) {
  opts = opts || {}
  this.baseURL = getBaseURL(opts)
}

function getBaseURL(opts) {
  var protocol = opts.protocol || defaults.protocol
  var host = opts.host || defaults.host
  var port = opts.port || defaults.port
  var baseURL = protocol + '://' + host + ':' + port
  return baseURL
}

Client.prototype.purgeDB = purgeDB
Client.prototype.bucketKeys = bucketKeys
Client.prototype.bucketKeysStream = bucketKeysStream
Client.prototype.bucketStream = bucketStream
Client.prototype.bucketDeleteAll = bucketDeleteAll
Client.prototype.getWithKey = getWithKey
Client.prototype.saveWithKey = saveWithKey
Client.prototype.deleteWithKey = deleteWithKey
Client.prototype.keyStreamWithQueryRange = keyStreamWithQueryRange
Client.prototype.valueStreamWithQueryRange = valueStreamWithQueryRange
Client.prototype.mapReduceStream = mapReduceStream


module.exports = Client



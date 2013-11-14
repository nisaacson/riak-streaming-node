var bucketKeyStream = require('./lib/bucket-keystream')
var bucketStream = require('./lib/bucket-stream')
var defaults = require('./lib/defaults')

function Client(opts) {
  this.baseURL = getBaseURL(opts)
}

function getBaseURL(opts) {
  var protocol = opts.protocol || defaults.protocol
  var host = opts.host || defaults.host
  var port = opts.port || defaults.port
  var baseURL = protocol + '://' + host + ':' + port
  return baseURL
}

Client.prototype.bucketKeyStream = bucketKeyStream
Client.prototype.bucketStream = bucketStream


module.exports = Client



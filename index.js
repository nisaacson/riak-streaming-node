var getValue = require('./lib/get-default-value')
var getPort = require('./lib/get-default-port')
var ProtoBufClient = require('./protobuf/client')

var HttpClient = require('./http/client')

function ClientBuilder(opts) {
  opts = getOpts(opts)
  if (opts.protocol === 'protobuf') {
    return new ProtoBufClient(opts)
  }

  if (opts.protocol === 'http' || opts.protocol === 'https') {
    return new HttpClient(opts)
  }
  throw new Error('invalid protocol, protocol must be one of: [http, https, protobuff]')
}

function getOpts(opts) {
  opts = opts || {}
  opts.protocol = getValue(opts, 'protocol')
  opts.host = getValue(opts, 'host')
  opts.port = getPort(opts)
  return opts
}

module.exports = ClientBuilder



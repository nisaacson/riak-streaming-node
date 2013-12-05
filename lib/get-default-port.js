var defaults = require('./defaults')

module.exports = function getDefaultPort(opts) {
  if (opts.hasOwnProperty('port') && opts.port !== null && opts.port !== undefined) {
    return opts.port
  }
  var protocol = opts.protocol
  var defaultPort = defaults[protocol].port
  return defaultPort
}


var q = require('q')
var request = require('request')
var validateResponse = require('./validate-response')
var validStatusCodes = [200]

module.exports = function connect(opts) {
  var baseURL = this.baseURL
  return connectToServer(opts)

  function connectToServer() {
    var url = baseURL + '/'
    var requestOpts = {
      url: url,
      json: true
    }
    var deferred = q.defer()
    var cb = validateResponse(deferred, validStatusCodes, 'bucket keys')
    request(requestOpts, cb)
    return deferred.promise
  }
}

var urlPath = '/mapred?chunked=true'
var buildMapReduceJSON = require('./build-map-reduce-json')
module.exports = function getRequestOpts(opts) {
  var url = opts.baseURL + urlPath
    /*
 *var requestOpts = {
 *  hostname: opts.hostname,
 *  port: opts.port,
 *  method: 'POST',
 *  headers: {},
 *  path: url
 *}
 *requestOpts.headers['Content-Type'] = 'application/json'
 */
  var json = buildMapReduceJSON(opts)
  var requestOpts = {
    url: url,
    json: json,
    method: 'post'
  }
  return requestOpts
}

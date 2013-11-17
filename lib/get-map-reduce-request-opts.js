var buildMapReduceJSON = require('./build-map-reduce-json')

module.exports = function getRequestOpts(opts) {
  var url = getURL(opts)
  var requestOpts = {
    method: 'post',
    url: url,
    json: buildMapReduceJSON(opts)
  }
  return requestOpts
}

function getURL(opts) {
  var baseURL = opts.baseURL
  var url = [baseURL, 'mapred'].join('/')
  url += '?chunked=true'
  return url
}


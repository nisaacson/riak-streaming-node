var buildMapReducePhase = require('../lib/build-mapreduce-phase')

module.exports = function(opts) {
  var client = this.client
  var query = opts.query.map(buildMapReducePhase)
  var requestOpts = {
    inputs: opts.inputs,
    query: query
  }
  var streaming = true
  var clientOpts = {
    request: JSON.stringify(requestOpts),
    content_type: 'application/json'
  }
  var readStream = client.mapred(clientOpts, streaming)
  return readStream
}

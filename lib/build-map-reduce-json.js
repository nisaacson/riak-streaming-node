var buildMapReducePhase = require('./build-mapreduce-phase')
module.exports = function getRequestJSON(opts) {
  var inputs = opts.inputs
  var query = opts.mapReduceOpts.map(buildMapReducePhase)

  var json = {
    inputs: inputs,
    query: query
  }
  if (opts.hasOwnProperty('timeout')) {
    json.timeout = opts.timeout
  }
  return json
}


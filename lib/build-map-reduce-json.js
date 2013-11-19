var buildMapReducePhase = require('./build-mapreduce-phase')
module.exports = function getRequestJSON(opts) {
  var inputs = opts.inputs
  var query = opts.mapReduceOpts.map(buildMapReducePhase)

  var json = {
    inputs: inputs,
    query: query
  }
  return json
}


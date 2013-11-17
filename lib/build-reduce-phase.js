var buildPhase = require('./build-phase')

module.exports = function buildMapPhase(opts) {
  opts.fn = opts.reduceFunction
  var reduce = buildPhase(opts)
  var reducePhase = {
    reduce: reduce
  }
  return reducePhase
}


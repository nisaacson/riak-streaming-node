var buildPhase = require('./build-phase')
module.exports = function buildMapPhase(opts) {
  opts.fn = opts.mapFunction
  var map = buildPhase(opts)
  var mapPhase = {
    map: map
  }
  return mapPhase
}


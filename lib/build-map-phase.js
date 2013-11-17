module.exports = function buildMapPhase(opts) {
  var keep = opts.keep
  var mapFunction = opts.mapFunction
  var mapFunctionString = mapFunction.toString()
  var map = {
    language: 'javascript',
    source: mapFunctionString,
    keep: keep
  }
  if (opts.arg) {
    map.arg = opts.arg
  }
  var mapPhase = {
    map: map
  }
  return mapPhase
}


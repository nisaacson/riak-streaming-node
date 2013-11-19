module.exports = function buildMapPhase(opts) {
  var phaseType = Object.keys(opts)[0]
  var details = opts[phaseType]
  var functionString = details.fn.toString()
  var phase = {
    language: 'javascript',
    source: functionString,
    keep: details.keep
  }
  if (details.arg) {
    phase.arg = details.arg
  }
  var output = {}
  output[phaseType] = phase
  return output
}


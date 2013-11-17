module.exports = function buildMapPhase(opts) {
  var functionString = opts.fn.toString()
  var phase = {
    language: 'javascript',
    source: functionString,
    keep: opts.keep
  }
  if (opts.arg) {
    phase.arg = opts.arg
  }
  return phase
}


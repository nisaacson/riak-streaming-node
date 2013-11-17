
module.exports = function buildReducePhase(opts) {
  var keep = opts.keep
  var reduceFunction = opts.reduceFunction
  var sortFunctionString = reduceFunction.toString()
  var reduce = {
    language: 'javascript',
    source: sortFunctionString,
    keep: keep
  }
  if (opts.arg) {
    reduce.arg = opts.arg
  }
  var reducePhase = {
    reduce: reduce
  }
  return reducePhase
}


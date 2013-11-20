var getIndexKey = require('./get-index-key')

module.exports = function(opts) {
  getMapReduceOpts(opts)
  return this.mapReduceStream(opts)
}

function getMapReduceOpts(opts) {
  var indexKey = getIndexKey(opts.indexKey, opts.start)
  var mapPhase = {
    map: {
      keep: false,
      arg: indexKey,
      fn: opts.mapFn
    }
  }
  var reducePhase = {
    reduce: {
      keep: true,
      fn: opts.reduceFn
    }
  }
  opts.mapReduceOpts = [mapPhase, reducePhase]
  var inputs = {
    bucket: opts.bucket,
    index: indexKey,
    start: opts.start,
    end: opts.end
  }
  opts.inputs = inputs
  return opts
}


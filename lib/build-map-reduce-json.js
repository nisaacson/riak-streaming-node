var getIndexKey = require('./get-index-key')
var buildMapPhase = require('./build-map-phase')
var buildReducePhase = require('./build-reduce-phase')

module.exports = function getRequestJSON(opts) {
  var indexKey = getIndexKey(opts.indexKey, opts.start)
  var bucket = opts.bucket
  var inputs = {
    bucket: bucket,
    index: indexKey,
    start: opts.start,
    end: opts.end
  }

  var mapOpts = opts.mapOpts
  var mapPhase = buildMapPhase(mapOpts)
  var query = [mapPhase]

  var reduceOpts = opts.reduceOpts
  if (reduceOpts) {
    query.push(buildReducePhase(reduceOpts))
  }

  var json = {
    inputs: inputs,
    query: query
  }
  return json
}


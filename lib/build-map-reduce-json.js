var getIndexKey = require('./get-index-key')
var buildMapPhase = require('./build-map-phase')
var buildReducePhase = require('./build-reduce-phase')

module.exports = function getRequestJSON(opts) {
  var indexKey = getIndexKey(opts.indexKey)
  var bucket = opts.bucket
  var inputs = {
    bucket: bucket,
    index: indexKey,
    start: opts.start,
    end: opts.end
  }

  var mapOpts = opts.mapOpts
  var reduceOpts = opts.reduceOpts
  var mapPhase = buildMapPhase(mapOpts)
  var reducePhase = buildReducePhase(reduceOpts)

  var query = [mapPhase, reducePhase]
  var json = {
    inputs: inputs,
    query: query
  }
  return json
}


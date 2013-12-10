var util = require('util')
var Transform = require('stream').Transform
var getIndexKey = require('../lib/get-index-key')

module.exports = function(opts) {
  var client = this.client
  var query = {
    bucket: opts.bucket,
    index: getIndexKey(opts.indexKey, opts.start),
    qtype: 1, // range query, use 0 for single value query
    range_min: opts.start,
    range_max: opts.end,
    return_terms: opts.returnTerms,
  }
  if (opts.hasOwnProperty('maxResults')) {
    query.max_results = opts.maxResults
  }
  var streaming = true
  var readStream = client.getIndex(query, streaming)
  var parser = new Parser(opts)
  readStream.pipe(parser)
  readStream.on('error', function(err) {
    parser.emit('error', err)
  })
  return parser
}

function Parser(opts) {
  this.returnTerms = opts.returnTerms
  var streamOpts = {
    objectMode: true
  }
  Transform.call(this, streamOpts)
}

util.inherits(Parser, Transform)

Parser.prototype._transform = function(chunk, encoding, done) {
  var elements
  if (this.returnTerms) {
    elements = chunk.results
  } else {
    elements = chunk.keys
  }
  var boundPush = this.push.bind(this)
  elements.forEach(boundPush)
  done()
}


var util = require('util')
var Transform = require('stream').Transform
var JSONStream = require('JSONStream')

module.exports = function(readStream) {
  var jsonParser = JSONStream.parse(['data', true])
  var stringify = new Stringify()
  readStream.pipe(stringify).pipe(jsonParser)
  readStream.on('error', function(err) {
    stringify.emit('error', err)
  })
  stringify.on('error', function(err) {
    jsonParser.emit('error', err)
  })

  return jsonParser
}

function Stringify() {
  var opts = {}
  Transform.call(this, opts)
}

util.inherits(Stringify, Transform)

Stringify.prototype._transform = function(chunk, encoding, done) {
  var data = chunk.toString()
  this.push(data)
  done()
}

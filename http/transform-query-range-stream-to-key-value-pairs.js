
var util = require('util')
var Transform = require('stream').Transform

function KeyValueTransformer() {
  var opts = {
    objectMode: true
  }
  Transform.call(this, opts)
}

util.inherits(KeyValueTransformer, Transform)

KeyValueTransformer.prototype._transform = function(chunk, encoding, done) {
  var key = Object.keys(chunk)[0]
  var value = chunk[key]
  var output = {
    key: key,
    value: value
  }
  this.push(output)
  done()
}


module.exports = KeyValueTransformer

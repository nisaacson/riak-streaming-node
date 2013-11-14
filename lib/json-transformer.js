var util = require('util')
var stream = require('stream')

function Transformer(extract) {
  this.extract = extract
  stream.Transform.call(this, {
    objectMode: true
  })
}

util.inherits(Transformer, stream.Transform)
Transformer.prototype._transform = transform

function transform(chunk, encoding, done) {
  var extract = this.extract
  var data = chunk.toString('utf8')
  var json = JSON.parse(data)
  var keys = json[extract]
  keys.forEach(this.push.bind(this))
  done()
}

module.exports = Transformer

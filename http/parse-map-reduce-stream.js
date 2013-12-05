var stream = require('stream')
var JSONStream = require('JSONStream')

module.exports = function() {
  var jsonParser = JSONStream.parse(['data', true])
  var stringify = stringifyStream()
  stringify.pipe(jsonParser)
  stringify.on('error', function(err) {
    jsonParser.emit('error', err)
  })

  return jsonParser
}

function stringifyStream() {
  var stringify = new stream.Transform({
    objectMode: true
  })
  stringify._transform = function(chunk, encoding, done) {
    var data = chunk.toString('utf8')
    this.push(data)
    done()
  }
  return stringify
}

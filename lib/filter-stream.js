var stream = require('stream')

/**
 * Riak when in streaming query mode returns boundary fields between data
 * Dump those boundary fields here
 * @return (Stream) filtered stream with only keys data emitted
 */
module.exports = function filterStream(validLine) {
  var liner = new stream.Transform({
    objectMode: true
  })

  liner._transform = function(chunk, encoding, done) {
    var data = chunk.toString()
    var lines = data.split('\n')
    lines = lines.filter(validLine)
    lines.forEach(this.push.bind(this))
    done()
    return
  }

  return liner
}


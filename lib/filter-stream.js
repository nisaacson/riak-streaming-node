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
    if (this._lastLineData) {
      data = this._lastLineData + data
    }
    var lines = data.split('\n')
    lines = lines.filter(validLine)
    this._lastLineData = lines.splice(lines.length - 1, 1)[0]
    lines.forEach(this.push.bind(this))
    done()
    return
  }

  liner._flush = function(done) {
    if (this._lastLineData) {
      this.push(this._lastLineData)
    }
    this._lastLineData = null
    done()
  }
  return liner
}


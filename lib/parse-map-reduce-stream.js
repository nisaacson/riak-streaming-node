var JSONStream = require('JSONStream')
var filterStream = require('./filter-stream')

module.exports = function(readableStream) {
  var filterer = filterStream(validLine)
  var transformer = JSONStream.parse(['data', true])
  readableStream.pipe(filterer).pipe(transformer)

  readableStream.on('error', function(err) {
    filterer.emit('error', err)
  })

  filterer.on('error', function(err) {
    transformer.emit('error', err)
  })

  return transformer
}

function validLine(line) {
  var testString = '{"phase"'
  var index = line.indexOf(testString)
  if (index === 0) {
    return true
  }
  return false
}

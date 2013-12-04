var help = require('./test-helper')
var expect = require('chai').expect
var bucket, client, keys
describe('bucketsStream', function() {

  before(setupFixtures)

  it('should stream back all buckets (not for production)', function(done) {
    var found = []
    var readStream = client.bucketsStream()
    readStream.on('data', dataHandler)
    readStream.on('end', endHandler)

    function dataHandler(data) {
      found.push(data)
    }

    function endHandler() {
      expect(found.length, 'no buckets found').to.be.above(0)
      done()
    }

  })
})

function setupFixtures(cb) {
  var promise = help.saveTestData()
  promise.then(function(reply) {
    client = reply.client
    bucket = reply.bucket
    keys = reply.keys
  }).nodeify(cb)
}

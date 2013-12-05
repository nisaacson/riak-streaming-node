var help = require('../test-helper')
var expect = require('chai').expect
var bucket, client, keys
describe('http bucketKeysStream', function() {

  before(setupFixtures)

  it('should stream back all keys in bucket (not for production)', function(done) {
    var opts = {
      bucket: bucket
    }
    var foundKeys = []
    var readStream = client.bucketKeysStream(opts)
    readStream.on('data', dataHandler)
    readStream.on('end', endHandler)

    function dataHandler(data) {
      foundKeys.push(data)
    }

    function endHandler() {
      expect(foundKeys.length, 'wrong number of keys found in bucket').to.be.above(0)
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

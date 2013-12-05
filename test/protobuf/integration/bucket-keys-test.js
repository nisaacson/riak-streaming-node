var help = require('../test-helper')
var expect = require('chai').expect
var bucket, client, keys
describe('protobuf bucketKeys', function() {

  before(setupFixtures)

  it('should get all keys in bucket via a promise (not for production)', function(done) {
    var opts = {
      bucket: bucket
    }
    var promise = client.bucketKeys(opts)
    promise.then(function(foundKeys) {
      expect(foundKeys.length, 'wrong number of keys found in bucket').to.be.above(0)
      done()
    }).fail(help.failHandler).done()
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

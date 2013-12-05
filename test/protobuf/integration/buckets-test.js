var help = require('../test-helper')
var expect = require('chai').expect
var bucket, client, keys
describe('protobuf buckets', function() {

  before(setupFixtures)

  it('should get all buckets (not for production)', function(done) {
    var promise = client.buckets()
    promise.then(endHandler).fail(help.failHandler).done()

    function endHandler(found) {
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

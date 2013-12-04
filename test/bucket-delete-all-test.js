var sinon = require('sinon')
var help = require('./test-helper')
var expect = require('chai').expect
var bucket, client, keys
describe('bucketDeleteAll', function() {

  before(setupFixtures)

  it('should remove all keys in bucket via a promise (not for production)', function(done) {
    this.timeout('20s')
    this.slow('10s')
    var opts = {
      bucket: bucket,
      concurrency: 10
    }
    client.deleteWithKey = sinon.spy(client.deleteWithKey.bind(client))
    var promise = client.bucketDeleteAll(opts)
    promise.then(function() {
      return client.bucketKeys(opts)
    })
    .then(function(foundKeys) {
      expect(foundKeys.length, 'wrong number of keys found in bucket').to.equal(0)
      expect(client.deleteWithKey.callCount).to.equal(keys.length)
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

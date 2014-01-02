var expect = require('chai').expect
var q = require('q')
var help = require('../test-helper')
var bucket, client, keys

describe('http bucketDeleteAll', function() {
  before(setupFixtures)

  after(function(done) {
    this.timeout('8s')
    var promises = keys.map(deleteKey)
    q.all(promises).nodeify(done)
  })

  it('should delete all keys in bucket (this is slow)', function(done) {
    this.timeout('8s')
    this.slow('7s')
    var opts = {
      bucket: bucket
    }
    var promise = client.bucketDeleteAll(opts)
    promise.then(validateBucketKeys(0))
    .then(done)
    .done()
  })
})



function validateBucketKeys(numKeysExpected) {
  return function() {
    return client.bucketKeys(bucket)
    .then(function(keysFound){
      expect(keysFound.length).to.equal(numKeysExpected)
    })
  }
}
function deleteKey(key) {
  key = key.toString()
  var opts = {
    key: key,
    bucket: bucket
  }
  return client.deleteWithKey(opts)
  .then(function() {
    return client.getWithKey(opts).then(function(reply) {
      expect(reply).to.not.exist
    })
  })
}

function setupFixtures(cb) {
  var promise = help.saveTestData()
  promise.then(function(reply) {
    client = reply.client
    bucket = reply.bucket
    keys = reply.keys
  }).nodeify(cb)
}

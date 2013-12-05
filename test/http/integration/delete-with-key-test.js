var expect = require('chai').expect
var help = require('../test-helper')

var client, bucket, keys
describe('http deleteWithKey', function() {

  this.slow('1s')
  before(setupFixtures)

  it('should delete existing key', function(done) {
    var key = keys[0]
    expect(key).to.exist
    var promise = validateKeyExists(key)()
    promise.then(deleteKey(key))
    .then(validateKeyDoesNotExist(key))
    .then(done)
    .done()
  })

  it('should not delete existing key', function(done) {
    var key = 'missing_key'
    var promise = validateKeyDoesNotExist(key)()
    promise.then(deleteKey(key))
    .then(validateKeyDoesNotExist(key))
    .then(done)
    .done()
  })
})

function validateKeyExists(key) {
  return function() {
    var getOpts = {
      bucket: bucket,
      key: key
    }
    var promise = client.getWithKey(getOpts)
    promise.then(function(reply) {
      expect(reply).to.exist
    })
    return promise
  }
}

function validateKeyDoesNotExist(key) {
  return function() {
    var getOpts = {
      bucket: bucket,
      key: key
    }
    var promise = client.getWithKey(getOpts)
    promise.then(function(reply) {
      expect(reply).to.not.exist
    })
    return promise
  }
}

function deleteKey(key) {
  return function() {
    var deleteOpts = {
      bucket: bucket,
      key: key
    }
    var promise = client.deleteWithKey(deleteOpts)
    return promise
  }
}

function setupFixtures(cb) {
  var promise = help.saveTestData()
  promise.then(function(reply) {
    client = reply.client
    bucket = reply.bucket
    keys = reply.keys
  }).nodeify(cb)
}

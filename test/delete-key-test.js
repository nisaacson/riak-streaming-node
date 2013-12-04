var help = require('./test-helper')
var expect = require('chai').expect
var bucket, client, keys
describe('deleteWithKey', function() {

  before(setupFixtures)

  it('should delete existing key', function(done) {
    var key = keys[0]
    var promise = validateKeyExists(key)()
    promise.then(deleteKey(key))
    .then(validateKeyDoesNotExist(key))
    .then(done)
    .fail(help.failHandler).done()
  })

  it('should handle delete non-existing key', function(done) {
    var key = 'fake_key'
    expect(keys.indexOf(key)).to.be.below(0)
    var promise = validateKeyDoesNotExist(key)()
    promise.then(deleteKey(key))
    .then(validateKeyDoesNotExist(key))
    .then(done)
    .fail(help.failHandler).done()
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
    return promise.then(function(reply) {
      expect(reply).to.not.exist
    })
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

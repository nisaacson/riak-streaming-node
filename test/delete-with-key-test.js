var expect = require('chai').expect
var help = require('./test-helper')
var Client = help.require('./')
var client = new Client()

var bucket = 'test_delete_with_key_bucket'
var value = {
  id: 'test_value'
}

describe('deleteWithKey', function() {

  this.slow('1s')

  it('should delete existing key', function(done) {
    var key = 'existing_key'
    var promise = saveKey(key)
    promise.then(validateKeyExists(key))
      .then(deleteKey(key))
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

function saveKey(key) {
  var saveOpts = {
    key: key,
    value: value,
    bucket: bucket
  }
  return client.saveWithKey(saveOpts).then(validateKeyExists)
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
      expect(reply).to.equal(value)
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

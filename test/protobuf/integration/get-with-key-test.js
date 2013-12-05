var q = require('q')
var help = require('../test-helper')
var expect = require('chai').expect
var client = help.client()
var bucket = 'getWithKey_test'
var objectKey = 'object_key'
var stringKey = 'string_key'
var stringValue = 'string_value'
var stringIndexValue = 'string_index_value'
var value = { foo: 'bar' }
var indexKey = 'foo_index_key'
var indexValue = 'bar_index_value'


describe('protobuf getWithKey', function() {
  before(setupFixtures)

  it('should return undefined for missing key', function(done) {
    var opts = {
      bucket: bucket,
      key: 'not_set_key',
      returnMeta: false
    }
    var promise = client.getWithKey(opts)
    promise.then(function(reply) {
      expect(reply).to.not.exist
      done()
    }).fail(help.failHandler).done()
  })

  it('should get value object directly when returnIndices is false', function(done) {
    var opts = {
      bucket: bucket,
      key: objectKey,
      returnMeta: false
    }
    var promise = client.getWithKey(opts)
    promise.then(function(reply) {
      expect(reply).to.eql(value)
      done()
    }).fail(help.failHandler).done()
  })

  it('should get value string directly when returnMeta is false', function(done) {
    var opts = {
      bucket: bucket,
      key: stringKey,
      returnMeta: false
    }
    var promise = client.getWithKey(opts)
    promise.then(function(reply) {
      expect(reply).to.eql(stringValue)
      done()
    }).fail(help.failHandler).done()
  })

  it('should get value and indices when returnMeta is true', function(done) {
    var opts = {
      bucket: bucket,
      key: objectKey,
      returnMeta: true
    }
    var promise = client.getWithKey(opts)
    promise.then(validateObjectReplyWithIndices).then(done).fail(help.failHandler).done()
  })
})

function validateObjectReplyWithIndices(reply) {
  var indexObject
  expect(reply).to.be.an('object')
  expect(reply).to.exist
  expect(reply).to.have.ownProperty('indices')
  indexObject = reply.indices[0]
  expect(indexObject.key).to.equal(indexKey + '_bin')
  expect(indexObject.value).to.equal(indexValue)
  expect(reply).to.have.ownProperty('value')
  expect(reply.value).to.eql(value)
}

function setupFixtures(cb) {
  var promises = [saveObject(), saveString()]
  q.all(promises).nodeify(cb)
}

function saveObject() {
  var saveOpts = {
    bucket: bucket,
    key: objectKey,
    value: value,
    indices: {}
  }
  saveOpts.indices[indexKey] = indexValue
  var promise = client.saveWithKey(saveOpts)
  return promise
}

function saveString() {
  var saveOpts = {
    bucket: bucket,
    key: stringKey,
    value: stringValue,
    indices: {}
  }
  saveOpts.indices[indexKey] = stringIndexValue
  var promise = client.saveWithKey(saveOpts)
  return promise
}


var expect = require('chai').expect
var q = require('q')
var _ = require('lodash-node')
var help = require('./test-helper')
var Client = help.require('./')
var client = new Client()
var bucket = 'test_delete_all_bucket2'

var numRows = 2
var keys = []
describe('bucketDeleteAll', function() {
  before(saveTestKeys)

  after(function(done) {
    var promises = keys.map(deleteKey)
    q.all(promises).nodeify(done)
  })

  it('should delete all keys in bucket (this is slow)', function(done) {
    this.timeout('8s')
    this.slow('7s')
    var promise = client.bucketDeleteAll(bucket)
    promise.then(validateBucketKeys(0))
    .then(done)
    .done()
  })
})

function saveTestKeys(cb) {
  var startID = 20
  var endID = startID + numRows
  var range = _.range(startID, endID)
  range.forEach(function(key) {
    keys.push(key)
  })
  var promise = q.all(range.map(deleteKey))
  promise.then(validateBucketKeys(0))
  .then(function() {
    return q.all(range.map(saveKey))
  })
  .then(validateBucketKeys(range.length))
  .nodeify(cb)
}

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

function saveKey(id) {
  var key = id.toString()
  var saveOpts = {
    key: key,
    value: id,
    bucket: bucket
  }
  return client.saveWithKey(saveOpts)
}

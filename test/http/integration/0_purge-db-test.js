var q = require('q')
var expect = require('chai').expect
var help = require('../test-helper')
var sinon = require('sinon')
var Client = help.require('./')
var client = new Client()
var bucketNames = ['bucket_1', 'bucket_2', 'bucket_3']

describe('http purgeDB', function() {
  before(setupFixtures)

  it('should remove all keys in all buckets', function(done) {
    this.timeout('2m')
    this.slow('10s')
    var promise = client.purgeDB()
    var numBucketsExpected = 0
    promise.then(function() {
      return validateBuckets(numBucketsExpected)
    })
    .then(function() {
      done()
    }).fail(help.failHandler).done()
  })
})

function setupFixtures(cb) {
  var promises = bucketNames.map(saveRowInBucket)
  var numBucketsExpected = bucketNames.length
  var promise = q.all(promises)
  promise.then(getNumBuckets)
  promise.then(function(numBuckets) {
    if (numBuckets < numBucketsExpected) {
      throw new Error('wrong number of buckets found')
    }
  })
  promise.nodeify(cb)
}

function saveRowInBucket(bucketName) {
  var saveOpts = {
    key: 'test_key',
    value: 'test_value',
    bucket: bucketName
  }
  return client.saveWithKey(saveOpts)
}

function validateBuckets(numBucketsExpected, cb) {
  var promise = getNumBuckets()
  promise.then(function(numBuckets) {
    expect(numBuckets).to.equal(numBucketsExpected)
  }).nodeify(cb)
  return promise
}

function getNumBuckets() {
  var deferred = q.defer()
  var bucketStream = client.bucketsStream()
  var bucketNameStub = sinon.stub()
  bucketStream.on('data', bucketNameStub)
  bucketStream.on('end', function() {
    return deferred.resolve(bucketNameStub.callCount)
  })
  return deferred.promise
}

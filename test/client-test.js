var uuid = require('uuid')
var help = require('./test-helper')
var sinon = require('sinon')
var expect = require('chai').expect

var Client = help.require('./')

describe('Streaming Riak Client', function() {
  var client
  var bucket = 'test_suite_bucket'
  var indexKey = 'test_index'
  var start = '45!2012 01 01 00:00:00'
  var value = {
    id: uuid.v4()
  }
  var key = uuid.v4()


  before(function(done) {
    client = new Client({})
    var opts = {
      bucket: bucket,
      value: value,
      indices: {},
      key: key
    }
    opts.indices[indexKey] = start
    var promise = client.saveWithKey(opts)
    promise.then(function() {
      return client.getWithKey(opts)
    }).then(function(reply) {
      expect(reply).to.eql(opts.value)
      done()
    }).fail(function(err) {
      help.inspect(err, 'before error')
      done(err)
    }).done()
  })

  after(function(done) {
    var opts = {
      key: key,
      value: value
    }
    var promise = client.deleteWithKey(opts)
    promise.then(function() {
      done()
    }).fail(failHandler).done()
  })

  it('client.bucketKeysStream should stream back keys', function(done) {
    this.slow(200)
// var bucket = 'installation_ids'
    var keyStream = client.bucketKeysStream(bucket)
    expect(keyStream).to.exist
    var dataSpy = sinon.spy(logKey)
    keyStream.on('data', dataSpy)
    keyStream.on('end', function() {
      expect(dataSpy.callCount).to.be.above(0)
      done()
    })
  })

  it('should stream bucket names', function(done) {
    this.slow('.5s')
    var stream = client.bucketStream()
    expect(stream).to.exist
    var dataSpy = sinon.spy(logKey)
    stream.on('data', dataSpy)
    stream.on('end', function() {
      expect(dataSpy.callCount).to.be.above(0)
      done()
    })
  })

  it('should get key in bucket', function(done) {
    this.slow('.5s')
    var opts = {
      bucket: bucket,
      key: key
    }
    var promise = client.getWithKey(opts)
    promise.then(function(reply) {
      expect(reply).to.eql(value)
      done()
    }).done()
  })

  it('should handle missing key in bucket', function(done) {
    var key = 'testKey'
    this.slow('.5s')
    var opts = {
      bucket: bucket,
      key: key
    }
    var promise = client.getWithKey(opts)
    promise.then(function(reply) {
      expect(reply).to.not.exist
      done()
    }).done()
  })

})

function failHandler(err) {
  inspect(err, 'error')
  throw err
}

function logKey(key) {
  expect(key).to.exist
}

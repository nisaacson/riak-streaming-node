// var inspect = require('eyespect').inspector()
var sinon = require('sinon')
var expect = require('chai').expect

var Client = require('../')

describe('Bucket Keystream', function() {
  var client
  var bucket = 'installation_ids'


  before(function(done) {
    client = new Client({})
    expect(client).to.have.property('bucketKeyStream')
    expect(client.bucketKeyStream).to.be.a('function')

    expect(client).to.have.property('bucketStream')
    expect(client.bucketStream).to.be.a('function')
    done()
  })

  it('should create keystream for bucket correctly', function(done) {
    this.slow(200)
    var keyStream = client.bucketKeyStream(bucket)
    expect(keyStream).to.exist
    var dataSpy = sinon.spy(logKey)
    keyStream.on('data', dataSpy)
    keyStream.on('end', function() {
      expect(dataSpy.callCount).to.be.above(10)
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
      expect(dataSpy.callCount).to.be.above(1)
      done()
    })
  })



})

function logKey(key) {
  expect(key).to.exist
  expect(key).to.be.a('string')
}

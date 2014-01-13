var sinon = require('sinon')
var help = require('../test-helper')
var expect = require('chai').expect
var client,
  bucket,
  keys
describe('http search', function() {

  before(setupFixtures)

  it('should get search results', function(done) {
    this.slow('2s')
    var opts = {
      index: bucket,
      q: 'value_*', // query
      df: 'bar', // default field
      start: 0,
      rows: 1, // limit number of results
      sort: 'bar',
      filter: '',
      presort: 'key',
    }
    var promise = client.search(opts)
    promise.then(endHandler).fail(help.failHandler).done()

    function endHandler(reply) {
      expect(reply).to.be.an('object')
      expect(reply).to.have.ownProperty('docs')
      expect(reply).to.have.ownProperty('numFound')
      expect(reply).to.have.ownProperty('start')

      var docs = reply.docs
      expect(docs).to.be.an('array')
      expect(docs.length).to.equal(opts.rows)
      expect(reply.numFound).to.be.above(docs.length)
      done()
    }
  })

  it('should stream search results (with maxRows set)', function(done) {
    this.slow('2s')
    var maxRows = 2
    var opts = {
      index: bucket,
      q: 'bar:value_*', // query
      start: 0, // offset
      rows: 1, // limit number of results per page
      maxRows: maxRows, // limit total number of results returned
      sort: 'bar',
      filter: '',
      presort: 'key',
    }
    var stream = client.searchStream(opts)
    var dataHandlerSpy = sinon.spy(validateChunk)
    expect(stream).to.exist
    stream.on('data', dataHandlerSpy)
    stream.on('finish', finishHandler)

    function finishHandler() {
      expect(dataHandlerSpy.callCount, 'wrong number of "data" events on stream').to.equal(maxRows)
      done()
    }
  })

  it('should stream search results (without maxRows set)', function(done) {
    this.slow('2s')
    var opts = {
      index: bucket,
      q: 'bar:value_*', // query
      start: 0, // offset
      rows: 1, // limit number of results per page
      sort: 'bar',
      filter: '',
      presort: 'key',
    }
    var stream = client.searchStream(opts)
    var dataHandlerSpy = sinon.spy(validateChunk)
    expect(stream).to.exist
    stream.on('data', dataHandlerSpy)
    stream.on('finish', finishHandler)

    function finishHandler() {
      expect(dataHandlerSpy.callCount, 'wrong number of "data" events on stream').to.equal(keys.length)
      done()
    }
  })
})

function validateChunk(chunk) {
  expect(chunk).to.be.an('object')
  expect(chunk).to.have.ownProperty('id')
  expect(chunk).to.have.ownProperty('index')
  expect(chunk).to.have.ownProperty('fields')
  expect(chunk).to.have.ownProperty('props')
  var fields = chunk.fields
  expect(fields).to.not.have.ownProperty('id')
  expect(fields).to.be.an('object')
}

function setupFixtures(cb) {
  var promise = help.saveTestData()
  promise.then(function(reply) {
      client = reply.client
      bucket = reply.bucket
      keys = reply.keys
    }).nodeify(cb)
}

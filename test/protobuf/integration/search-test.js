var sinon = require('sinon')
var expect = require('chai').expect

var help = require('../test-helper')
var bucket,
  client,
  keys

describe('protobuf search', function() {

  before(setupFixtures)

  it('should get search results', function(done) {
    this.slow('2s')
    var opts = {
      index: bucket,
      q: 'value_*', // query
      df: 'bar', // default field
      start: 0,
      rows: 4, // limit number of results
      sort: 'bar',
      filter: '',
      presort: 'key',
    }
    var promise = client.search(opts)
    promise.then(endHandler).fail(help.failHandler).done()

    function endHandler(reply) {
      validateReplyKeys(reply)

      var numFound = reply.numFound
      expect(numFound, 'numFound is wrong').to.equal(keys.length)

      var start = reply.start
      expect(start, 'reply.start is wrong').to.equal(opts.start)

      var docs = reply.docs
      expect(docs).to.be.an('array')
      expect(docs.length).to.equal(opts.rows)
      docs.forEach(validateDoc)
      done()
    }
  })

  function validateReplyKeys(reply) {
    expect(reply).to.be.an('object')
    expect(reply).to.have.ownProperty('docs')
    expect(reply).to.have.ownProperty('numFound')
    expect(reply).to.have.ownProperty('start')
  }

  function validateDoc(doc) {
    expect(doc).to.be.an('object')
    expect(doc).to.have.ownProperty('fields')
    var fields = doc.fields
    expect(fields).to.be.an('object')
  }

  it('should stream search results (without maxKeys set)', function(done) {
    this.slow('2s')
    var opts = {
      index: bucket,
      q: 'bar:value_*', // query
      start: 0,
      rows: 2, // limit number of results
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

  it('should stream search results (with maxRows set)', function(done) {
    this.slow('2s')
    var maxRows = 2
    var opts = {
      index: bucket,
      q: 'bar:value_*', // query
      start: 0,
      maxRows: maxRows,
      rows: 1, // limit number of results
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

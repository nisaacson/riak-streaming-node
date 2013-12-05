var sinon = require('sinon')
var expect = require('chai').expect

var help = require('../test-helper')
var getIndexKey = help.require('./lib/get-index-key')

var client, bucket, keys, indexKey

describe('http mapReduceStream', function() {
  before(setupFixtures)

  it('should stream back mapreduce results', function(done) {
    this.slow('1s')
    var opts = getMapReduceOpts()
    var readStream = client.mapReduceStream(opts)
    validateStream(readStream, done)
  })
})

function validateStream(readStream, cb) {
  expect(readStream).to.exist
  var prevIndex
  var dataSpy = sinon.spy(function(chunk) {
    validateChunk(chunk)
    var data = chunk.data
    expect(data).to.exist
    expect(data).to.be.an('object')
    var index = chunk.index
    if(!prevIndex) {
      prevIndex = index
      return
    }
    expect(index, 'index out of order').to.be.above(prevIndex)
    prevIndex = index
  })

  readStream.on('data', dataSpy)
  readStream.on('end', function() {
    expect(dataSpy.callCount).to.equal(keys.length)
    cb()
  })
}

function validateChunk(chunk) {
  expect(chunk).to.exist
  expect(chunk).to.be.an('object')
  expect(chunk.data, 'data field missing from chunk').to.exist
  expect(chunk.index, 'index field missing from chunk').to.exist
}

function getMapReduceOpts() {
  var start = '!'
  var end = '~'
  var fullIndexKey = getIndexKey(indexKey, start)
  var opts = {}
  var inputs = {
    bucket: bucket,
    index: fullIndexKey,
    start: start,
    end: end
  }
  opts.query = getQuery(fullIndexKey)
  opts.inputs = inputs
  opts.timeout = 10*1000
  return opts
}

function getQuery(fullIndexKey) {
  var query = []
  var mapPhase = getMapPhaseOpts(fullIndexKey)
  var reducePhase = getReducePhaseOpts()
  query.push(mapPhase)
  query.push(reducePhase)
  return query
}

function getMapPhaseOpts(fullIndexKey) {
  var mapPhaseOpts = {
    map: {
      fn: mapFunction,
      keep: false,
      arg: fullIndexKey
    }
  }
  return mapPhaseOpts
}

function getReducePhaseOpts() {
  var reducePhaseOpts = {
    reduce: {
      fn: reduceFunction,
      keep: true,
      arg: 'foo'
    }
  }
  return reducePhaseOpts
}

function mapFunction(value, keyData, arg) {
  var contentType = value.values[0].metadata['content-type']
  var data = value.values[0].data
  if (contentType === 'application/json') {
    data = JSON.parse(data)
  }
  var metadata = value.values[0].metadata
  var index = metadata.index[arg]
  var output = {
    data: data,
    index: index
  }
  return [output]
}

function reduceFunction(list) {
  var sorted = list.sort(function(a, b) {
    var aIndex = a.index
    var bIndex = b.index
    return aIndex.localeCompare(bIndex)
  })
  return sorted
}

function setupFixtures(cb) {
  var promise = help.saveTestData()
  promise.then(function(reply) {
    client = reply.client
    bucket = reply.bucket
    keys = reply.keys
    indexKey = reply.indexKey
  }).nodeify(cb)
}

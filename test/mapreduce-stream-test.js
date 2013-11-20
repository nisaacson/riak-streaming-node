var _ = require('lodash-node')
var sinon = require('sinon')
var q = require('q')
var expect = require('chai').expect

var help = require('./test-helper')
var getIndexKey = help.require('./lib/get-index-key')
var Client = help.require('./')

var client = new Client()
var bucket = 'mapreduce_test'
var baseIndexKey = 'index'
var numRows = 20

var rowKeys = []
describe('Build Mapreduce json', function() {
  before(setupFixtures)
  after(deleteRows)

  it('should stream back mapreduce results', function(done) {
    this.slow('1s')
    var opts = getMapReduceOpts()
    var prevIndex
    var dataSpy = sinon.spy(function(data) {
      expect(data).to.exist
      expect(data).to.be.an('object')
      var index = data.index
      if(!prevIndex) {
        prevIndex = index
        return
      }
      expect(index).to.be.above(prevIndex)
      prevIndex = index
    })

    var readStream = client.mapReduceStream(opts)
    expect(readStream).to.exist
    readStream.on('data', dataSpy)
    readStream.on('end', function() {
      expect(dataSpy.callCount).to.equal(numRows)
      done()
    })
  })

})

function getMapReduceOpts() {
  var indexKey = getIndexKey(baseIndexKey, 'start')
  var mapPhaseOpts = {
    map: {
      fn: mapFunction,
      keep: false,
      arg: indexKey
    }
  }
  var mapReduceOpts = []
  mapReduceOpts.push(mapPhaseOpts)
  var reducePhaseOpts = {
    reduce: {
      fn: reduceFunction,
      keep: true,
      arg: 'foo'
    }
  }
  mapReduceOpts.push(reducePhaseOpts)
  var opts = {}
  var start = '!'
  var end = '~'
  var inputs = {
    bucket: bucket,
    index: indexKey,
    start: start,
    end: end
  }
  opts.mapReduceOpts = mapReduceOpts
  opts.inputs = inputs
  return opts
}

function mapFunction(value, keyData, arg) {
  var data = Riak.mapValuesJson(value)[0]
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
  var startID = 100
  var endID = startID + numRows
  var range = _.range(startID, endID)
  var promises = range.map(saveRow)
  var promise = q.all(promises)
  promise.nodeify(cb)
}

function saveRow(id) {
  var key = 'key_' + id
  var value = {
    foo: 'value_' + id
  }
  var indexValue = 'index_value_' + id

  var opts = {
    key: key,
    value: value,
    bucket: bucket,
    indices: {}
  }
  opts.indices[baseIndexKey] = indexValue
  var promise = client.saveWithKey(opts)
  promise.then(function() {
    rowKeys.push(key)
  })
  return promise
}

function deleteRows(cb) {
  var promises = rowKeys.map(deleteKey)
  var promise = q.all(promises)
  promise.nodeify(cb)
}

function deleteKey(key) {
  var opts = {
    bucket: bucket,
    key: key
  }
  return client.deleteWithKey(opts)
  .then(function() {
  })
}


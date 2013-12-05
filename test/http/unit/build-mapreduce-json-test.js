var expect = require('chai').expect
var help = require('../test-helper')

var buildMapReduceJSON = help.require('./http/build-map-reduce-json')

describe('http Build Mapreduce json', function() {

  it('should build json with map and reduce phases', function() {
    var mapPhaseOpts = {
      map: {
        fn: testFunction,
        keep: false,
        arg: 'foo'
      }
    }
    var reducePhaseOpts = {
      reduce: {
        fn: testFunction,
        keep: true,
        arg: 'foo'
      }
    }
    var query = [mapPhaseOpts, reducePhaseOpts]
    var opts = {}
    var inputs = {
      bucket: 'test_bucket',
      indexKey: 'test_index_key',
      start: 'test_start',
      end: 'test_end'
    }
    opts.query = query
    opts.inputs = inputs
    var json = buildMapReduceJSON(opts)
    validateJSON(json, query, inputs)
  })
})


function validateJSON(json, sourceQuery, inputs) {
  expect(json, 'no json object returned').to.exist
  expect(json).to.be.an('object')
  expect(json).to.have.ownProperty('inputs')
  expect(json.inputs).to.eql(inputs)

  expect(json).to.have.ownProperty('query')
  var query = json.query
  expect(query).to.be.an('array')
  expect(query.length, 'wrong query array length').to.equal(sourceQuery.length)
}

function testFunction(list) {
  list = list.map(function(row) {
    return row.toString()
  })
  return list
}

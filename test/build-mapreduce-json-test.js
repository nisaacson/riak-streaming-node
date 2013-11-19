var expect = require('chai').expect
var help = require('./test-helper')

var buildMapReduceJSON = help.require('./lib/build-map-reduce-json')

describe('Build Mapreduce json', function() {

  it('should build json with map and reduce phases', function() {
    var mapReduceOpts = []
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
    mapReduceOpts = [mapPhaseOpts, reducePhaseOpts]
    var opts = {}
    var inputs = {
      bucket: 'test_bucket',
      indexKey: 'test_index_key',
      start: 'test_start',
      end: 'test_end'
    }
    opts.mapReduceOpts = mapReduceOpts
    opts.inputs = inputs
    var json = buildMapReduceJSON(opts)
    validateJSON(json, mapReduceOpts, inputs)
  })
})


function validateJSON(json, mapReduceOpts, inputs) {
  expect(json).to.exist
  expect(json).to.be.an('object')
  expect(json).to.have.ownProperty('inputs')
  expect(json.inputs).to.eql(inputs)

  expect(json).to.have.ownProperty('query')
  var query = json.query
  expect(query).to.be.an('array')
  expect(query.length).to.equal(mapReduceOpts.length)
}

function testFunction(list) {
  list = list.map(function(row) {
    return row.toString()
  })
  return list
}

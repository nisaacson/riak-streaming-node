var expect = require('chai').expect
var help = require('./test-helper')

var buildMapReducePhase = help.require('./lib/build-mapreduce-phase')

describe('Build Mapreduce phase', function() {
  it('should build reduce phase correctly', function() {
    var opts = {
      reduce: {
        fn: testFunction,
        keep: true,
        arg: 'foo'
      }
    }
    var reducePhase = buildMapReducePhase(opts)
    validatePhase(reducePhase, opts)
  })

  it('should build map phase correctly', function() {
    var opts = {
      map: {
        fn: testFunction,
        keep: true,
        arg: 'foo'
      }
    }
    var phase = buildMapReducePhase(opts)
    validatePhase(phase, opts)
  })
})

function testFunction(list) {
  list = list.map(function(row) {
    return row.toString()
  })
  return list
}


function validatePhase(phase, opts) {
  var phaseType = Object.keys(opts)[0]
  expect(phaseType).to.be.a('string')
  // phase
  expect(phase).to.be.an('object')

  //phase.phaseType
  expect(phase).to.have.ownProperty(phaseType)
  var details = phase[phaseType]
  var input = opts[phaseType]
  expect(details).to.be.an('object')
  validatePhaseSource(details, input)
  validatePhaseLanguage(details)
  validatePhaseArg(details, input)
}

function validatePhaseSource(details, input) {
  //phase.phaseType.source
  expect(details).to.have.ownProperty('source')
  expect(details.source).to.be.a('string')
  expect(details.source).to.equal(input.fn.toString())
}

function validatePhaseLanguage(details) {
  //phase.phaseType.source
  expect(details).to.have.ownProperty('language')
  expect(details.language).to.be.a('string')
  expect(details.language).to.equal('javascript')
}

function validatePhaseArg(details, input) {
  //phase.phaseType.source
  expect(details).to.have.ownProperty('arg')
  expect(details.arg).to.equal(input.arg)
}

var q = require('q')
var expect = require('chai').expect
var help = require('../test-helper')
var client =  help.client()

describe('http saveWithKey', function() {
  var valueObject = {
    foo: 'bar'
  }

  function getSaveOpts() {
    return {
      bucket: 'test_saveWithKey',
      key: 'test_key',
      value: valueObject,
      returnBody: true,
      returnMeta: true
    }
  }
  it('should save json object correctly when returnBody is false', function(done) {
    var saveOpts = getSaveOpts()
    saveOpts.returnBody = false
    client.saveWithKey(saveOpts).then(function(reply) {
      expect(reply).to.not.exist
      done()
    }).fail(help.failHandler).done()
  })


  it('should save json object correctly when returnBody is true', function(done) {
    var saveOpts = getSaveOpts()
    client.saveWithKey(saveOpts).then(function(reply) {
      expect(reply.value).to.eql(valueObject)
      expect(reply.headers).to.exist
      done()
    }).fail(help.failHandler).done()
  })

  it('should save with secondary indices', function(done) {
    var row1 = getSaveOpts()
    row1.key = 'bb'
    row1.indices = {
      'test_integer_key': 'bb'
    }
    var row2 = getSaveOpts()
    row2.key = 'aa'
    row2.indices = {
      'test_integer_key': 'aa'
    }
    var rows = [row1, row2]
    var promise = q.all(rows.map(saveRow))
    promise.then(validateIndexSaved).then(done).fail(help.failHandler).done()
  })
})

function saveRow(saveOpts) {
  return client.saveWithKey(saveOpts).then(function(reply) {
    return reply
  })
}

function validateIndexSaved(rows) {
  rows.forEach(function(data) {
    expect(data.indices, 'indices missing from data').to.exist
    expect(data.indices).to.be.an('array')
    expect(data.indices.length).to.equal(1)
    var row = data.indices[0]
    expect(row).to.be.an('object')
    expect(row).to.haveOwnProperty('key')
    expect(row).to.haveOwnProperty('value')

    expect(row.key).to.be.a('string')
    expect(row.key).to.not.be.empty

    expect(row.value).to.be.a('string')
    expect(row.value).to.not.be.empty
  })
}

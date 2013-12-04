var _ = require('lodash-node')
var q = require('q')
var expect = require('chai').expect
var help = require('./test-helper')
var Client = help.require('./')
var client = new Client()

describe('saveWithKey', function() {
  var valueObject = {
    foo: 'bar'
  }

  function getSaveOpts() {
    return {
      bucket: 'test_saveWithKey',
      key: 'test_key',
      value: valueObject,
      returnBody: true
    }
  }

  it('should save json object correctly when returnBody is true', function(done) {
    var saveOpts = getSaveOpts()
    client.saveWithKey(saveOpts).then(function(reply) {
      expect(reply.value).to.eql(valueObject)
      done()
    }).fail(help.failHandler).done()
  })

  it('should save json object correctly when returnBody is true', function(done) {
    var saveOpts = getSaveOpts()
    saveOpts.returnBody = false
    client.saveWithKey(saveOpts).then(function(reply) {
      expect(reply.value).to.not.exist
      done()
    }).fail(help.failHandler).done()
  })

  it('should save json object correctly when returnBody is true', function(done) {
    var saveOpts = getSaveOpts()
    saveOpts.returnBody = false
    client.saveWithKey(saveOpts).then(function(reply) {
      expect(reply.value).to.not.exist
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
    promise.then(validateKeysInAscendingOrder).then(done).fail(help.failHandler).done()
  })
})

function saveRow(saveOpts) {
  return client.saveWithKey(saveOpts).then(function(reply) {
    return reply
  })
}

function extractKeys(rows) {
  var keys = []
  rows.forEach(function(row) {
    var indices = row.indexes
    indices.forEach(function(element) {
      keys.push(element.value)
    })
  })
  return keys
}

function validateKeysInAscendingOrder(data) {
  var keys = extractKeys(data)
  var prev
  keys.forEach(function(key) {
    if (!prev) {
      prev = key
      return
    }
    expect(key).to.be.below(prev)
    prev = key
  })
}

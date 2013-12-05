var q = require('q')
var _ = require('lodash-node')
var expect = require('chai').expect
var help = require('../test-helper')
var Client = help.require('./')

var numRows, client
var bucket = 'http_test'
var indexKey = 'http_index_key'

help.client = function () {
  var opts = {
    protocol: 'protobuf'
  }
  var client = new Client(opts)
  expect(client, 'failed to create http client').to.exist
  return client
}

help.saveTestData = function saveTestData(rowsToSave) {
  numRows = rowsToSave || 5
  var clientOpts = {
    protocol: 'http'
  }

  client = new Client(clientOpts)
  var range = _.range(1,numRows)
  var promise = q.all(range.map(saveRow))
  return promise.then(function(keys) {
    var output = {
      client: client,
      bucket: bucket,
      keys: keys,
      indexKey: indexKey
    }
    return output
  })
}

function saveRow(id) {
  var key = id + '_key'
  var value = {
    bar: id + '_value'
  }
  var indexValue = id.toString()
  var saveOpts = {
    bucket: bucket,
    key: key,
    value: value,
    indices: {}
  }
  saveOpts.indices[indexKey] = indexValue
  var promise = client.saveWithKey(saveOpts)
  return promise.then(function() {
    return key
  })
}

module.exports = help

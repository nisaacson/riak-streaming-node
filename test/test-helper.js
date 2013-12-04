var inspect = require('eyespect').inspector()
var q = require('q')
var _ = require('lodash-node')
var path = require('path')
var chai = require('chai')
chai.Assertion.includeStack = true

var Client = requireRelative('./')
var bucket = 'test_general_bucket'
var client

module.exports = {
  inspect: inspect,
  require: requireRelative,
  failHandler: failHandler,
  saveTestData: saveTestData
}

function saveTestData() {
  client = new Client()
  var range = _.range(0,3)
  var promise = q.all(range.map(saveRow))
  return promise.then(function(keys) {
    var output = {
      client: client,
      bucket: bucket,
      keys: keys
    }
    return output
  })
}

function saveRow(id) {
  var key = id + '_key'
  var value = {
    bar: id + '_value'
  }
  var saveOpts = {
    bucket: bucket,
    key: key,
    value: value
  }
  var promise = client.saveWithKey(saveOpts)
  return promise.then(function() {
    return key
  })
}
function failHandler(err) {
  inspect(err, 'error')
  throw err
}

function requireRelative(relativePath) {
  return require(path.join(__dirname, '..', relativePath))
}

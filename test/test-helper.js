var inspect = require('eyespect').inspector()
var path = require('path')
var chai = require('chai')
chai.Assertion.includeStack = true

module.exports = {
  inspect: inspect,
  require: requireRelative
}

function requireRelative(relativePath) {
  return require(path.join(__dirname, '..', relativePath))
}

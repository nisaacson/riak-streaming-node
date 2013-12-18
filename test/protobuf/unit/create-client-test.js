var expect = require('chai').expect
var help = require('../test-helper')
var Client = help.require('./')

describe('Create Client', function() {
  it('should create client with only protobuf protocol option', function() {
    var opts = {
      protocol: 'protobuf'
    }
    var client = new Client(opts)
    validateWithProtocol(client, opts.protocol)
  })

  it('should support disconnect', function() {
    var opts = {
      protocol: 'https'
    }
    var client = new Client(opts)
    client.disconnect()
  })
})

function validateWithProtocol(client, protocol) {
  expect(client).to.exist
  expect(client.protocol).to.equal(protocol)
}


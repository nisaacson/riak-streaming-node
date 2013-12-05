var expect = require('chai').expect
var help = require('../test-helper')
var Client = help.require('./')

describe('Create Client', function() {
  it('should create client with only http protocol option', function() {
    var opts = {
      protocol: 'http'
    }
    var client = new Client(opts)
    validateWithProtocol(client, opts.protocol)
  })

  it('should create client with only https protocol option', function() {
    var opts = {
      protocol: 'https'
    }
    var client = new Client(opts)
    validateWithProtocol(client, opts.protocol)
  })
})

function validateWithProtocol(client, protocol) {
  expect(client).to.exist
  expect(client).to.have.ownProperty('baseURL')
  expect(client.baseURL).to.be.a('string')
  expect(client.baseURL).to.not.be.empty
  expect(client.protocol).to.equal(protocol)
}


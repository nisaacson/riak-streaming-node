var expect = require('chai').expect
var help = require('../test-helper')
var Client = help.require('./')

describe('protobuf Client Connect', function() {

  it('should connect client with protobuf protocol', function (done) {
    this.slow('.2s')
    var opts = {
      protocol: 'protobuf',
      host: 'localhost',
      port: 8087
    }
    var client = new Client(opts)
    validateWithProtocol(client, opts.protocol).nodeify(done)
  })

  it('should throw error when client cannot connect', function (done) {
    var opts = {
      protocol: 'protobuf',
      host: 'localhost',
      port: 1111,
      timeout: 10
    }
    var client = new Client(opts)
    client.connect().fail(function(err) {
      expect(err).to.exist
      expect(err.message).to.equal('Connection timeout')
      done()
    }).done()
  })
})

function validateWithProtocol(client, protocol) {
  expect(client).to.exist
  expect(client).to.not.have.ownProperty('baseURL')
  expect(client.protocol).to.equal(protocol)
  return client.connect()
  .then(validateConnectReply)
}

function validateConnectReply(reply) {
  expect(reply).to.not.exist
}


var expect = require('chai').expect
var help = require('../test-helper')
var Client = help.require('./')

describe('http Create Client Connect', function() {

  it('should connect client with http protocol', function (done) {
    this.slow('.2s')
    var opts = {
      protocol: 'http',
      host: 'localhost',
      port: 8098
    }
    var client = new Client(opts)
    validateWithProtocol(client, opts.protocol).nodeify(done)
  })

  it('should throw error when client cannot connect', function (done) {
    var opts = {
      protocol: 'http',
      host: 'localhost',
      port: 1111,
      timeout: 10
    }
    var client = new Client(opts)
    client.connect().fail(function(err) {
      expect(err).to.exist
      expect(err.message).to.equal('connect ECONNREFUSED')
      done()
    }).done()
  })
})

function validateWithProtocol(client, protocol) {
  expect(client).to.exist
  expect(client).to.have.ownProperty('baseURL')
  expect(client.baseURL).to.be.a('string')
  expect(client.baseURL).to.not.be.empty
  expect(client.protocol).to.equal(protocol)
  return client.connect()
  .then(validateConnectReply)
}

function validateConnectReply(reply) {
  expect(reply).to.have.ownProperty('value')
  expect(reply).to.have.ownProperty('headers')

  // headers
  var headers = reply.headers
  expect(headers).to.be.an('object')
  expect(headers.date).to.be.a('string')
  expect(headers.date).to.not.be.empty

  // value
  var data = reply.value
  expect(data).to.exist
  expect(data).to.be.an('object')
  expect(Object.keys(data).length).to.be.above(0)
}


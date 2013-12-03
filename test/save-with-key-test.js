var expect = require('chai').expect
var help = require('./test-helper')
var Client = help.require('./')
var client = new Client()

describe('saveWithKey', function() {
  var valueObject = {
    foo: 'bar'
  }
  var saveOpts = {
    bucket: 'test_saveWithKey',
    key: 'test_key',
    value: valueObject,
    returnBody: true
  }

  it('should save json object correctly when returnBody is true', function(done) {
    client.saveWithKey(saveOpts).then(function(reply) {
      expect(reply.value).to.eql(valueObject)
      done()
    }).fail(help.failHandler).done()
  })

  it('should save json object correctly when returnBody is true', function(done) {
    saveOpts.returnBody = false
    client.saveWithKey(saveOpts).then(function(reply) {
      help.inspect(reply,' reply')
      expect(reply.value).to.not.exist
      done()
    }).fail(help.failHandler).done()
  })

  it('should save string object correctly when returnBody is true', function(done) {
    saveOpts.value = 'string_value'
    saveOpts.returnBody = true
    client.saveWithKey(saveOpts).then(function(reply) {
      help.inspect(reply.value,' reply')
      expect(reply.value).to.eql(saveOpts.value)
      done()
    }).fail(help.failHandler).done()
  })
})

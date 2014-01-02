var help = require('../test-helper')
var expect = require('chai').expect
var bucket,
  client,
  keys

describe.skip('protobuf search (not yet implemented)', function() {

  before(setupFixtures)

  it('should get search results', function(done) {
    this.slow('2s')
    var opts = {
      index: bucket,
      q: 'value_*', // query
      df: 'bar', // default field
      start: 0,
      rows: 4, // limit number of results
      sort: 'bar',
      filter: '',
      presort: 'key',
    }
    var promise = client.search(opts)
    promise.then(endHandler).fail(help.failHandler).done()

    function endHandler(reply) {
      return done('not done')
      help.inspect(reply)
      expect(reply).to.be.an('object')
      expect(reply).to.have.ownProperty('docs')
      expect(reply).to.have.ownProperty('numFound')
      expect(reply).to.have.ownProperty('start')

      var docs = reply.docs
      expect(docs).to.be.an('array')
      expect(docs.length).to.equal(opts.rows)
      expect(reply.numFound).to.be.above(docs.length)
      done()
    }

  })
})

function setupFixtures(cb) {
  help.inspect('save test data')
  var promise = help.saveTestData()
  promise.then(function(reply) {
      client = reply.client
      bucket = reply.bucket
      keys = reply.keys
    }).nodeify(cb)
}

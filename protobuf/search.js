var inspect = require('eyespect').inspector()
var q = require('q')

module.exports = function search(opts) {
  var self = this
  return performSearch(opts).then(parseResponse)

  function performSearch(opts) {
    var client = self.client
    var deferred = q.defer()
    inspect(opts, 'search opts')
    try {
      client.search(opts, cb)
    } catch (err) {
      deferred.reject(err)
    }
    return deferred.promise

    function cb(err, reply) {
      if (err) {
        return deferred.reject(err)
      }
      inspect(err, 'search error')
      inspect(reply, 'reply')
      deferred.resolve(reply)
    }

  }
  function parseResponse(reply) {
    var docs = reply.docs || []
    var output = {
      numFound: docs.length,
      docs: docs,
      start: opts.start
    }
    return output
  }
}

var q = require('q')

module.exports = function search(opts) {
  var self = this
  return performSearch(opts).then(parseResponse)

  function performSearch(opts) {
    var client = self.client
    var deferred = q.defer()
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
      deferred.resolve(reply)
    }
  }
  function parseResponse(reply) {
    var docs = reply.docs || []
    var output = {
      numFound: reply.num_found,
      docs: parseDocs(opts, docs),
      start: opts.start
    }
    return output
  }
}

function parseDocs(opts, docs) {
  return docs.map(parseSingleDoc)

  function parseSingleDoc(doc) {
    doc.index = opts.index
    doc.props = {}
    doc.fields = doc.fields.reduce(function(a, b) {
      var key = b.key
      var value = b.value.toString()
      if (key === 'id') {
        doc.id = value
        return a
      }
      a[key] = value
      return a
    }, {})
    return doc
  }
}

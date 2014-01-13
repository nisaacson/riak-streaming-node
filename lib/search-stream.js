var async = require('async')
var PassThrough = require('stream').PassThrough

module.exports = function searchStream(opts) {
  var self = this
  opts.rows = opts.rows || 20
  var maxRows = opts.maxRows
  delete opts.maxRows
  var currentTotalFound = 0
  var pagesPending = true
  var searchOpts = opts
  var writerOpts = {
    objectMode: true
  }
  var writer = new PassThrough(writerOpts)
  async.whilst(morePages, fetchPage, finalCB)
  return writer

  function morePages() {
    return pagesPending
  }
  function finalCB(err) {
    if (err) {
      writer.emit('error', err)
      return
    }
    writer.end()
  }

  function writeDocs(docs) {
    docs.forEach(writeSingleDoc)
  }

  function writeSingleDoc(doc) {
    writer.write(doc)
  }

  function fetchPage(cb) {
    var promise = self.search(searchOpts)
    return promise.then(streamReply).then(setSearchOpts).nodeify(cb)

    function streamReply(reply) {
      writeDocs(reply.docs)
      return reply
    }

    function setSearchOpts(reply) {
      if (!shouldSearchAgain(reply)) {
        pagesPending = false
        return
      }
      searchOpts.start = reply.start + reply.docs.length
    }
  }

  function shouldSearchAgain(reply) {
    var numFound = reply.numFound
    var start = reply.start
    var numDocs = reply.docs.length
    var numPending = numFound - numDocs - start
    currentTotalFound += numDocs
    if (numPending === 0) {
      return false
    }

    if (maxRows && (currentTotalFound >= maxRows)) {
      return false
    }
    return true
  }
}

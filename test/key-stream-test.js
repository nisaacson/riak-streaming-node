var help = require('./test-helper')
var inspect = help.inspect
var expect = require('chai').expect
var sinon = require('sinon')
var q = require('q')
var moment = require('moment')
var time = moment()
var _ = require('lodash-node')
// var crypto = require('crypto')

var Client = help.require('./')
var client = new Client({})
var indexKey = 'key_stream_index'
var bucket = 'key_stream_test'
var rowKeys = []
var numRows = 20

describe('keyStreamWithQueryRange', function() {
  before(setupFixtures)
  after(function(done) {
    removeRows(rowKeys, done)
  })

  it('should get key stream for secondary index query', function(done) {
    this.slow('.5s')

    var queryOpts = {
      bucket: bucket,
      start: '!',
      end: '~',
      indexKey: indexKey
    }
    var valueStream = client.keyStreamWithQueryRange(queryOpts)
    var dataSpy = sinon.spy(validateKeyStreamData())
    valueStream.on('data', dataSpy)
    valueStream.on('end', function() {
      expect(dataSpy.callCount).to.equal(rowKeys.length)
      done()
    })
  })

  it('should get 0 keys if secondary index query does not match', function(done) {
    this.slow('.5s')
    var start = 'z'
    var end = '~'
    var opts = {
      bucket: bucket,
      start: start,
      indexKey: indexKey,
      end: end
    }
    var stream = client.keyStreamWithQueryRange(opts)
    expect(stream).to.exist
    var dataSpy = sinon.spy(function() {})
    stream.on('data', dataSpy)
    stream.on('end', function() {
      expect(dataSpy.callCount).to.equal(0)
      done()
    })
  })

})

function removeRows(keys, cb) {
  q.all(keys.map(deleteKey)).nodeify(cb)
}

function deleteKey(key) {
  var opts = {
    key: key,
    bucket: bucket
  }
  return client.deleteWithKey(opts)
}

function setupFixtures(cb) {
  var startID = 20
  var endID = startID + numRows
  var rows = _.range(startID, endID).map(createRow)
  var promises = rows.map(saveRow)
  rows.reverse()
  q.all(promises).fail(failHandler).nodeify(cb)
}

function failHandler(err) {
  inspect(err, 'error')
  throw err
}

function saveRow(row) {
  var key = row.id
  var saveOpts = {
    bucket: bucket,
    key: key,
    value: row,
    indices: {}
  }
  saveOpts.indices[indexKey] = row.id
  return client.saveWithKey(saveOpts)
  .then(function() {
    rowKeys.push(key)
  })
}

function createRow(id) {
  var row = {
    id: id.toString(),
    timestamp: time.add('seconds', id).toString('YYYY-MM-DD HH:mm:ss.sss')
  }
  return row
}

function validateKeyStreamData() {
  var prevKey
  return function(key) {
    if (!prevKey) {
      prevKey = key
      return
    }
    if (key < prevKey) {
      inspect(key, 'key')
      inspect(prevKey, 'prevKey')
      throw new Error('keys are out of order')
    }
    prevKey = key
  }
}


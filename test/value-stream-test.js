var _ = require('lodash-node')
var expect = require('chai').expect
var sinon = require('sinon')
var q = require('q')
var moment = require('moment')

var time = moment()
var help = require('./test-helper')

var Client = help.require('./')
var client = new Client({})
var indexKey = 'value_stream_index'
var bucket = 'value_stream_test'
var integerIndexBucket = 'value_stream_integer_test'
var rowKeys = []

var numRows = 200

describe('valueStreamWithQueryRange', function() {

  this.timeout('5s')
  this.slow('3s')

  before(function(done) {
    setupFixtures(done)
  })

  after(function(done) {
    removeRows(rowKeys, done)
  })

  it('should get value stream in order', function(done) {
    var queryOpts = {
      bucket: bucket,
      start: '!',
      end: '~',
      indexKey: indexKey
    }
    var valueStream = client.valueStreamWithQueryRange(queryOpts)
    validateStream(valueStream, done)
  })

  it('should get value stream in order with integer secondary index type', function(done) {
    this.slow('1s')
    setupIntegerRows()
    .then(function() {
      var queryOpts = {
        bucket: integerIndexBucket,
        start: 0,
        end: 1000,
        indexKey: indexKey
      }
      var valueStream = client.valueStreamWithQueryRange(queryOpts)
      validateStream(valueStream, done)
    })
  })
})

function validateStream(valueStream, cb) {
  var prevID
  var dataSpy = sinon.spy(validateDataEvent)
  valueStream.on('data', dataSpy)
  valueStream.on('end', function() {
    expect(dataSpy.callCount).to.equal(numRows)
    cb()
  })
  valueStream.on('error', cb)

  function validateDataEvent(value) {
    expect(value).to.be.an('object')
    expect(value).to.have.ownProperty('id')
    expect(value).to.have.ownProperty('timestamp')
    var id = value.id
    if (!prevID) {
      prevID = id
      return
    }
    expect(id).to.be.above(prevID)
    prevID = id
  }
}

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
  var startID = 200
  var endID = startID + numRows
  var rows = _.range(startID, endID).map(createRow)
  var promise = client.bucketDeleteAll(bucket)
  promise.then(function() {
    return client.bucketDeleteAll(integerIndexBucket)
  })
  .then(function() {
    var promises = rows.map(saveRow)
    return q.all(promises)
  }).fail(help.failHandler).nodeify(cb)
}

function setupIntegerRows() {
  var startID = 600
  var endID = startID + numRows
  var rows = _.range(startID, endID).map(createRow)
  var promises = rows.map(saveIntegerRow)
  return q.all(promises)
}

function saveRow(row) {
  var key = row.id
  var saveOpts = {
    bucket: bucket,
    key: key,
    value: row,
    indices: {}
  }
  saveOpts.indices[indexKey] = row.id.toString()
  return client.saveWithKey(saveOpts)
  .then(function() {
    rowKeys.push(key)
  })
}

function saveIntegerRow(row) {
  var key = row.id
  var saveOpts = {
    bucket: integerIndexBucket,
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
    id: id,
    timestamp: time.add('seconds', id).toString('YYYY-MM-DD HH:mm:ss.sss')
  }
  return row
}

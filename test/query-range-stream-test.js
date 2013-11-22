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

describe('queryRangeStream', function() {

  this.timeout('5s')
  this.slow('3s')

  before(function(done) {
    setupFixtures(done)
  })

  after(function(done) {
    removeRows(rowKeys, done)
  })

  it('should get keys for binary query range in order when returnTerms = false', function(done) {
    var queryOpts = {
      bucket: bucket,
      start: '!',
      end: '~',
      indexKey: indexKey,
      returnTerms: false
    }
    var validateOpts = {
      queryOpts: queryOpts,
      resultType: 'string',
      numRowsExpected: numRows
    }

    validateStream(validateOpts, done)
  })

  it('should get keys and secondary index values for binary query range in order when returnTerms = true', function(done) {
    var queryOpts = {
      bucket: bucket,
      start: '!',
      end: '~',
      indexKey: indexKey,
      returnTerms: true
    }
    var validateOpts = {
      queryOpts: queryOpts,
      resultType: 'object',
      numRowsExpected: numRows
    }
    validateStream(validateOpts, done)
  })

  it('should get keys for integer query range in order', function(done) {
    setupIntegerRows()
    .then(function() {
      var queryOpts = {
        bucket: integerIndexBucket,
        start: 0,
        end: 1000,
        indexKey: indexKey
      }
      var validateOpts = {
        queryOpts: queryOpts,
        resultType: 'string',
        numRowsExpected: numRows
      }
      validateStream(validateOpts, done)
    })
  })

  it('should get keys and limit by maxResults', function(done) {
    setupIntegerRows()
    .then(function() {
      var maxResults = 10
      var queryOpts = {
        bucket: integerIndexBucket,
        start: 0,
        end: 1000,
        indexKey: indexKey,
        maxResults: maxResults
      }
      var validateOpts = {
        queryOpts: queryOpts,
        resultType: 'string',
        numRowsExpected: maxResults
      }
      validateStream(validateOpts, done)
    })
  })

})

function validateStream(opts, cb) {
  var stream = client.queryRangeStream(opts.queryOpts)
  var resultType = opts.resultType
  var dataSpy = sinon.spy(validateDataEvent)
  stream.on('data', dataSpy)
  stream.on('end', function() {
    expect(dataSpy.callCount).to.equal(opts.numRowsExpected)
    cb()
  })
  stream.on('error', cb)

  function validateDataEvent(data) {
    expect(data).to.be.a(resultType)
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
  var promise = cleanBuckets()
  promise.then(function() {
    var promises = rows.map(saveRow)
    return q.all(promises)
  }).fail(help.failHandler).nodeify(cb)
}

function cleanBuckets() {
  var promise = client.bucketDeleteAll(bucket)
  promise.then(function() {
    return client.bucketDeleteAll(integerIndexBucket)
  })
  return promise
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

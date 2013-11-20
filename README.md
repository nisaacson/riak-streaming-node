# Overview

Basic riak client that is fully streaming

[![Build Status](https://travis-ci.org/nisaacson/riak-streaming-node.png?branch=master)](https://travis-ci.org/nisaacson/riak-streaming-node) [![Dependency Status](https://david-dm.org/nisaacson/riak-streaming-node.png)](https://david-dm.org/nisaacson/riak-streaming-node) [![Code Climate](https://codeclimate.com/github/nisaacson/riak-streaming-node.png)](https://codeclimate.com/github/nisaacson/riak-streaming-node)

[![NPM](https://nodei.co/npm/riaks.png)](https://nodei.co/npm/riaks/)

**Table of Contents**

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
    - [bucketKeys](#bucketkeys)
    - [bucketKeysStream](#bucketkeysstream)
    - [bucketStream](#bucketstream)
    - [bucketDeleteAll](#bucketdeleteall)
    - [getWithKey](#getwithkey)
    - [saveWithKey](#savewithkey)
    - [deleteWithKey](#deletewithkey)
    - [keyStreamWithQueryRange](#keystreamwithqueryrange)
    - [valueStreamWithQueryRange](#valuestreamwithqueryrange)
    - [mapReduceStream](#mapreducestream)
    - [purgeDB](#purgedb)
- [Test](#test)

# Installation

```bash
npm install -S riaks
```

# Usage

```javascript
var Client = require('riak-streaming')
var opts = {
  host: 'localhost',
  protocol: 'http',
  port: '8098'
}

var client = new Client(opts)
```


# API

Once you have a client object, the following api is available

## bucketKeys

Get all keys from a bucket (returns a promise). According to Riak this should not be used in production since it is very slow

```javascript
var promise = client.bucketKeys(bucketName)
promise.then(function(keys) {
  console.dir(keys)
})
```

## bucketKeysStream

Get all the keys in a bucket, but stream them back as they come back from Riak

```javascript
var bucketKeysStream = client.bucketKeysStream(bucketName)
bucketKeysStream.on('data', function(key) {
  console.dir(key)
})
```

## bucketStream

Get a list of all buckets and stream back the bucket names as they come back from Riak

```javascript
var bucketStream = client.bucketStream()
bucketStream.on('data', function(bucketName) {
  console.dir(bucketName)
})

```

## bucketDeleteAll

delete all keys in a bucket (returns a promise)

```javascript
var promise = client.bucketDeleteAll(bucketName)
promise.then(function() {
  console.dir('bucket emptied')
})
```

## getWithKey

get value for key (returns a promise)

```javascript
var opts = {
  bucket: 'test_bucket',
  key: 'test_key'
}
var promise = client.getWithKey(opts)
promise.then(function(value) {
  // if key is not found value will be undefined
  console.dir(value)
})
```

## saveWithKey
save value for key with optionaly secondary indices(returns a promise). In the following example, we set two different secondary indices `test_index_one` with value `45` and `test_index_two` with value `foo`

```javascript
var opts = {
  bucket: 'test_bucket',
  key: 'test_key',
  indices: {
    test_index_one: '45'
    test_index_two: 'foo'
  },
  value: 'test_value_here'
}
var promise = client.saveWithKey(opts)
promise.then(function() {
  // if key is not found value will be undefined
  console.dir('key saved')
})
```

## deleteWithKey

delete a key in a given bucket, returning a promise

```javascript
var opts = {
  bucket: 'test_bucket',
  key: 'test_key'
}
var promise = client.deleteWithKey(opts)
promise.then(function() {
  // if key is not found value will be undefined
  console.dir('key deleted')
})
```

## keyStreamWithQueryRange

Get all keys that match a given secondary index query, where the keys are streamed one at a time as they come back from Riak. The appriate secondary index key suffix of `_bin` or `_int` will be appended as appropriate based on the type of value passed in the `start` field.

```javascript
var opts = {
  bucket: 'test_bucket',
  indexKey: 'test_index_key',
  start: '/x00'
  end: '/xff'
}
var keyQueryStream = client.keyStreamWithQueryRange(bucketName)
keyQueryStream.on('data', function(key) {
  console.dir(key)
})
```

## valueStreamWithQueryRange
Get all values that match a given secondary index query, where the values are streamed one at a time as they come back from Riak. The values are returned in sorted order based on the index key used. The appriate secondary index key suffix of `_bin` or `_int` will be appended as appropriate based on the type of value passed in the `start` field.

Using a binary index. Note the `start: '\x00'` value where `typeof '\xoo' !== 'number'`.
```javascript
var opts = {
  bucket: 'test_bucket',
  indexKey: 'test_index_binary_key',
  start: '/x00'
  end: '/xff'
}
var valueQueryStream = client.valueStreamWithQueryRange(bucketName)
valueQueryStream.on('data', function(value) {
  console.dir(value)
})
```

Using a integer index. Note the `start: 0` value where `typeof 0 === 'number'`.
```javascript
var opts = {
  bucket: 'test_bucket',
  indexKey: 'test_index_integer_key',
  start: 0,
  end: 100
}
var valueQueryStream = client.valueStreamWithQueryRange(bucketName)
valueQueryStream.on('data', function(value) {
  console.dir(value)
})
```

## mapReduceStream

Run mapreduce jobs with arbitrary javascript functions and stream back the results

```javascript
var opts = getMapReduceOpts()
var readStream = client.mapReduceStream(opts)
readStream.on('data', function(data) {
  console.dir(data)
})
readStream.on('error', function(err) {
  console.dir('mapReduce stream error', err)
  throw err
})

readStream.on('end', function() {
  console.dir('all mapreduce results streamed back and readStream closed')
})

function getMapReduceOpts() {
  var mapPhaseOpts = {
    map: {
      fn: mapFunction,
      keep: false,
      arg: 'foo'
    }
  }
  var reducePhaseOpts = {
    reduce: {
      fn: reduceFunction,
      keep: true,
      arg: 'foo'
    }
  }
  var mapReduceOpts = [mapPhaseOpts, reducePhaseOpts]
  var opts = {}
  var inputs = {
    bucket: 'test_bucket',
    index: 'test_index_key_bin',
    start: 'test_start',
    end: 'test_end'
  }
  opts.mapReduceOpts = mapReduceOpts,
  opts.inputs = inputs
  return opts
}

function mapFunction(value, keyData, arg) {
  var data = Riak.mapValuesJson(value)[0]
  var output = [data]
  return output
}

function reduceFunction(list) {
  // riak runs reduce jobs in batchs of 20. If this job is the result of a previous reduce, return it directly.
  // see http://stackoverflow.com/questions/16359656/riak-map-reduce-in-js-returning-limited-data/20058732
  if (typeof list === 'number') {
    return list
  }
  var sum = list.reduce(function(a, b) {
    a += b
    return a
   }, 0)
  return sum
}
```


## purgeDB

Completely clear out all buckets in Riak. (returns a promise)

```javascript
var promise = client.purgeDB()
promise.then(function() {
  console.log('All Riak buckets completely cleared')
})
```

# Test

Make sure you have riak running on the default port before running the test suite.

```bash
npm install
make test # or npm test
```


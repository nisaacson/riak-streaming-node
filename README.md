# Riak Streaming

Basic riak client that is fully streaming

[![Build Status](https://travis-ci.org/nisaacson/riak-streaming-node.png?branch=master)](https://travis-ci.org/nisaacson/riak-streaming-node)
[![Dependency Status](https://david-dm.org/nisaacson/riak-streaming-node.png)](https://david-dm.org/nisaacson/riak-streaming-node)
[![NPM](https://nodei.co/npm/riak-streaming.png)](https://nodei.co/npm/riak-streaming/)

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

// stream keys from a bucket (returns a stream)
var keyStream = client.bucketKeyStream(bucketName)
keyStream.on('data', function(key) {
  console.dir(key)
})

// stream all bucket names (returns a stream)
var bucketStream = client.bucketStream()
bucketStream.on('data', function(bucketName) {
  console.dir(bucketName)
})

// get value for key (returns a promise)
var opts = {
  bucket: 'test_bucket',
  key: 'test_key'
}
var promise = client.getWithKey(opts)
promise.then(function(value) {
  // if key is not found value will be undefined
  console.dir(value)
})

// save value for key (returns a promise)
var opts = {
  bucket: 'test_bucket',
  key: 'test_key',
  value: 'test_value_here'
}
var promise = client.saveWithKey(opts)
promise.then(function() {
  // if key is not found value will be undefined
  console.dir('key saved')
})

// delete with key (returns a promise)
var opts = {
  bucket: 'test_bucket',
  key: 'test_key'
}
var promise = client.deleteWithKey(opts)
promise.then(function() {
  // if key is not found value will be undefined
  console.dir('key deleted')
})

// query secondary index (returns a stream that emits keys)
var opts = {
  bucket: 'test_bucket',
  indexKey: 'test_index_key',
  start: '/x00'
  end: '/xff'
}
var queryKeyStream = client.bucketKeyStream(bucketName)
keyStream.on('data', function(key) {
  console.dir(key)
})
```

# Test

Make sure you have riak running on the default port before running the test suite.

```bash
npm install
make test # or npm test
```


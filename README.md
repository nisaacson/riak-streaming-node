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
    - [valueStreamWithQueryRange](#valuestreamwithqueryrange)
    - [queryRangeStream](#queryrangestream)
    - [mapReduceStream](#mapreducestream)
    - [purgeDB](#purgedb)
- [Test](#test)

# Installation

```bash
npm install -S riaks
```

# Usage

The client supports both the riak `http` interface as well as `protocol buffers`. Specify the interface you wish to use via the `protocol` parameter in the configuration option.  The api of the resulting client object is the same regardless of which protocol is used.


* http Client

```javascript
var Client = require('riaks')
var opts = {
  host: 'localhost',
  protocol: 'http',
  port: 8098
}

var client = new Client(opts)
```


* protocol buffer client. Use the `protocol: 'protobuf` setting.

```javascript
var Client = require('riaks')
var opts = {
  host: 'localhost',
  protocol: 'protobuf',
  port: 8087
}

var client = new Client(opts)
```

* https Client. If you want all traffic to be encrypted over https, use the `protocol: 'https'` setting

```javascript
var Client = require('riaks')
var opts = {
  host: 'localhost',
  protocol: 'https',
  port: 443
}

var client = new Client(opts)
```



# API

Once you have a client object, the following api is available

## bucketKeys

Get all keys from a bucket (returns a promise). According to Riak this should not be used in production since it is very slow

```javascript
var opts = {
  bucket: 'test_bucket_name' // name of the bucket to look in
}
var promise = client.bucketKeys(opts)
promise.then(function(keys) {
  console.dir(keys)
})
```

## bucketKeysStream

Get all the keys in a bucket, but stream them back as they come back from Riak

```javascript
var opts = {
  bucket: 'test_bucket_name' // name of the bucket to look in
}
var keyStream = client.bucketKeysStream(opts)
keyStream.on('data', function(key) {
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
var opts = {
  bucket: 'test_bucket', // name of bucket
  concurrency: 5 // optional, limits max number of simultanous delete requests to riak
}
var promise = client.bucketDeleteAll(opts)
promise.then(function() {
  console.dir('bucket emptied')
})
```

## getWithKey

Get value for key (returns a promise).

If the object was saved with `content-type: application/json`, the client will call JSON.parse and return an actual javascript object.

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

If you need both the value as well as the secondary index key value pairs, specify the `returnMeta: true` parameter.

```javascript
var opts = {
  bucket: 'test_bucket',
  key: 'test_key',
  returnMeta: true // optional, return 2i indexes, headers, etc
}
var promise = client.getWithKey(opts)
promise.then(function(reply) {
  // note that reply is null if no key-value pair exists in riak
  var value = reply.value
  console.dir(value)

  var indices = reply.indices
  console.dir(indices)
})
```

In the example above, the reply from getWithKey will look like

```javascript
{
  value: { foo: 'bar'}, // actual javascript object but stored as json in riak
  indices: [
    {
      key: 'first_index_bin',
      value: 'first index value here'
    },
    {
      key: 'second_index_bin',
      value: 'second index value here'
    }
  ]
}
```

## saveWithKey
save value for key with optionaly secondary indices(returns a promise). In the following example, we set two different secondary indices `test_index_one` with value `45` and `test_index_two` with value `foo`

* String value

```javascript
var opts = {
  bucket: 'test_bucket',
  key: 'test_key',
  indices: {
    test_index_one: '45'
    test_index_two: 'foo'
  },
  returnBody: true, // (optional) whether to return the contents of the stored object. defaults to false
  value: 'test_value_here'
}
var promise = client.saveWithKey(opts)
promise.then(function() {
  // if key is not found value will be undefined
  console.dir('key saved')
})
```

* Object value. `JSON.stringify` will be called on the value before it is saved to riak and the header `content-type: application/json` header will be applied. When you get this value back from riak via the `client.getWithKey` method, `JSON.parse` will be called so you receive an actual object back.

```javascript
var opts = {
  bucket: 'test_bucket',
  key: 'test_key',
  indices: {
    test_index_one: '45'
    test_index_two: 'foo'
  },
  returnBody: true, // (optional) whether to return the contents of the stored object. defaults to false
  value: { foo: 'bar' }
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

## queryRangeStream

Stream back keys from a secondary index query. The appriate suffix of either `_int` or `_bin` will appended to the index key based on the type of value in the `start` field. This maps the to [http://docs.basho.com/riak/latest/dev/references/http/secondary-indexes/](http://docs.basho.com/riak/latest/dev/references/http/secondary-indexes/) http interface in Riak.

If you want the secondary index values in the output, specify `returnTerms: true` in the options object. Note that the `returnTerms` corresponds to `return_terms` in the riak http options.

If you want limit the number of results returned, specify `maxResults: <integer value`. The `maxResults` options maps the riak `max_results` url parameter.

* Keys only

```javascript
var opts = {
  bucket: 'test_bucket',
  indexKey: 'test_index_key', // `_bin` or `_int` suffix automatically added based on start value type
  start: '/x00',
  end: '/xff',
  returnTerms: false, // false by default if not specified
  maxResults: 10 // optional, limits the number of results returned
}
var keyStream = client.queryRangeStream(opts)
keyStream.on('data', function(key) {
  console.dir(key)
})
```

* Keys And Index values

```javascript
var inspect = require('eyespect').inspector()
var opts = {
  bucket: 'test_bucket',
  indexKey: 'test_index_key', // `_bin` or `_int` suffix automatically added based on start value type
  start: '/x00',
  end: '/xff',
  returnTerms: true, // false by default if not specified
  maxResults: 10 // optional, limits the number of results returned
}
var keyStream = client.queryRangeStream(opts)
keyStream.on('data', function(data) {
  var dataKeys = Object.keys(data)
  var key = dataKeys[0]
  var value = dataKeys[key]
  inspect(key, 'got key')
  inspect(value, 'matched secondary index value')
})
```

## mapReduceStream

Run mapreduce jobs with arbitrary javascript functions and stream back the results. In the example below, the actual javascript functions for the map and reduce phase as passed in as paramters. The client will handle stringifying these functions before sending the `mapred` request to riak.

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
  var opts = {}
  var query = [mapPhaseOpts, reducePhaseOpts]

  // use a secondary index query as an input to the map reduce job
  var inputs = {
    bucket: 'test_bucket',
    index: 'test_index_key_bin',
    start: 'test_start',
    end: 'test_end'
  }
  opts.query = query
  opts.inputs = inputs
  opts.timeout = 1000 // optional, set to 1000 milliseconds timeout or 1 second
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

To make testing easier, a `Vagrantfile` is included in the root of this repo. Bringing up this virtual machine will install the required dependencies so that you can test the riaks client without having to install nodejs and riak on your local machine.

```bash
vagrant up --provision
vagrant ssh
cd /vagrant
npm install
npm test
```

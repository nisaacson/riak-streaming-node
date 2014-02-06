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
    - [search](#search)
    - [searchStream](#searchStream)
    - [valueStreamWithQueryRange](#valuestreamwithqueryrange)
    - [queryRangeStream](#queryrangestream)
    - [mapReduceStream](#mapreducestream)
    - [purgeDB](#purgedb)
    - [disconnect](#disconnect)
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
  port: 8098,
  timeout: 10000 // optional
}

var client = new Client(opts)
```


* protocol buffer client. Use the `protocol: 'protobuf'` setting.

```javascript
var Client = require('riaks')
var opts = {
  host: 'localhost',
  protocol: 'protobuf',
  port: 8087,
  timeout: 10000 // optional
}

var client = new Client(opts)
```

* https Client. If you want all traffic to be encrypted over https, use the `protocol: 'https'` setting

```javascript
var Client = require('riaks')
var opts = {
  host: 'localhost',
  protocol: 'https',
  port: 443,
  timeout: 10000 // optional
}

var client = new Client(opts)
```

Aftter the client is created, you can verify the connection to the riak server is valid by calling the `connect` method on the client. This returns a promise which is resolved after the client succesfully communicates with the riak server and gets a response back.

```javascript
var promise = client.connect()
promise.then(connectHandler).fail(failHandler)

function connectHandler() {
  console.log('client connected correctly')
}

function failHandler(err) {
  console.error('connection failed')
  console.error(err)
  throw err
}
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

## [[save]]
save value with optionaly secondary indices(returns a promise). In the following example, we set two different secondary indices `test_index_one` with value `45` and `test_index_two` with value `foo`

If a key is included in the options, this method will select a `PUT` for
the HTTP verb, otherwise it will use a `POST` and get a random key from
Riak.

* String value

```javascript
var opts = {
  bucket: 'test_bucket',
  key: 'test_key', //Forces `PUT` for http communication
  indices: {
    test_index_one: '45'
    test_index_two: 'foo'
  },
  returnBody: true, // (optional) whether to return the contents of the stored object. defaults to false
  value: 'test_value_here'
}
var promise = client.save(opts)
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
var promise = client.save(opts)
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

## search

Search via the solr-compatible interface.

[riak reference](http://docs.basho.com/riak/latest/dev/using/search/#Query-Interfaces)

```javascript
var opts = {
  index: bucket,
  q: 'value_*', // query
  df: 'bar',    // default field
  start: 0,
  rows: 1,      // limit number of results
  sort: 'bar',
  filter: '',
  presort: 'key',
}
var promise = client.search(opts)
promise.then(function (reply) {
  console.dir(reply)
})
```

The reply object in the example above will look like

```
{
  numFound: 4,
  start: 0,
  maxScore: '0.00000e+0',
  docs: [
    {
      id: '1_key',
      index: 'http_test',
      fields: { bar: 'value_1' },
      props: {}
    }
  ]
}
```

## searchStream

Search via the solr-compatible interface and automatically search over paginated results via streaming interface

[riak reference](http://docs.basho.com/riak/latest/dev/using/search/#Query-Interfaces)

```javascript
var opts = {
  index: bucket,
  q: 'value_*', // query
  df: 'bar',    // default field
  start: 0,
  rows: 1,      // limit number of results per page, (optional, defaults to 20)
  maxRows: 20   // end the stream when reached, if not set client will stream all matching results
  sort: 'bar',
  filter: '',
  presort: 'key',
}
var readStream = client.searchStream(opts)
readStream.on('data', function dataHandler(reply) {
  console.dir(reply)
})
readStream.on('finish', function finishHandler() {
  console.log('got all rows from search stream')
})
```

The reply object in the `dataHandler` function in the example above will look like

```
{
  id: '1_key',
  index: 'http_test',
  fields: { bar: 'value_1' },
  props: {}
}
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
  var key = data.key
  var value = data.value
  inspect(key, 'secondary index value')
  inspect(value, 'key for key->value pair in riak')
})
```

The data objects emitted by the stream in the above example look like

```javascript
{
  key: 'secondary index value'
  value: 'key to actual object stored in riak'
}
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

## disconnect

Close existing open connects to riak server. This is really only needed for the `protobuf` protocol option, and is a `no-op` for the `http` protocol option to maintain a consistent public api.

```javascript
client.disconnect()
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

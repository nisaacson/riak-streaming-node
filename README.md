# Riak Streaming

Basic riak client that is fully streaming


# Installation

```bash
# not yet published to npm, install from github for now
# npm install -S riak-streaming-node
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

// deletefor key (returns a promise)
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

# Test

Make sure you have riak running on the default port before running the test suite.

```bash
npm install
make test # or npm test
```


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
// stream keys from a bucket
var keyStream = client.bucketKeyStream(bucketName)
keyStream.on('data', function(key) {
  console.dir(key)
})

// stream all bucket names
var bucketStream= client.bucketStream()
bucketStream.on('data', function(bucketName) {
  console.dir(bucketName)
})
```

# Test

Make sure you have riak running on the default port before running the test suite.

```bash
npm install
make test # or npm test
```

